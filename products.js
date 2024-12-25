const gameProducts = {
  pubg: [
    { name: '60 شدة', price: 50 },
    { name: '325 شدة', price: 230 },
    { name: '660 شدة', price: 450 }
  ],
  freefire: [
    { name: '80 جوهرة', price: 60 },
    { name: '300 جوهرة', price: 210 },
    { name: '700 جوهرة', price: 460 }
  ],
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const selectedGame = params.get('game');
  const productsContainer = document.getElementById('products-container');

  if (selectedGame && gameProducts[selectedGame]) {
    gameProducts[selectedGame].forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('product');
      productDiv.innerHTML = `
        <h3>${product.name}</h3>
        <p>السعر: <span class="unit-price">${product.price}</span> جنيه</p>
        <select class="quantity-select" onchange="updatePrice(this, ${product.price}, '${product.name}')">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <button onclick="openPaymentModal('${product.name}', ${product.price}, 1)">شراء الآن</button>
      `;
      productsContainer.appendChild(productDiv);
    });
  } else {
    productsContainer.innerHTML = '<p>لم يتم العثور على منتجات لهذه اللعبة.</p>';
  }
});

function updatePrice(selectElement, unitPrice, productName) {
  const quantity = parseInt(selectElement.value);
  const totalPrice = unitPrice * quantity;
  const productDiv = document.querySelector(`button[onclick="openPaymentModal('${productName}', ${unitPrice}, 1)"]`).parentElement;
  const priceDisplay = productDiv.querySelector('p');
  priceDisplay.innerHTML = `السعر: ${totalPrice} جنيه`;
}

function openPaymentModal(productName, price, quantity) {
  const totalPrice = price * quantity;
  document.getElementById('selected-product').textContent = `المنتج: ${productName}`;
  document.getElementById('total-price').textContent = `السعر: ${totalPrice} جنيه`;
  document.getElementById('payment-modal').classList.remove('hidden');

  // إخفاء جميع الأقسام أولاً
  document.querySelectorAll('.payment-section').forEach(section => {
    section.classList.remove('active');  // إخفاء جميع الأقسام
  });
}

function closeModal() {
  document.getElementById('payment-modal').classList.add('hidden');
}

function selectPaymentMethod(method) {
  // إخفاء جميع الأقسام
  document.querySelectorAll('.payment-section').forEach(section => {
    section.classList.remove('active');  // إخفاء جميع الأقسام
  });

  // إظهار القسم الخاص بالطريقة المختارة
  const selectedSection = document.getElementById(`${method}-section`);
  if (selectedSection) {
    selectedSection.classList.add('active');  // إظهار القسم النشط
  }
}

function confirmPayment(paymentMethod) {
  alert(`تم تأكيد الدفع عبر ${paymentMethod}`);
  closeModal();  // إغلاق الـ Modal بعد تأكيد الدفع
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => alert(`تم نسخ النص: ${text}`));
}
