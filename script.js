// دالة لتبديل الوضع بين Dark و Light Mode
function toggleMode() {
    const body = document.body;
    const currentMode = body.classList.contains('light-mode') ? 'light' : 'dark';

    // تبديل الوضع بناءً على الوضع الحالي
    if (currentMode === 'dark') {
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
        document.getElementById('toggle-mode').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        document.getElementById('toggle-mode').innerHTML = '<i class="fas fa-sun"></i>';
    }

    // حفظ الوضع الجديد في localStorage
    const newMode = body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
    localStorage.setItem('mode', newMode);
}

// دالة لاستعادة الوضع المحفوظ عند تحميل الصفحة
function restoreSavedMode() {
  const savedMode = localStorage.getItem('mode');
  if (savedMode) {
    document.body.classList.add(savedMode);
    document.getElementById('toggle-mode').innerHTML = savedMode === 'light-mode' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  }
}

// دالة لتطبيق تأثير الظهور التدريجي على المنتجات
function observeProductCards() {
  const productCards = document.querySelectorAll(".product-card");
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  productCards.forEach(card => observer.observe(card));
}

// دالة لإعادة تشغيل البانر المتحرك
function restartBannerAnimation() {
  const bannerImages = document.querySelector(".banner-images");
  bannerImages.addEventListener("animationiteration", () => {
    bannerImages.style.animation = "none";
    void bannerImages.offsetWidth;
    bannerImages.style.animation = "";
  });
}

// دالة للبحث في المنتجات
function searchProducts() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const products = document.querySelectorAll(".product-card");
  const productsContainer = document.querySelector(".products");
    let resultsFound = false;
    let noResultsMessage = document.getElementById("no-results-message");

    products.forEach(product => {
        const productName = product.querySelector("h2").textContent.toLowerCase();
        const shouldDisplay = productName.includes(query);
        product.style.display = shouldDisplay ? "block" : "none";
        if (shouldDisplay) resultsFound = true;
    });

  // التعامل مع رسالة "لا يوجد نتائج"
    if (!resultsFound) {
      if (!noResultsMessage) {
        noResultsMessage = document.createElement("p");
        noResultsMessage.id = "no-results-message";
        noResultsMessage.textContent = "لم يتم العثور على نتائج تتوافق مع بحثك.";
        productsContainer.prepend(noResultsMessage);
      }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// دالة لإظهار زر العودة للأعلى عند التمرير
function toggleBackToTopButton() {
  const backToTopButton = document.getElementById("back-to-top");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopButton.style.display = "flex";
  } else {
    backToTopButton.style.display = "none";
  }
}

// دالة للعودة للأعلى عند النقر على الزر
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// دالة لتبديل ظهور القائمة الجانبية
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('visible');
}

// دالة لإدارة عرض البانر
function setupBannerSlider() {
    const imagesContainer = document.querySelector('.banner-images');
    const images = document.querySelectorAll('.banner-images img');
    const dots = document.querySelectorAll('.banner-dots .dot');
    let currentIndex = 0;
    let startX = 0;
    let moveX = 0;
    let isDragging = false;
    let slideInterval;

    // تحديث موقع البانر والنقاط
    function updateSlider(index) {
        imagesContainer.style.transition = 'transform 0.5s ease-in-out';
        imagesContainer.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index % images.length].classList.add('active');
    }

     // معالجة تأثير اللوب
    function handleLoop() {
      if (currentIndex >= images.length) {
          imagesContainer.style.transition = 'none';
          imagesContainer.style.transform = 'translateX(0)';
          currentIndex = 0;
      } else if (currentIndex < 0) {
          imagesContainer.style.transition = 'none';
          imagesContainer.style.transform = `translateX(-${(images.length - 1) * 100}%)`;
          currentIndex = images.length - 1;
        }
    }

  // بدء التحريك التلقائي
    function startAutoSlide() {
      slideInterval = setInterval(() => {
        currentIndex++;
        updateSlider(currentIndex);
        setTimeout(handleLoop, 500);
      }, 3000);
    }

    startAutoSlide();

  // بداية السحب باللمس
    imagesContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        clearInterval(slideInterval);
    });

    // التحريك أثناء السحب
    imagesContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
        moveX = e.touches[0].clientX - startX;
        imagesContainer.style.transform = `translateX(calc(-${currentIndex * 100}% + ${moveX}px))`;
    });

    // نهاية السحب باللمس
  imagesContainer.addEventListener('touchend', () => {
    isDragging = false;
      if (moveX > 50 && currentIndex > 0) {
          currentIndex--;
      } else if (moveX < -50 && currentIndex < images.length - 1) {
          currentIndex++;
      }
        updateSlider(currentIndex);
        handleLoop();
        startAutoSlide();
    });

  // التعامل مع النقاط
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateSlider(currentIndex);
    })
  });
}

// إضافة مستمع الحدث عند تحميل الصفحة
window.onload = () => {
    restoreSavedMode();
    observeProductCards();
    restartBannerAnimation();
    setupBannerSlider();
};

// إضافة مستمع الحدث عند التمرير
window.onscroll = toggleBackToTopButton;

// إضافة مستمع الحدث لزر العودة للأعلى
document.getElementById("back-to-top").onclick = scrollToTop;
