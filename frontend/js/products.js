async function loadProducts() {
  const products = await apiRequest('/api/products');
  document.getElementById('products-table').innerHTML = products.map((product) => `
    <tr>
      <td>${product.id}</td><td>${product.name}</td><td>${product.price}</td><td>${product.stock ?? '-'}</td>
    </tr>
  `).join('');
}

document.getElementById('product-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        price: Number(form.get('price')),
        stock: Number(form.get('stock'))
      })
    });
    showMessage('product-message', 'Product created successfully.');
    event.target.reset();
    await loadProducts();
  } catch (error) {
    showMessage('product-message', error.message, true);
  }
});

document.addEventListener('DOMContentLoaded', () => loadProducts().catch((error) => showMessage('product-message', error.message, true)));

