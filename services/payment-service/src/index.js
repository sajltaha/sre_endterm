const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3004;
const serviceName = process.env.SERVICE_NAME || 'payment-service';
const payments = [];

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
app.get('/payments', (req, res) => res.json(payments));
app.post('/payments', (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || amount === undefined) return res.status(400).json({ error: 'orderId and amount are required' });
  const payment = { id: payments.length + 1, orderId, amount: Number(amount), status: req.body.status || 'paid', createdAt: new Date().toISOString() };
  payments.push(payment);
  res.status(201).json(payment);
});
app.get('/payments/:id', (req, res) => {
  const payment = payments.find((item) => item.id === Number(req.params.id));
  if (!payment) return res.status(404).json({ error: 'payment not found' });
  res.json(payment);
});
app.get('/metrics', async (req, res) => { res.set('Content-Type', client.register.contentType); res.end(await client.register.metrics()); });
app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'internal server error' }); });
app.listen(port, () => console.log(`${serviceName} listening on ${port}`));
