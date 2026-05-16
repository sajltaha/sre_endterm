async function loadOrders() {
  const health = await apiRequest('/services/health');
  const orderHealth = health.services.find((service) => service.name === 'order-service');
  document.getElementById('order-health').innerHTML = `Order service: ${badge(orderHealth?.status || 'UNKNOWN')}`;
  const orders = await apiRequest('/api/orders');
  document.getElementById('orders-table').innerHTML = orders.map((order) => `
    <tr>
      <td>${order.id}</td><td>${order.userId}</td><td>${order.productId}</td><td>${order.quantity}</td>
      <td>${badge(order.status)}</td><td>${order.createdAt || '-'}</td>
    </tr>
  `).join('');
}

document.getElementById('order-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        userId: Number(form.get('userId')),
        productId: Number(form.get('productId')),
        quantity: Number(form.get('quantity'))
      })
    });
    showMessage('order-message', 'Order created. A payment was created by the order-service workflow.');
    event.target.reset();
    await loadOrders();
  } catch (error) {
    showMessage('order-message', `Order failed: ${error.message}`, true);
    await loadOrders().catch(() => {});
  }
});

document.getElementById('refresh-orders')?.addEventListener('click', () => loadOrders().catch((error) => showMessage('order-message', error.message, true)));
document.addEventListener('DOMContentLoaded', () => loadOrders().catch((error) => showMessage('order-message', error.message, true)));

