async function loadUsers() {
  const users = await apiRequest('/api/auth/users');
  document.getElementById('users-table').innerHTML = users.map((user) => `
    <tr>
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td><code>${user.password}</code></td>
    </tr>
  `).join('');
}

document.getElementById('register-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password')
      })
    });
    showMessage('auth-message', `Registered user ${result.username}.`);
    event.target.reset();
    await loadUsers();
  } catch (error) {
    showMessage('auth-message', error.message, true);
  }
});

document.getElementById('login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password')
      })
    });
    document.getElementById('login-result').innerHTML = `
      <div class="message">
        Login successful. Demo token: <code>${result.token}</code>, userId: <code>${result.userId}</code>
      </div>
    `;
  } catch (error) {
    showMessage('auth-message', error.message, true);
  }
});

document.addEventListener('DOMContentLoaded', () => loadUsers().catch((error) => showMessage('auth-message', error.message, true)));
