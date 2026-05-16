const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;
const serviceName = process.env.SERVICE_NAME || 'api-gateway';
const routes = [
  { prefix: '/api/auth', target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001', stripPrefix: true },
  { prefix: '/api/products', target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002', stripPrefix: true, basePath: '/products' },
  { prefix: '/api/orders', target: process.env.ORDER_SERVICE_URL || 'http://order-service:3003', stripPrefix: true, basePath: '/orders' },
  { prefix: '/api/payments', target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004', stripPrefix: true, basePath: '/payments' },
  { prefix: '/api/notifications', target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005', stripPrefix: true, basePath: '/notifications' },
  { prefix: '/api/profiles', target: process.env.USER_PROFILE_SERVICE_URL || 'http://user-profile-service:3006', stripPrefix: true, basePath: '/profiles' },
  { prefix: '/products', target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002', stripPrefix: false },
  { prefix: '/orders', target: process.env.ORDER_SERVICE_URL || 'http://order-service:3003', stripPrefix: false },
  { prefix: '/payments', target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004', stripPrefix: false },
  { prefix: '/notifications', target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005', stripPrefix: false },
  { prefix: '/profiles', target: process.env.USER_PROFILE_SERVICE_URL || 'http://user-profile-service:3006', stripPrefix: false }
];
const serviceHealthTargets = [
  { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001' },
  { name: 'product-service', url: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002' },
  { name: 'order-service', url: process.env.ORDER_SERVICE_URL || 'http://order-service:3003' },
  { name: 'payment-service', url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004' },
  { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005' },
  { name: 'user-profile-service', url: process.env.USER_PROFILE_SERVICE_URL || 'http://user-profile-service:3006' }
];

client.collectDefaultMetrics({ prefix: 'api_gateway_' });
const httpRequests = new client.Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['service', 'method', 'route', 'status'] });
const httpDuration = new client.Histogram({ name: 'http_request_duration_seconds', help: 'HTTP request duration in seconds', labelNames: ['service', 'method', 'route', 'status'], buckets: [0.005,0.01,0.025,0.05,0.1,0.2,0.5,1,2] });
const healthGauge = new client.Gauge({ name: 'service_health', help: 'Service health status, 1 means healthy', labelNames: ['service'] });
healthGauge.set({ service: serviceName }, 1);

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
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
app.get('/services/health', async (req, res) => {
  const services = await Promise.all(serviceHealthTargets.map(async (target) => {
    const healthUrl = `${target.url}/health`;
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(2500) });
      return {
        name: target.name,
        status: response.ok ? 'UP' : 'DOWN',
        url: healthUrl,
        statusCode: response.status
      };
    } catch (error) {
      return { name: target.name, status: 'DOWN', url: healthUrl, error: error.message };
    }
  }));
  res.json({ services });
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(async (req, res) => {
  const route = routes.find((item) => req.path === item.prefix || req.path.startsWith(`${item.prefix}/`));
  if (!route) return res.status(404).json({ error: 'gateway route not found' });
  let upstreamPath = req.originalUrl;
  if (route.stripPrefix) {
    const stripped = req.originalUrl.replace(route.prefix, '') || '';
    upstreamPath = `${route.basePath || ''}${stripped}` || '/';
  }
  const targetUrl = `${route.target}${upstreamPath}`;
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: 'upstream service unavailable' });
  }
});

app.listen(port, () => console.log(`${serviceName} listening on ${port}`));
