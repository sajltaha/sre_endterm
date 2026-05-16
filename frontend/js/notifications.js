async function loadNotifications() {
  const notifications = await apiRequest('/api/notifications');
  document.getElementById('notifications-table').innerHTML = notifications.map((item) => `
    <tr><td>${item.id}</td><td>${item.userId}</td><td>${item.type}</td><td>${item.message}</td><td>${item.createdAt || '-'}</td></tr>
  `).join('');
}

document.getElementById('notification-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await apiRequest('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ userId: Number(form.get('userId')), type: form.get('type'), message: form.get('message') })
    });
    showMessage('notification-message', 'Notification sent.');
    event.target.reset();
    await loadNotifications();
  } catch (error) {
    showMessage('notification-message', error.message, true);
  }
});

document.addEventListener('DOMContentLoaded', () => loadNotifications().catch((error) => showMessage('notification-message', error.message, true)));

