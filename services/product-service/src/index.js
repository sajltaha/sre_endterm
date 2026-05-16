const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3002;
const serviceName = process.env.SERVICE_NAME || 'product-service';
const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Keyboard', price: 80 },
  { id: 3, name: 'Monitor', price: 300 }
];

client.collectDefaultMetrics({ prefix: `${serviceName.replace(/-/g, '_')}_` });
const httpRequests = new client.Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['service', 'method', 'route', 'status'] });
const httpDuration = new client.Histogram({ name: 'http_request_duration_seconds', help: 'HTTP request duration in seconds', labelNames: ['service', 'method', 'route', 'status'], buckets: [0.005,0.01,0.025,0.05,0.1,0.2,0.5,1,2] });
const healthGauge = new client.Gauge({ name: 'service_health', help: 'Service health status, 1 means healthy', labelNames: ['service'] });
healthGauge.set({ service: serviceName }, 1);

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
app.get('/health', (req, res) => res.json({ service: serviceName, status: 'healthy' }));
app.get('/products', (req, res) => res.json(products));
app.get('/products/:id', (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'product not found' });
  res.json(product);
});
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required' });
  const product = { id: products.length + 1, name, price: Number(price), stock: Number(req.body.stock || 10) };
  products.push(product);
  res.status(201).json(product);
});
app.put('/products/:id', (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'product not found' });
  const { name, price, stock } = req.body;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  res.json(product);
});
app.delete('/products/:id', (req, res) => {
  const index = products.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'product not found' });
  const [deleted] = products.splice(index, 1);
  res.json({ deleted });
});
app.get('/metrics', async (req, res) => { res.set('Content-Type', client.register.contentType); res.end(await client.register.metrics()); });
app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'internal server error' }); });
app.listen(port, () => console.log(`${serviceName} listening on ${port}`));
