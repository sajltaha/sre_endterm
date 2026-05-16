const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3003;
const serviceName = process.env.SERVICE_NAME || 'order-service';
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';
const orders = [];

client.collectDefaultMetrics({ prefix: `${serviceName.replace(/-/g, '_')}_` });
const httpRequests = new client.Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['service', 'method', 'route', 'status'] });
const httpDuration = new client.Histogram({ name: 'http_request_duration_seconds', help: 'HTTP request duration in seconds', labelNames: ['service', 'method', 'route', 'status'], buckets: [0.005,0.01,0.025,0.05,0.1,0.2,0.5,1,2] });
const healthGauge = new client.Gauge({ name: 'service_health', help: 'Service health status, 1 means healthy', labelNames: ['service'] });

function isFailed() {
  return String(process.env.FAIL_ORDER_SERVICE).toLowerCase() === 'true';
}

app.use(express.json());
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    console.log(`${new Date().toISOString()} ${serviceName} ${req.method} ${req.originalUrl} ${res.statusCode}`);
    httpRequests.inc({ service: serviceName, method: req.method, route, status: String(res.statusCode) });
    httpDuration.observe({ service: serviceName, method: req.method, route, status: String(res.statusCode) }, duration);
  });
  next();
});

app.get('/health', (req, res) => {
  const failed = isFailed();
  healthGauge.set({ service: serviceName }, failed ? 0 : 1);
  if (failed) return res.status(500).json({ service: serviceName, status: 'unhealthy', reason: 'FAIL_ORDER_SERVICE=true' });
  res.json({ service: serviceName, status: 'healthy' });
});

app.get('/orders', (req, res) => res.json(orders));
app.get('/orders/:id', (req, res) => {
  const order = orders.find((item) => item.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'order not found' });
  res.json(order);
});
app.post('/orders', async (req, res) => {
  if (isFailed()) {
    healthGauge.set({ service: serviceName }, 0);
    return res.status(503).json({ error: 'order service is intentionally failed for incident simulation' });
  }
  const { productId, quantity, userId } = req.body;
  if (!productId || !quantity || !userId) return res.status(400).json({ error: 'productId, quantity and userId are required' });

  const productResponse = await fetch(`${productServiceUrl}/products/${productId}`);
  if (!productResponse.ok) return res.status(400).json({ error: 'product validation failed' });
  const product = await productResponse.json();
  const amount = Number(product.price) * Number(quantity);

  const paymentResponse = await fetch(`${paymentServiceUrl}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: orders.length + 1, amount })
  });
  if (!paymentResponse.ok) return res.status(502).json({ error: 'payment service failed' });
  const payment = await paymentResponse.json();

  const order = { id: orders.length + 1, userId, productId, quantity, amount, paymentId: payment.id, status: 'created', createdAt: new Date().toISOString() };
  orders.push(order);
  healthGauge.set({ service: serviceName }, 1);
  res.status(201).json(order);
});
app.put('/orders/:id/status', (req, res) => {
  const order = orders.find((item) => item.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'order not found' });
  if (!req.body.status) return res.status(400).json({ error: 'status is required' });
  order.status = req.body.status;
  res.json(order);
});
app.delete('/orders/:id', (req, res) => {
  const index = orders.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'order not found' });
  const [deleted] = orders.splice(index, 1);
  res.json({ deleted });
});
app.get('/metrics', async (req, res) => {
  healthGauge.set({ service: serviceName }, isFailed() ? 0 : 1);
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});
app.listen(port, () => console.log(`${serviceName} listening on ${port}`));
