const API_BASE = 'http://localhost:3000';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof body === 'string' ? body : body.error || 'Request failed';
    throw new Error(message);
  }
  return body;
}

function badge(status) {
  const normalized = String(status || '').toLowerCase();
  return `<span class="badge ${normalized}">${status}</span>`;
}

function showMessage(id, text, isError = false) {
  const element = document.getElementById(id);
  if (!element) return;
  element.className = `message${isError ? ' error' : ''}`;
  element.textContent = text;
  element.hidden = false;
}

