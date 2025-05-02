// ==================================================
// Ahmed Store - script.js - V3
// Enhanced with persistent login, better UX & comments
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const EMAILJS_SERVICE_ID = 'service_jy0utzi'; // Replace if needed
    const EMAILJS_VERIFICATION_TEMPLATE_ID = 'template_5y88w0r'; // Replace if needed
    const EMAILJS_ORDER_TEMPLATE_ID = 'template_qoyllof'; // Replace if needed
    const STORE_OWNER_EMAIL = 'ahmed.store1.eg@gmail.com'; // Recipient for orders
    const USER_EMAIL_KEY = 'ahmedStoreUserEmail'; // localStorage key for persistent login
    const ORDER_HISTORY_KEY = 'ahmedStoreOrderHistory'; // localStorage key for history
    const MAX_HISTORY_ITEMS = 25; // Max orders to keep in history
    const ORDER_SUCCESS_REDIRECT_DELAY = 4500; // ms delay before redirecting after success

    // --- DOM Element Cache ---
    const elements = {
        platformSelect: document.getElementById('platform-select'),
        serviceGroup: document.getElementById('service-group'),
        serviceSelect: document.getElementById('service-select'),
        packageGroup: document.getElementById('package-group'),
        packageOptions: document.getElementById('package-options'),
        detailsGroup: document.getElementById('details-group'),
        quantityInput: document.getElementById('quantity-input'),
        quantityHint: document.getElementById('quantity-hint'),
        linkInput: document.getElementById('link-input'),
        linkHint: document.getElementById('link-hint'),
        priceDisplay: document.getElementById('price-display'),
        totalPriceSpan: document.getElementById('total-price'),
        packageDescriptionP: document.getElementById('package-description'),
        estimatedTimeDisplay: document.getElementById('estimated-time-display'),
        confirmOrderButton: document.getElementById('confirm-order-button'),
        orderForm: document.getElementById('order-form'),

        loginSection: document.getElementById('login-section'),
        orderSection: document.getElementById('order-section'),
        paymentSection: document.getElementById('payment-section'),
        orderHistorySection: document.getElementById('order-history-section'),

        emailInputContainer: document.getElementById('email-input-container'),
        userEmailInput: document.getElementById('user-email'),
        sendCodeButton: document.getElementById('send-code-button'),
        codeInputContainer: document.getElementById('code-input-container'),
        verificationCodeInput: document.getElementById('verification-code'),
        verifyCodeButton: document.getElementById('verify-code-button'),
        loginMessage: document.getElementById('login-message'),

        userSessionDiv: document.getElementById('user-session'),
        userEmailDisplay: document.getElementById('user-email-display'),
        logoutButton: document.getElementById('logout-button'),
        viewHistoryButton: document.getElementById('view-history-button'),
        closeHistoryButton: document.getElementById('close-history-button'),
        orderHistoryListDiv: document.getElementById('order-history-list'),

        paymentAmountSpan: document.getElementById('payment-amount'),
        paymentDoneButton: document.getElementById('payment-done-button'),
        paymentMessage: document.getElementById('payment-message'),
        orderSummaryDiv: document.getElementById('order-summary'),
        loadingOverlay: document.getElementById('loading-overlay'),
        skeletonLoader: document.getElementById('skeleton-loader'),

        confirmationModal: document.getElementById('confirmation-modal'),
        modalOrderSummaryDiv: document.getElementById('modal-order-summary'),
        modalConfirmButton: document.getElementById('modal-confirm-button'),
        modalCancelButton: document.getElementById('modal-cancel-button'),
        currentYearSpan: document.getElementById('current-year')
    };

    // --- State Variables ---
    let servicesData = {};
    let currentUserEmail = null;
    let selectedPlatformKey = null;
    let selectedServiceKey = null;
    let selectedPackageData = null;
    let currentQuantity = 0;
    let currentLink = '';
    let currentTotalPrice = 0;
    let verificationCodeSent = null;
    let isSubmitting = false; // Prevent double submissions

    // --- Helper Functions ---

    /** Shows or hides the main loading overlay */
    function showLoading(show = true) {
        if (!elements.loadingOverlay) return;
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    /** Toggles spinner and disabled state for a button */
    function toggleButtonSpinner(button, show = true) {
        if (!button) return;
        const spinner = button.querySelector('.spinner');
        // const buttonText = button.querySelector('.button-text'); // Not used currently
        if (spinner) spinner.style.display = show ? 'inline-block' : 'none';
        button.disabled = show;
    }

    /** Displays a message (success or error) in a specified element */
    function showMessage(element, message, isSuccess = true) {
        if (!element) return;
        element.textContent = message;
        element.className = 'message'; // Reset classes
        element.classList.add(isSuccess ? 'success' : 'error');
        element.style.display = 'block';
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /** Hides a message element */
    function hideMessage(element) {
        if (!element) return;
        element.style.display = 'none';
        element.textContent = '';
        element.className = 'message'; // Reset classes
    }

    /** Toggles visibility of sections with animation */
    function toggleSectionVisibility(sectionElement, show = true, displayType = 'block') {
        if (!sectionElement) return;

        // Use a data attribute to track transition state
        const endTransition = () => {
            if (!sectionElement.classList.contains('visible-section')) {
                sectionElement.style.display = 'none';
            }
            sectionElement.removeEventListener('transitionend', endTransition);
            sectionElement.dataset.transitioning = 'false';
        };

        if (show) {
            if (sectionElement.style.display === displayType && sectionElement.classList.contains('visible-section')) return; // Already visible
            sectionElement.removeEventListener('transitionend', endTransition); // Clean up listener
            sectionElement.style.display = displayType;
            sectionElement.dataset.transitioning = 'true';
            requestAnimationFrame(() => { // Ensure display is set before animating
                sectionElement.classList.add('visible-section');
                sectionElement.classList.remove('hidden-section');
                 // Set timeout for transition end fallback
                setTimeout(() => { if(sectionElement.dataset.transitioning === 'true') endTransition(); }, 500); // Match CSS transition duration + buffer
            });
        } else {
            if (sectionElement.style.display === 'none' || sectionElement.classList.contains('hidden-section')) return; // Already hidden
            sectionElement.classList.remove('visible-section');
            sectionElement.classList.add('hidden-section');
            sectionElement.dataset.transitioning = 'true';
            sectionElement.addEventListener('transitionend', endTransition);
            // Fallback timeout
             setTimeout(() => { if(sectionElement.dataset.transitioning === 'true') endTransition(); }, 500);
        }
    }

    /** Validates email format */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = re.test(String(email).toLowerCase());
        updateInputValidationClass(elements.userEmailInput, isValid);
        return isValid;
    }

    /** Validates URL format (requires http/https) */
    function isValidUrl(string) {
        if (!string || !string.trim()) return false;
        if (!string.startsWith('http://') && !string.startsWith('https://')) {
            return false;
        }
        try { new URL(string); return true; } catch (_) { return false; }
    }

    /** Generates a random numeric code */
    function generateRandomCode(length) {
        let code = '';
        for (let i = 0; i < length; i++) { code += Math.floor(Math.random() * 10); }
        return code;
    }

    /** Updates input visual state (valid/invalid classes) */
     function updateInputValidationClass(inputElement, isValid) {
         if (!inputElement) return;
         const value = inputElement.value.trim();
         // Reset if empty
         if (value === '') {
              inputElement.classList.remove('valid', 'invalid');
              return;
         }
         inputElement.classList.toggle('valid', isValid);
         inputElement.classList.toggle('invalid', !isValid);
     }

    /** Formats a timestamp into a readable Arabic date/time */
     function formatOrderDate(timestamp) {
         try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true // Use AM/PM
            });
         } catch (e) {
             console.error("Error formatting date:", e);
             return "تاريخ غير صالح";
         }
     }

    // --- Core Application Logic ---

    /** Loads services data from JSON file */
    async function loadServicesData() {
        elements.skeletonLoader.style.display = 'block';
        hideMessage(elements.loginMessage); // Hide any previous errors
        toggleSectionVisibility(elements.loginSection, false);
        toggleSectionVisibility(elements.orderSection, false);
        showLoading(false); // Hide general loading overlay if shown

        try {
            const response = await fetch('services.json?v=' + Date.now()); // Cache bust
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            servicesData = await response.json();
            console.log("Services data loaded successfully.");
            initializeApp(); // Proceed to initialize the app
        } catch (error) {
            console.error("Could not load services data:", error);
            toggleSectionVisibility(elements.loginSection, true); // Show login section to display the error
            showMessage(elements.loginMessage, `خطأ حرج: لا يمكن تحميل بيانات الخدمات (${error.message}). الرجاء تحديث الصفحة والمحاولة مرة أخرى.`, false);
            elements.loginSection.style.pointerEvents = 'none'; // Disable interaction
            elements.loginSection.style.opacity = '0.6';
        } finally {
            elements.skeletonLoader.style.display = 'none'; // Hide skeleton loader
        }
    }

    /** Initializes the application after data is loaded */
    function initializeApp() {
        populatePlatforms();
        checkSession(); // Checks localStorage for logged-in user
        initializeSelections(); // Restore last selected platform
        initializeClipboard();
        addEventListeners(); // Setup all event listeners
        setupModalListeners();
        setupHistoryListeners();
        updateCurrentYear(); // Set footer year
        console.log("Ahmed Store App Initialized.");
        // Initial visibility is handled by checkSession()
    }

    /** Populates the platform dropdown */
    function populatePlatforms() {
        if (!elements.platformSelect || !servicesData) return;
        elements.platformSelect.innerHTML = '<option value="">-- الرجاء الإختيار --</option>';
        const fragment = document.createDocumentFragment();
        Object.keys(servicesData).forEach(platformKey => {
            const platform = servicesData[platformKey];
            const option = document.createElement('option');
            option.value = platformKey;
            option.textContent = platform.name;
            fragment.appendChild(option);
        });
        elements.platformSelect.appendChild(fragment);
    }

    /** Updates the services dropdown based on selected platform */
    function updateServices() {
        selectedPlatformKey = elements.platformSelect.value;
        localStorage.setItem('lastPlatform', selectedPlatformKey); // Save preference

        // Reset downstream selections and hide sections
        elements.serviceSelect.innerHTML = '<option value="">-- الرجاء الإختيار --</option>';
        elements.packageOptions.innerHTML = '<p class="placeholder-text">الرجاء اختيار الخدمة لعرض الباقات.</p>';
        toggleSectionVisibility(elements.serviceGroup, false);
        toggleSectionVisibility(elements.packageGroup, false);
        hideDetailsAndPrice(); // Also hides details group, price, confirm button

        if (selectedPlatformKey && servicesData[selectedPlatformKey]) {
            const platformServices = servicesData[selectedPlatformKey].services;
            const fragment = document.createDocumentFragment();
            Object.keys(platformServices).forEach(serviceKey => {
                const option = document.createElement('option');
                option.value = serviceKey;
                option.textContent = platformServices[serviceKey].name;
                fragment.appendChild(option);
            });
            elements.serviceSelect.appendChild(fragment);
            toggleSectionVisibility(elements.serviceGroup, true);
        } else {
             localStorage.removeItem('lastPlatform'); // Clear invalid selection
        }
        selectedServiceKey = null;
        selectedPackageData = null;
    }

    /** Updates the package selection based on the chosen service */
    function updatePackages() {
        selectedServiceKey = elements.serviceSelect.value;
        elements.packageOptions.innerHTML = ''; // Clear previous options
        toggleSectionVisibility(elements.packageGroup, false);
        hideDetailsAndPrice();

        if (selectedPlatformKey && selectedServiceKey && servicesData[selectedPlatformKey]?.services[selectedServiceKey]) {
            const servicePackages = servicesData[selectedPlatformKey].services[selectedServiceKey].packages;

            if (servicePackages && servicePackages.length > 0) {
                const fragment = document.createDocumentFragment();
                servicePackages.forEach((pkg) => {
                    const uniqueId = `pkg-${selectedPlatformKey}-${selectedServiceKey}-${pkg.id}`; // Unique ID
                    const label = document.createElement('label');
                    label.className = 'package-label';
                    label.setAttribute('for', uniqueId);

                    // Structure using divs for better control with CSS V3
                    label.innerHTML = `
                        <input type="radio" name="package" value="${pkg.id}" id="${uniqueId}" required class="package-radio-input"
                               data-price="${pkg.pricePerUnit}"
                               data-description="${pkg.description || ''}"
                               data-package-name="${pkg.name}"
                               data-min-quantity="${pkg.minQuantity || 1}"
                               data-estimated-time="${pkg.estimatedTime || 'غير محدد'}">
                        <div class="package-content">
                            <div class="package-header">
                                <span class="package-radio-custom" aria-hidden="true"></span>
                                <div class="package-name-price">
                                    <span class="package-name">${pkg.name}</span>
                                    <span class="package-price">${(pkg.pricePerUnit * 1000).toFixed(2)} ج.م / 1000</span>
                                </div>
                            </div>
                            <div class="package-body">
                                <p class="package-desc">${pkg.description || 'لا يوجد وصف تفصيلي.'}</p>
                            </div>
                            <div class="package-footer">
                                <p class="package-estimated-time">
                                    <i class="fas fa-clock fa-fw"></i>
                                    <span>${pkg.estimatedTime || 'غير محدد'}</span>
                                </p>
                            </div>
                        </div>
                    `;

                    const radio = label.querySelector('input[type="radio"]');
                    radio.addEventListener('change', handlePackageSelection);
                    fragment.appendChild(label);
                });
                elements.packageOptions.appendChild(fragment);
            } else {
                elements.packageOptions.innerHTML = '<p class="placeholder-text">لا توجد باقات متاحة لهذه الخدمة حالياً.</p>';
            }
            toggleSectionVisibility(elements.packageGroup, true);
        }
        selectedPackageData = null;
    }

    /** Handles the logic when a package radio button is selected */
    function handlePackageSelection(event) {
        const radio = event.target;
        selectedPackageData = {
            id: radio.value,
            name: radio.dataset.packageName,
            pricePerUnit: parseFloat(radio.dataset.price),
            description: radio.dataset.description,
            minQuantity: parseInt(radio.dataset.minQuantity),
            estimatedTime: radio.dataset.estimatedTime
        };
        console.log("Package selected:", selectedPackageData);

        // Update quantity input constraints and hint
        elements.quantityInput.min = selectedPackageData.minQuantity;
        elements.quantityInput.placeholder = `الحد الأدنى: ${selectedPackageData.minQuantity}`;
        elements.quantityHint.textContent = `الحد الأدنى للكمية: ${selectedPackageData.minQuantity}.`;
        elements.quantityHint.classList.remove('error');
        elements.quantityInput.classList.remove('invalid', 'valid');
        elements.quantityInput.value = ''; // Reset quantity on package change

        // Show details section, hide price/confirm until quantity is valid
        toggleSectionVisibility(elements.detailsGroup, true);
        toggleSectionVisibility(elements.priceDisplay, false);
        toggleSectionVisibility(elements.confirmOrderButton, false);

        // Reset validation for link input
        elements.linkInput.classList.remove('invalid', 'valid');
        elements.linkHint.classList.remove('error');
        elements.linkHint.textContent = '';

        // Prepare estimated time display (will show with price box)
        if (elements.estimatedTimeDisplay) {
             elements.estimatedTimeDisplay.innerHTML = `<i class="fas fa-clock fa-fw"></i> وقت التنفيذ التقديري: ${selectedPackageData.estimatedTime}`;
        }
    }


    /** Validates the quantity input based on selected package */
    function validateQuantity(showError = true) {
        let isValid = false;
        const minQty = selectedPackageData?.minQuantity || 1;
        const currentQty = parseInt(elements.quantityInput.value) || 0;
        const hintElement = elements.quantityHint;

        if (!elements.quantityInput.value || currentQty <= 0) {
            if (showError) {
                hintElement.textContent = 'الرجاء إدخال كمية صحيحة.';
                hintElement.classList.add('error');
            }
            isValid = false;
        } else if (currentQty < minQty) {
             if (showError) {
                hintElement.textContent = `الحد الأدنى للكمية هو ${minQty}.`;
                hintElement.classList.add('error');
            }
            isValid = false;
        } else {
             hintElement.textContent = `الحد الأدنى للكمية: ${minQty}.`; // Normal hint
             hintElement.classList.remove('error');
             isValid = true;
        }
        updateInputValidationClass(elements.quantityInput, isValid);
        return isValid;
    }

    /** Validates the link input */
    function validateLink(showError = true) {
         const linkValue = elements.linkInput.value.trim();
         const hintElement = elements.linkHint;
         let isValid = false;

         if (!linkValue) {
            if (showError) {
                hintElement.textContent = 'الرجاء إدخال الرابط المطلوب.';
                hintElement.classList.add('error');
            }
             isValid = false;
         } else if (!isValidUrl(linkValue)) {
              if (showError) {
                 hintElement.textContent = 'الرابط غير صالح. تأكد من بدايته بـ http:// أو https://';
                 hintElement.classList.add('error');
             }
             isValid = false;
         } else {
             hintElement.textContent = ''; // Clear hint on valid
             hintElement.classList.remove('error');
             isValid = true;
         }
         updateInputValidationClass(elements.linkInput, isValid);
         return isValid;
     }

     /** Hides details, price, and confirm button sections and resets related state */
     function hideDetailsAndPrice() {
        toggleSectionVisibility(elements.detailsGroup, false);
        toggleSectionVisibility(elements.priceDisplay, false);
        toggleSectionVisibility(elements.confirmOrderButton, false);

        // No need to reset inputs here, handled by handlePackageSelection or resetOrderForm
        currentQuantity = 0;
        currentLink = '';
        currentTotalPrice = 0;
    }

    /** Calculates and displays the total price based on quantity and package */
    function calculatePrice() {
        currentQuantity = parseInt(elements.quantityInput.value) || 0;
        currentLink = elements.linkInput.value.trim();

        // Re-validate silently first
        let isQuantityValid = validateQuantity(false);
        let isLinkValid = validateLink(false); // Check link validity too

        if (selectedPackageData && currentQuantity > 0 && isQuantityValid) {
            currentTotalPrice = currentQuantity * selectedPackageData.pricePerUnit;
            elements.totalPriceSpan.textContent = currentTotalPrice.toFixed(2);
            elements.packageDescriptionP.textContent = selectedPackageData.description;
            // Estimated time is already set in handlePackageSelection

            toggleSectionVisibility(elements.priceDisplay, true);
            // Show confirm button only if BOTH quantity AND link are valid
            toggleSectionVisibility(elements.confirmOrderButton, isLinkValid);
        } else {
            currentTotalPrice = 0;
            toggleSectionVisibility(elements.priceDisplay, false);
            toggleSectionVisibility(elements.confirmOrderButton, false);
        }
        updatePaymentAmount(); // Sync payment section display
    }

    // --- Authentication ---

    /** Sends verification code via EmailJS */
     async function sendVerificationCode() {
        if (isSubmitting) return;
        hideMessage(elements.loginMessage); // Clear previous messages
        const userEmail = elements.userEmailInput.value.trim();

        if (!validateEmail(userEmail)) {
            showMessage(elements.loginMessage, 'الرجاء إدخال بريد إلكتروني صحيح.', false);
            elements.userEmailInput.focus();
            return;
        }

        isSubmitting = true;
        toggleButtonSpinner(elements.sendCodeButton, true);
        verificationCodeSent = generateRandomCode(6);
        const templateParams = {
            user_email: userEmail,
            verification_code: verificationCodeSent
        };
        console.log("Sending verification code to:", userEmail);

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_VERIFICATION_TEMPLATE_ID, templateParams);
            showMessage(elements.loginMessage, `تم إرسال كود التحقق إلى ${userEmail}.`, true);
            toggleSectionVisibility(elements.emailInputContainer, false);
            toggleSectionVisibility(elements.codeInputContainer, true);
            elements.verificationCodeInput.focus();
        } catch (error) {
            console.error('EmailJS Verification Error:', error);
            let errorMsg = `فشل إرسال كود التحقق (${error?.status || 'Network Error'}). حاول مرة أخرى أو تأكد من صحة البريد.`;
            // Provide more details if available from EmailJS error
            if (error?.text) { errorMsg += ` التفاصيل: ${error.text}`; }
            showMessage(elements.loginMessage, errorMsg, false);
            verificationCodeSent = null; // Reset code on error
        } finally {
            toggleButtonSpinner(elements.sendCodeButton, false);
            isSubmitting = false;
        }
     }

     /** Verifies the entered code and logs the user in */
     function verifyCode() {
        if (isSubmitting) return;
        hideMessage(elements.loginMessage);
        const enteredCode = elements.verificationCodeInput.value.trim();
        let isValidCode = true;

         if (!enteredCode || !/^\d{6}$/.test(enteredCode)) {
            showMessage(elements.loginMessage, 'الرجاء إدخال الكود المكون من 6 أرقام.', false);
            isValidCode = false;
        } else if (enteredCode !== verificationCodeSent) {
            showMessage(elements.loginMessage, 'الكود المدخل غير صحيح. حاول مرة أخرى.', false);
             isValidCode = false;
        }

        updateInputValidationClass(elements.verificationCodeInput, isValidCode);
        if (!isValidCode) {
             elements.verificationCodeInput.focus();
             return;
        }

        // Code is valid - Proceed with login
        isSubmitting = true; // Prevent actions during state update
        toggleButtonSpinner(elements.verifyCodeButton, true);

        currentUserEmail = elements.userEmailInput.value.trim();
        localStorage.setItem(USER_EMAIL_KEY, currentUserEmail); // Use localStorage for persistence

        updateLoginState(true); // Update UI
        console.log("Login successful for:", currentUserEmail);

        // No need for spinner toggle here, updateLoginState handles UI changes
        isSubmitting = false;
     }

     /** Updates the UI based on login state */
     function updateLoginState(isLoggedIn) {
        if (isLoggedIn && currentUserEmail) {
            // Logged In State
            toggleSectionVisibility(elements.loginSection, false);
            toggleSectionVisibility(elements.paymentSection, false);
            toggleSectionVisibility(elements.orderHistorySection, false);
             // Delay showing order section for smoother transition
             setTimeout(() => {
                 toggleSectionVisibility(elements.orderSection, true);
                 elements.orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
            elements.userEmailDisplay.textContent = currentUserEmail;
            elements.userSessionDiv.style.display = 'inline-flex';
            elements.viewHistoryButton.style.display = 'inline-block';
            resetOrderForm(); // Clear form for new order
        } else {
            // Logged Out State
            toggleSectionVisibility(elements.orderSection, false);
            toggleSectionVisibility(elements.paymentSection, false);
            toggleSectionVisibility(elements.orderHistorySection, false);
            toggleSectionVisibility(elements.loginSection, true); // Show login
            elements.userSessionDiv.style.display = 'none';
            elements.viewHistoryButton.style.display = 'none';

            // Clear sensitive state
            currentUserEmail = null;
            verificationCodeSent = null;
            localStorage.removeItem(USER_EMAIL_KEY); // Clear persistent login

            // Reset login form
            elements.userEmailInput.value = '';
            elements.verificationCodeInput.value = '';
            elements.userEmailInput.classList.remove('invalid', 'valid');
            elements.verificationCodeInput.classList.remove('invalid', 'valid');
            toggleSectionVisibility(elements.emailInputContainer, true);
            toggleSectionVisibility(elements.codeInputContainer, false);
            hideMessage(elements.loginMessage);
        }
    }

    /** Logs the user out */
    function logout() {
         console.log("Logging out user:", currentUserEmail);
        updateLoginState(false);
        elements.loginSection.scrollIntoView({ behavior: 'smooth' });
     }

    /** Checks localStorage for existing session on page load */
    function checkSession() {
         const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
        if (storedEmail) {
            currentUserEmail = storedEmail;
            console.log("Persistent session found for:", currentUserEmail);
            updateLoginState(true); // Update UI based on stored email
        } else {
            console.log("No active persistent session found.");
             updateLoginState(false); // Show login form
        }
     }

    /** Restores last selected platform if available */
    function initializeSelections() {
         const lastPlatform = localStorage.getItem('lastPlatform');
         // Ensure data and elements are ready
        if (lastPlatform && servicesData && Object.keys(servicesData).length > 0 && elements.platformSelect?.options.length > 1) {
             const platformExists = Array.from(elements.platformSelect.options).some(opt => opt.value === lastPlatform);
            if (platformExists) {
                elements.platformSelect.value = lastPlatform;
                updateServices(); // Trigger service update
                console.log("Restored last platform:", lastPlatform);
            } else {
                 localStorage.removeItem('lastPlatform'); // Clean up invalid storage
            }
        }
     }

    // --- Order Confirmation Modal ---

    /** Validates the form and shows the confirmation modal */
    function requestOrderConfirmation() {
        // Trigger validation with UI feedback
        let isQtyValid = validateQuantity(true);
        let isLnkValid = validateLink(true);

        // Check all conditions
        if (!selectedPlatformKey || !selectedServiceKey || !selectedPackageData || !isQtyValid || !isLnkValid || !currentUserEmail) {
             const firstInvalidInput = elements.orderForm.querySelector('.invalid');
             if (firstInvalidInput) {
                 firstInvalidInput.focus();
                 firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
             } else {
                 elements.orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
             elements.confirmOrderButton.classList.add('shake');
             setTimeout(() => elements.confirmOrderButton.classList.remove('shake'), 500);
             return; // Stop if validation fails
         }

         // Populate and show modal
         populateConfirmationModal();
         elements.confirmationModal.style.display = 'flex';
         requestAnimationFrame(() => { // Ensure display is set before adding class
             elements.confirmationModal.classList.add('visible');
         });
    }

    /** Populates the confirmation modal with order details */
    function populateConfirmationModal() {
        const summaryContainer = elements.modalOrderSummaryDiv;
        if (!selectedPlatformKey || !selectedServiceKey || !selectedPackageData || !currentUserEmail || !summaryContainer) {
            summaryContainer.innerHTML = '<p class="message error">خطأ في تحميل تفاصيل الطلب.</p>';
            return;
        }
        const platform = servicesData[selectedPlatformKey];
        const service = platform?.services[selectedServiceKey];
        const platformIcon = platform?.icon || 'fas fa-question-circle'; // Fallback icon

        summaryContainer.innerHTML = `
            <p><strong><i class="${platformIcon} fa-fw" style="color: var(--primary-color);"></i> المنصة:</strong> ${platform?.name || 'غير محدد'}</p>
            <p><strong><i class="fas fa-cogs fa-fw" style="color: var(--primary-color);"></i> الخدمة:</strong> ${service?.name || 'غير محدد'}</p>
            <p><strong><i class="fas fa-box-open fa-fw" style="color: var(--primary-color);"></i> الباقة:</strong> ${selectedPackageData.name}</p>
            <p><strong><i class="fas fa-hashtag fa-fw" style="color: var(--primary-color);"></i> الكمية:</strong> ${currentQuantity}</p>
            <p><strong><i class="fas fa-link fa-fw" style="color: var(--primary-color);"></i> الرابط:</strong> <span style="direction: ltr; display: inline-block; text-align: left; word-break: break-all;">${currentLink}</span></p>
            <p><strong><i class="fas fa-clock fa-fw" style="color: var(--info-color);"></i> الوقت التقديري:</strong> ${selectedPackageData.estimatedTime}</p>
            <hr>
            <p style="text-align: center; font-size: 1.1em;"><strong><i class="fas fa-dollar-sign fa-fw" style="color: var(--success-color);"></i> السعر الإجمالي:</strong> ${currentTotalPrice.toFixed(2)} جنيه مصري</p>
        `;
    }

    /** Handles confirmation from the modal and proceeds to payment */
    function confirmAndProceedToPayment() {
        cancelConfirmationModal(); // Hide modal
        toggleSectionVisibility(elements.orderSection, false);
        toggleSectionVisibility(elements.paymentSection, true);
        updatePaymentAmount();
        displayOrderSummary(); // Show summary in payment section
        elements.paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        hideMessage(elements.paymentMessage);
    }

     /** Hides the confirmation modal */
     function cancelConfirmationModal() {
         elements.confirmationModal.classList.remove('visible');
         // Use transitionend to set display: none after animation
         const modal = elements.confirmationModal;
         const onTransitionEnd = () => {
             if (!modal.classList.contains('visible')) {
                 modal.style.display = 'none';
             }
             modal.removeEventListener('transitionend', onTransitionEnd);
         };
         modal.addEventListener('transitionend', onTransitionEnd);
         // Fallback if transition doesn't fire
         setTimeout(() => { if (!modal.classList.contains('visible')) modal.style.display = 'none'; }, 500);
     }

     /** Sets up event listeners for the confirmation modal */
     function setupModalListeners() {
         if (elements.modalConfirmButton) elements.modalConfirmButton.addEventListener('click', confirmAndProceedToPayment);
         if (elements.modalCancelButton) elements.modalCancelButton.addEventListener('click', cancelConfirmationModal);
         if (elements.confirmationModal) {
             elements.confirmationModal.addEventListener('click', (event) => {
                 // Close if clicking on the overlay itself, not the content
                 if (event.target === elements.confirmationModal) {
                     cancelConfirmationModal();
                 }
             });
             // Close modal on Escape key press
             document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && elements.confirmationModal.classList.contains('visible')) {
                    cancelConfirmationModal();
                }
            });
         }
    }

    // --- Payment & Order Submission ---

    /** Updates the payment amount display */
    function updatePaymentAmount() {
        if(elements.paymentAmountSpan) {
            elements.paymentAmountSpan.textContent = currentTotalPrice.toFixed(2);
        }
    }

    /** Displays the final order summary in the payment section */
    function displayOrderSummary() {
        const summaryContainer = elements.orderSummaryDiv;
        if (!selectedPlatformKey || !selectedServiceKey || !selectedPackageData || !currentUserEmail || !summaryContainer) {
            summaryContainer.innerHTML = '<p class="message error">خطأ في عرض ملخص الطلب.</p>'; return;
        }
        const platform = servicesData[selectedPlatformKey];
        const service = platform?.services[selectedServiceKey];
        const platformIcon = platform?.icon || 'fas fa-question-circle';

        summaryContainer.innerHTML = `
            <h4><i class="fas fa-receipt fa-fw"></i> ملخص الطلب للتأكيد:</h4>
            <p><strong><i class="${platformIcon} fa-fw"></i> المنصة:</strong> ${platform?.name || 'غير محدد'}</p>
            <p><strong><i class="fas fa-cogs fa-fw"></i> الخدمة:</strong> ${service?.name || 'غير محدد'}</p>
            <p><strong><i class="fas fa-box-open fa-fw"></i> الباقة:</strong> ${selectedPackageData.name}</p>
            <p><strong><i class="fas fa-hashtag fa-fw"></i> الكمية:</strong> ${currentQuantity}</p>
            <p><strong><i class="fas fa-link fa-fw"></i> الرابط:</strong> <span style="direction: ltr;">${currentLink}</span></p>
            <p><strong><i class="fas fa-dollar-sign fa-fw"></i> السعر:</strong> ${currentTotalPrice.toFixed(2)} ج.م</p>
            <p><strong><i class="fas fa-user fa-fw"></i> المستخدم:</strong> ${currentUserEmail}</p>
            <p><strong><i class="fas fa-clock fa-fw"></i> الوقت التقديري:</strong> ${selectedPackageData.estimatedTime}</p>
             <hr>
            <small>سيتم إرسال هذه التفاصيل للمراجعة بعد الضغط على زر الإرسال.</small>
        `;
     }

    /** Submits the order via EmailJS after simulated payment */
    async function submitOrder() {
        if (isSubmitting) return;
        // Final validation before sending
        if (!selectedPlatformKey || !selectedServiceKey || !selectedPackageData || currentQuantity <= 0 || !currentLink || !currentUserEmail || currentTotalPrice < 0) { // Allow 0 price? Maybe not.
            showMessage(elements.paymentMessage, 'خطأ: بيانات الطلب غير مكتملة أو غير صالحة للإرسال.', false); return;
        }

        isSubmitting = true;
        hideMessage(elements.paymentMessage);
        toggleButtonSpinner(elements.paymentDoneButton, true);

        const templateParams = {
            platform: servicesData[selectedPlatformKey]?.name || selectedPlatformKey,
            service: servicesData[selectedPlatformKey]?.services[selectedServiceKey]?.name || selectedServiceKey,
            package: selectedPackageData.name,
            quantity: currentQuantity,
            link: currentLink,
            total_price: currentTotalPrice.toFixed(2),
            user_email: currentUserEmail,
            estimated_time: selectedPackageData.estimatedTime,
            payment_method: "تم التحويل (بحاجة لمراجعة يدوية)", // Standard message
            to_email: STORE_OWNER_EMAIL // Send to store owner
        };
        console.log("Submitting order via EmailJS...", templateParams);

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ORDER_TEMPLATE_ID, templateParams);
            showMessage(elements.paymentMessage, 'تم إرسال طلبك بنجاح! سيتم مراجعته والبدء في التنفيذ قريباً. شكراً لك.', true);

            saveOrderToHistory(templateParams); // Save to localStorage
            resetOrderForm(); // Clear the form

            // Redirect back to order section after a delay
            setTimeout(() => {
                toggleSectionVisibility(elements.paymentSection, false);
                toggleSectionVisibility(elements.orderSection, true);
                elements.orderSection.scrollIntoView({ behavior: 'smooth' });
                hideMessage(elements.paymentMessage); // Hide success message after redirect
            }, ORDER_SUCCESS_REDIRECT_DELAY);

        } catch (error) {
            console.error('EmailJS Order Submission Error:', error);
             let errorMsg = `فشل إرسال الطلب (${error?.status || 'Network Error'}). `;
            errorMsg += "يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة عبر واتساب لتأكيد طلبك.";
            if (error?.text) { errorMsg += ` التفاصيل: ${error.text}`; }
            showMessage(elements.paymentMessage, errorMsg, false);
        } finally {
            // Ensure spinner stops even if redirect happens before finally
            toggleButtonSpinner(elements.paymentDoneButton, false);
            isSubmitting = false;
        }
     }

    // --- Order History (LocalStorage) ---

    /** Saves completed order details to localStorage */
    function saveOrderToHistory(orderParams) {
        try {
            const history = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || '[]');
            const newOrderEntry = {
                date: Date.now(),
                platform: orderParams.platform,
                service: orderParams.service,
                packageName: orderParams.package,
                quantity: orderParams.quantity,
                totalPrice: orderParams.total_price,
                link: orderParams.link // Including link for user reference
            };
            history.unshift(newOrderEntry); // Add to start

            // Limit history size
            if (history.length > MAX_HISTORY_ITEMS) {
                history.splice(MAX_HISTORY_ITEMS); // Remove oldest items
            }
            localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(history));
            console.log("Order saved to history. Current history size:", history.length);
        } catch (e) {
            console.error("Error saving order to localStorage:", e);
            // Handle potential storage full error? Maybe notify user?
        }
    }

    /** Loads and displays order history from localStorage */
    function displayOrderHistory() {
         // Hide other main sections smoothly
         toggleSectionVisibility(elements.loginSection, false);
         toggleSectionVisibility(elements.orderSection, false);
         toggleSectionVisibility(elements.paymentSection, false);
         // Show history section
         toggleSectionVisibility(elements.orderHistorySection, true);
         elements.orderHistorySection.scrollIntoView({ behavior: 'smooth' });


        const historyList = elements.orderHistoryListDiv;
        historyList.innerHTML = ''; // Clear previous list
        try {
            const history = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || '[]');
            if (history.length === 0) {
                historyList.innerHTML = '<p class="placeholder-text">لا توجد طلبات محفوظة في سجل هذا المتصفح.</p>';
                return;
            }

            const fragment = document.createDocumentFragment();
            history.forEach(order => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'order-history-item';
                // Added link display, truncated for brevity if too long
                const displayLink = order.link ? (order.link.length > 50 ? order.link.substring(0, 47) + '...' : order.link) : 'لا يوجد';
                itemDiv.innerHTML = `
                    <span class="history-date">${formatOrderDate(order.date)}</span>
                    <div class="history-details">
                        <p><strong>المنصة:</strong> ${order.platform}</p>
                        <p><strong>الخدمة:</strong> ${order.service} - ${order.packageName}</p>
                        <p><strong>الكمية:</strong> ${order.quantity}</p>
                        <p><strong>السعر:</strong> ${order.totalPrice} ج.م</p>
                        <p><strong style="vertical-align: top;">الرابط:</strong> <span style="direction: ltr; font-size: 0.9em; word-break: break-all; display: inline-block;">${displayLink}</span></p>
                    </div>
                `;
                fragment.appendChild(itemDiv);
            });
            historyList.appendChild(fragment);

        } catch (e) {
            console.error("Error loading/parsing order history from localStorage:", e);
            historyList.innerHTML = '<p class="message error">حدث خطأ أثناء تحميل سجل الطلبات.</p>';
        }
    }

     /** Hides the order history section */
     function hideOrderHistory() {
         toggleSectionVisibility(elements.orderHistorySection, false);
          // Return to appropriate section
          if (currentUserEmail) {
               toggleSectionVisibility(elements.orderSection, true);
               elements.orderSection.scrollIntoView({ behavior: 'smooth' });
          } else {
               toggleSectionVisibility(elements.loginSection, true);
               elements.loginSection.scrollIntoView({ behavior: 'smooth' });
          }
     }

     /** Sets up event listeners for history buttons */
     function setupHistoryListeners() {
          if (elements.viewHistoryButton) elements.viewHistoryButton.addEventListener('click', displayOrderHistory);
          if (elements.closeHistoryButton) elements.closeHistoryButton.addEventListener('click', hideOrderHistory);
     }

    // --- Utility and Initialization ---

    /** Resets the entire order form to its initial state */
    function resetOrderForm() {
        if (elements.orderForm) elements.orderForm.reset(); // Native reset

        // Explicitly reset elements controlled by JS
        if (elements.platformSelect) elements.platformSelect.value = '';
        updateServices(); // This cascades resets down

        // Clear any visual validation states that might linger
        elements.orderForm.querySelectorAll('.invalid, .valid').forEach(el => {
            el.classList.remove('invalid', 'valid');
        });
        elements.orderForm.querySelectorAll('.input-hint.error').forEach(el => {
            el.classList.remove('error');
            el.textContent = ''; // Clear error text
        });
        // Restore default quantity hint if needed (now done in handlePackageSelection)
         if (elements.quantityHint) elements.quantityHint.textContent = '';
         if (elements.linkHint) elements.linkHint.textContent = '';


        // Reset state variables not handled by hideDetailsAndPrice
        selectedPlatformKey = null;
        selectedServiceKey = null;
        selectedPackageData = null;

        console.log("Order form reset.");
    }

    /** Initializes Clipboard.js for copy buttons */
     function initializeClipboard() {
         if (typeof ClipboardJS !== 'undefined') {
            const clipboard = new ClipboardJS('.copy-button');
            clipboard.on('success', (e) => {
                const button = e.trigger;
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check fa-fw"></i> تم!'; // Shorter success message
                button.classList.add('copied');
                button.disabled = true;

                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('copied');
                    button.disabled = false;
                }, 1500);
                e.clearSelection();
            });
            clipboard.on('error', (e) => {
                console.error('ClipboardJS Error:', e);
                const button = e.trigger;
                button.innerHTML = '<i class="fas fa-times fa-fw"></i> فشل'; // Error message
                setTimeout(() => { // Restore original text after a delay
                    button.innerHTML = '<i class="fas fa-copy fa-fw"></i> <span class="copy-text">نسخ</span>';
                 }, 2000);
            });
        } else {
             console.warn('ClipboardJS library not loaded. Copy buttons will not work.');
             document.querySelectorAll('.copy-button').forEach(button => button.style.display = 'none'); // Hide buttons if library fails
        }
     }

    /** Sets up all primary event listeners */
     function addEventListeners() {
         // Order Form Selects
         if (elements.platformSelect) elements.platformSelect.addEventListener('change', updateServices);
         if (elements.serviceSelect) elements.serviceSelect.addEventListener('change', updatePackages);
         // Note: Package radio change listener added dynamically in updatePackages

         // Login Actions
         if (elements.sendCodeButton) elements.sendCodeButton.addEventListener('click', sendVerificationCode);
         if (elements.verifyCodeButton) elements.verifyCodeButton.addEventListener('click', verifyCode);
         // Enter key submits in login fields
         if (elements.userEmailInput) elements.userEmailInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') elements.sendCodeButton.click(); });
         if (elements.verificationCodeInput) elements.verificationCodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') elements.verifyCodeButton.click(); });

         // Logout
         if (elements.logoutButton) elements.logoutButton.addEventListener('click', logout);

         // Order Process Buttons
         if (elements.confirmOrderButton) elements.confirmOrderButton.addEventListener('click', requestOrderConfirmation);
         if (elements.paymentDoneButton) elements.paymentDoneButton.addEventListener('click', submitOrder);

         // Input listeners for real-time validation and price calculation
         if (elements.quantityInput) elements.quantityInput.addEventListener('input', () => { validateQuantity(true); calculatePrice(); });
         if (elements.linkInput) elements.linkInput.addEventListener('input', () => { validateLink(true); calculatePrice(); });

         // Input validation on blur for better UX
         elements.userEmailInput?.addEventListener('blur', () => validateEmail(elements.userEmailInput.value));
         elements.linkInput?.addEventListener('blur', () => validateLink(true)); // Show error on blur if invalid
         elements.quantityInput?.addEventListener('blur', () => validateQuantity(true));

         // Back to top link
         document.querySelector('.back-to-top')?.addEventListener('click', (e) => {
             e.preventDefault();
             window.scrollTo({ top: 0, behavior: 'smooth' });
         });
     }

     /** Updates the copyright year in the footer */
     function updateCurrentYear() {
        if (elements.currentYearSpan) {
            elements.currentYearSpan.textContent = new Date().getFullYear();
        }
     }

    // --- App Initialization ---
    loadServicesData(); // Start the application load sequence

}); // End DOMContentLoaded