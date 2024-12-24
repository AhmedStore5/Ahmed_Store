// JavaScript لتبديل الوضع بين Dark و Light Mode
function toggleMode() {
  const body = document.body;
  const currentMode = body.classList.contains('light-mode') ? 'light' : 'dark';

  // تبديل الوضع بناءً على الوضع الحالي
  if (currentMode === 'dark') {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
    document.getElementById('toggle-mode').innerText = '🌙'; // تغيير أيقونة الزر لوضع النهار
  } else {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    document.getElementById('toggle-mode').innerText = '🌞'; // تغيير أيقونة الزر لوضع الليل
  }

  // حفظ الوضع الجديد في localStorage
  const newMode = body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
  localStorage.setItem('mode', newMode);
}

// التأكد من استعادة الوضع المحفوظ عند تحميل الصفحة
window.onload = () => {
  const savedMode = localStorage.getItem('mode');
  if (savedMode) {
    document.body.classList.add(savedMode);
    document.getElementById('toggle-mode').innerText = savedMode === 'light-mode' ? '🌙': '🌞';
  }

  // إضافة التأثير التدريجي عند ظهور المنتجات باستخدام IntersectionObserver
  const productCards = document.querySelectorAll(".product-card");
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // توقف عن المراقبة بعد الظهور
        }
      });
    },
    { threshold: 0.1 } // ظهور العنصر بنسبة 10%
  );
  productCards.forEach(card => observer.observe(card));

  // إعادة تشغيل الصور المتحركة تلقائيًا في البنر
  const bannerImages = document.querySelector(".banner-images");
  bannerImages.addEventListener("animationiteration", () => {
    bannerImages.style.animation = "none";
    void bannerImages.offsetWidth; // تفعيل إعادة التدفق
    bannerImages.style.animation = "";
  });
};

// وظيفة البحث في المنتجات
function searchProducts() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const products = document.querySelectorAll(".product-card");
  let resultsFound = false;

  // تصفية المنتجات بناءً على البحث
  products.forEach(product => {
    const productName = product.querySelector("h2").textContent.toLowerCase();
    if (productName.includes(query)) {
      product.style.display = "block";
      resultsFound = true;
    } else {
      product.style.display = "none";
    }
  });

  // عرض رسالة في حال عدم العثور على نتائج
  const noResultsMessage = document.getElementById("no-results-message");
  if (!resultsFound) {
    if (!noResultsMessage) {
      const message = document.createElement("p");
      message.id = "no-results-message";
      message.textContent = "لم يتم العثور على نتائج تتوافق مع بحثك.";
      document.querySelector(".products").prepend(message);
    }
  } else {
    const message = document.getElementById("no-results-message");
    if (message) message.remove();
  }
}

// إظهار زر العودة للأعلى عند التمرير
window.onscroll = function() {
  const backToTopButton = document.getElementById("back-to-top");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
};

// وظيفة للعودة للأعلى عند النقر على الزر
document.getElementById("back-to-top").onclick = function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// دالة لتبديل ظهور القائمة الجانبية
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('visible');
}


const imagesContainer = document.querySelector('.banner-images');
const images = document.querySelectorAll('.banner-images img');
const dots = document.querySelectorAll('.banner-dots .dot');

let currentIndex = 0;
let startX = 0;
let moveX = 0;
let isDragging = false;

/* Update Slider Position */
function updateSlider(index) {
  imagesContainer.style.transition = 'transform 0.5s ease-in-out'; // حركة سلسة
  imagesContainer.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach(dot => dot.classList.remove('active'));
  dots[index % images.length].classList.add('active'); // تحديث النقاط
}

/* Handle Loop Effect */
function handleLoop() {
  if (currentIndex >= images.length) {
    imagesContainer.style.transition = 'none'; // إزالة الحركة مؤقتًا
    imagesContainer.style.transform = 'translateX(0)';
    currentIndex = 0;
  } else if (currentIndex < 0) {
    imagesContainer.style.transition = 'none'; // إزالة الحركة مؤقتًا
    imagesContainer.style.transform = `translateX(-${(images.length - 1) * 100}%)`;
    currentIndex = images.length - 1;
  }
}

/* Start Automatic Sliding */
let slideInterval = setInterval(() => {
  currentIndex++;
  updateSlider(currentIndex);
  setTimeout(handleLoop, 500);
}, 3000); // تحريك تلقائي كل 3 ثوانٍ

/* Touch Start Event */
imagesContainer.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
  clearInterval(slideInterval); // إيقاف التحريك التلقائي أثناء السحب
});

/* Touch Move Event */
imagesContainer.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  moveX = e.touches[0].clientX - startX;
  imagesContainer.style.transform = `translateX(calc(-${currentIndex * 100}% + ${moveX}px))`;
});

/* Touch End Event */
imagesContainer.addEventListener('touchend', () => {
  isDragging = false;
  if (moveX > 50 && currentIndex > 0) {
    currentIndex--; // السحب لليمين
  } else if (moveX < -50 && currentIndex < images.length - 1) {
    currentIndex++; // السحب لليسار
  }
  updateSlider(currentIndex);
  handleLoop();
  slideInterval = setInterval(() => {
    currentIndex++;
    updateSlider(currentIndex);
    setTimeout(handleLoop, 500);
  }, 3000); // إعادة تشغيل التحريك التلقائي
});
