async function loadProfiles() {
  const profiles = await apiRequest('/api/profiles');
  document.getElementById('profiles-table').innerHTML = profiles.map((profile) => `
    <tr><td>${profile.id}</td><td>${profile.name}</td><td>${profile.email}</td><td>${profile.address || '-'}</td></tr>
  `).join('');
}

document.getElementById('profile-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await apiRequest('/api/profiles', {
      method: 'POST',
      body: JSON.stringify({ name: form.get('name'), email: form.get('email'), address: form.get('address') })
    });
    showMessage('profile-message', 'Profile created.');
    event.target.reset();
    await loadProfiles();
  } catch (error) {
    showMessage('profile-message', error.message, true);
  }
});

document.addEventListener('DOMContentLoaded', () => loadProfiles().catch((error) => showMessage('profile-message', error.message, true)));

