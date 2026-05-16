async function loadPayments() {
  const payments = await apiRequest('/api/payments');
  document.getElementById('payments-table').innerHTML = payments.map((payment) => `
    <tr><td>${payment.id}</td><td>${payment.orderId}</td><td>${payment.amount}</td><td>${badge(payment.status)}</td><td>${payment.createdAt || '-'}</td></tr>
  `).join('');
}

document.getElementById('payment-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await apiRequest('/api/payments', {
      method: 'POST',
      body: JSON.stringify({ orderId: Number(form.get('orderId')), amount: Number(form.get('amount')) })
    });
    showMessage('payment-message', 'Payment created successfully.');
    event.target.reset();
    await loadPayments();
  } catch (error) {
    showMessage('payment-message', error.message, true);
  }
});

document.addEventListener('DOMContentLoaded', () => loadPayments().catch((error) => showMessage('payment-message', error.message, true)));

