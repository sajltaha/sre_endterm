async function loadHealth() {
  const target = document.getElementById('health-cards') || document.getElementById('services-table');
  if (!target) return;
  try {
    const data = await apiRequest('/services/health');
    if (target.id === 'health-cards') {
      target.innerHTML = data.services.map((service) => `
        <div class="card">
          <h3>${service.name}</h3>
          <p>${badge(service.status)}</p>
          <p>${service.url}</p>
        </div>
      `).join('');
    } else {
      target.innerHTML = data.services.map((service) => `
        <tr>
          <td>${service.name}</td>
          <td>${badge(service.status)}</td>
          <td>${service.statusCode || '-'}</td>
          <td><code>${service.url}</code></td>
        </tr>
      `).join('');
    }
  } catch (error) {
    target.innerHTML = `<div class="message error">Unable to load service health: ${error.message}</div>`;
  }
}

document.getElementById('refresh-health')?.addEventListener('click', loadHealth);
document.addEventListener('DOMContentLoaded', loadHealth);

