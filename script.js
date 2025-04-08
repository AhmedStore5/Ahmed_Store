"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    // Main Form
    const categorySelect = document.getElementById('category-select');
    const serviceSelect = document.getElementById('service-select');
    const linkInput = document.getElementById('link-input');
    const quantityInput = document.getElementById('quantity-input');
    const quantityLimits = document.getElementById('quantity-limits');
    const avgTimeDisplay = document.getElementById('avg-time-display');
    const chargeDisplay = document.getElementById('charge-display');
    const submitOrderButton = document.getElementById('submit-order-button');
    const orderForm = document.getElementById('order-form');
    const currentYearSpan = document.getElementById('current-year');

    // Main Form Errors
    const categoryError = document.getElementById('category-error');
    const serviceError = document.getElementById('service-error');
    const linkError = document.getElementById('link-error');
    const quantityError = document.getElementById('quantity-error');

    // Modal Elements
    const modalOverlay = document.getElementById('payment-modal-overlay');
    const modalContent = document.getElementById('payment-modal-content');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalServiceName = document.getElementById('modal-service-name');
    const modalQuantity = document.getElementById('modal-quantity');
    const modalLink = document.getElementById('modal-link');
    const modalCharge = document.getElementById('modal-charge');
    const modalChargeInstruction = document.getElementById('modal-charge-instruction');
    const modalScreenshotUpload = document.getElementById('modal-screenshot-upload');
    const modalFileNameDisplay = document.getElementById('modal-file-name-display');
    const modalScreenshotError = document.getElementById('modal-screenshot-error');
    const confirmPaymentButton = document.getElementById('confirm-payment-button');

    // --- Application State ---
    let currentServiceData = null;
    let validatedOrderData = null; // Store validated data for modal
    let isSubmitting = false; // General submission flag
    let isModalSubmitting = false; // Modal specific submission flag

    // --- Constants ---
    const WHATSAPP_NUMBER = "+201554751270"; // !! تأكد من صحة هذا الرقم !!
    const REQUIRED_FIELD_MSG = "هذا الحقل مطلوب.";
    const INVALID_LINK_MSG = "الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://";
    const INVALID_QUANTITY_MSG = "الرجاء إدخال كمية رقمية صحيحة وأكبر من صفر.";
    const MIN_QUANTITY_MSG = (min) => `الحد الأدنى للكمية هو ${min.toLocaleString()}.`;
    const MAX_QUANTITY_MSG = (max) => `الحد الأقصى للكمية هو ${max.toLocaleString()}.`;
    const SCREENSHOT_REQUIRED_MSG = "الرجاء اختيار صورة إثبات التحويل.";
    const SCREENSHOT_TYPE_MSG = "نوع الملف غير مدعوم. يرجى اختيار صورة (PNG, JPG, JPEG).";
    const SCREENSHOT_SIZE_MSG = (maxSizeMB) => `حجم الصورة كبير جداً (الحد الأقصى: ${maxSizeMB}MB).`;
    const GENERIC_ERROR_MSG = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
    const SUBMIT_ERROR_PRICE_MSG = "خطأ حرج: لا يمكن حساب السعر النهائي. يرجى تحديث الصفحة أو التواصل مع الدعم.";

    // --- Service Data --- (Keep     // --- Service Data ---
    // !! الأهم: قم بمراجعة وتأكيد هذه البيانات بدقة، خاصة الأسعار والحدود الدنيا/القصوى !!
    // !! تم وضع قيم افتراضية للحدود عند عدم ذكرها صراحة !!
    const allServicesData = {
        "TikTok": {
            "مشاهدات": [
                {
                    id: 2001,
                    name: "مشاهدات فيديو [ غير محدود ♾️ ] [ فوري 🚀 ] [ 5 مليون/يوم ] [ رخيص 💰]",
                    // 13 EGP per 100,000 => 13/100 = 0.13 EGP per 1000
                    price_per_100000_egp: 13.0,
                    min_quantity: 10000, // Default assumption
                    max_quantity: 999999999, // Effectively unlimited
                    avg_time: "فوري - 5 مليون/يوم"
                 },
                 {
                    id: 2002,
                    name: "مشاهدات فيديو [ غير محدود ♾️ ] [ فوري 🚀 ] [ 15 مليون/يوم ] [ ضمان مدى الحياة ♻️]",
                    // 22 EGP per 100,000 => 22/100 = 0.22 EGP per 1000
                    price_per_100000_egp: 22.0,
                    min_quantity: 10000, // Default assumption
                    max_quantity: 999999999, // Effectively unlimited
                    avg_time: "فوري - 15 مليون/يوم"
                 }
            ],
            "متابعين": [
                 {
                    id: 2010,
                    name: "متابعين [مقر حقيقي] [فوري 🚀] [ضمان 30 يوم] [50 ألف/يوم] -‼️افتح البث المباشر قبل الطلب‼️",
                    price_per_1000_egp: 25,
                    min_quantity: 100, // Default assumption
                    max_quantity: 100000, // Assuming a high limit based on speed
                    avg_time: "فوري - 50 ألف/يوم"
                 },
                 {
                    id: 2011,
                    name: "متابعين [مقر حقيقي] [فوري 🚀] [ضمان 30 يوم] [100 ألف/يوم] -‼️افتح البث المباشر قبل الطلب‼️",
                    price_per_1000_egp: 30,
                    min_quantity: 100, // Default assumption
                    max_quantity: 200000, // Assuming a high limit based on speed
                    avg_time: "فوري - 100 ألف/يوم"
                 },
                 {
                    id: 2012,
                    name: "متابعين جدد [حساب حقيقي 100%] [فوري ⚡] [10 آلاف/يوم🚀]",
                    price_per_1000_egp: 90,
                    min_quantity: 100, // Default assumption
                    max_quantity: 50000, // Assuming a limit based on speed/type
                    avg_time: "فوري - 10 آلاف/يوم"
                 }
            ],
            "لايكات (فيديو)": [ // Category for regular video likes
                 {
                    id: 2020,
                    name: "لايكات فيديو [جودة عالية] [فوري ⚡] [سريع للغاية 🚀] [100 ألف/يوم] [بدون إعادة تعبئة]",
                    price_per_1000_egp: 10,
                    min_quantity: 100, // Default assumption
                    max_quantity: 200000, // Assuming high limit
                    avg_time: "فوري - 100 ألف/يوم"
                 },
                 {
                    id: 2021,
                    name: "لايكات فيديو [ فوري ⚡ ] [ 50 ألف/يوم ] [ إعادة تعبئة 30 يوم ♻️ ]",
                    price_per_1000_egp: 13,
                    min_quantity: 100, // Default assumption
                    max_quantity: 100000, // Assuming high limit
                    avg_time: "فوري - 50 ألف/يوم"
                 },
                 {
                    id: 2022,
                    name: "طوارئ🚨 | لايكات فيديو قوية [حقيقيون ١٠٠٪ - فوري - ١٠٠ ألف/يوم] [الأفضل للتصنيف]",
                    price_per_1000_egp: 30,
                    min_quantity: 100, // Default assumption
                    max_quantity: 200000, // Assuming high limit
                    avg_time: "فوري - 100 ألف/يوم"
                 }
            ],
            "نقاط معارك PK": [
                {
                    id: 2030,
                    name: "نقاط معركة PK [فوري ⚡] [سريع 🚀] [لا إعادة تعبئة ⛔]",
                    price_per_1000_egp: 15,
                    min_quantity: 1000, // Points usually higher min
                    max_quantity: 500000, // Default assumption
                    avg_time: "فوري - سريع"
                },
                {
                    id: 2031,
                    name: "نقاط معركة PK [بدء: 5 دقائق] [سرعة: 500 ألف/يوم 🔥]",
                    price_per_1000_egp: 23,
                    min_quantity: 1000, // Points usually higher min
                    max_quantity: 1000000, // Default assumption based on speed
                    avg_time: "بدء 5 دقائق - 500 ألف/يوم"
                }
            ],
            "تفاعلات البث المباشر": [
                {
                    id: 2040,
                    name: "لايكات بث مباشر ❤️ [ فوري ] [ 500 ألف/يوم 🚀 ] (النوع 1)", // Added type differentiation
                    price_per_1000_egp: 6,
                    min_quantity: 1000, // Live interactions often higher min
                    max_quantity: 1000000, // Default assumption
                    avg_time: "فوري - 500 ألف/يوم"
                 },
                 {
                    id: 2041,
                    name: "لايكات بث مباشر ❤️ [ فوري ] [ 500 ألف/يوم 🚀 ] (النوع 2)", // Added type differentiation
                    price_per_1000_egp: 7,
                    min_quantity: 1000,
                    max_quantity: 1000000,
                    avg_time: "فوري - 500 ألف/يوم"
                 },
                 {
                    id: 2042,
                    name: "تعليقات بث مباشر [مخصص] [فوري] [50 ألف/يوم 🚀]",
                    price_per_1000_egp: 5,
                    min_quantity: 100, // Comments might have lower min
                    max_quantity: 100000,
                    avg_time: "فوري - 50 ألف/يوم"
                 },
                 {
                    id: 2043,
                    name: "تعليقات بث مباشر [إيموجي] [فوري] [50 ألف/يوم 🚀]",
                    price_per_1000_egp: 5,
                    min_quantity: 100,
                    max_quantity: 100000,
                    avg_time: "فوري - 50 ألف/يوم"
                 }
            ],
            "مشاركات (شير)": [
                 {
                    id: 2050,
                    name: "مشاركات [ غير محدود ♾️ ] [ فوري للغاية ⚡ ] [ 500 ألف/يوم ]",
                    price_per_1000_egp: 12,
                    min_quantity: 100, // Default assumption
                    max_quantity: 999999999, // Unlimited
                    avg_time: "فوري - 500 ألف/يوم"
                 },
                 {
                    id: 2051,
                    name: "مشاركات [ فوري 🔥 ] [ مليون/يوم 🚀 ] [ إعادة تعبئة 365 يوم ♻️ ]",
                    price_per_1000_egp: 15,
                    min_quantity: 100,
                    max_quantity: 2000000, // High limit
                    avg_time: "فوري - 1 مليون/يوم"
                 },
                 {
                    id: 2052,
                    name: "مشاركات [ فائقة السرعة 🚀⚡ ] [ إعادة تعبئة مدى الحياة ♻️ ]",
                    price_per_1000_egp: 16,
                    min_quantity: 100,
                    max_quantity: 5000000, // High limit
                    avg_time: "فائقة السرعة"
                 },
                 {
                     id: 2053,
                     name: "مشاركات [ فوري ⚡ ] [ سريعة جدًا 🔥 ] [ 100 مليون/يوم 🚀 ]",
                     price_per_1000_egp: 6,
                     min_quantity: 1000, // High speed often higher min
                     max_quantity: 999999999, // Very high limit
                     avg_time: "فوري - 100 مليون/يوم"
                 },
                 {
                     id: 2054,
                     name: "مشاركات [ فوري ⚡ ] [ إعادة تعبئة مدى الحياة ♻️ ] [ 100 مليون/يوم 🚀 ]",
                     price_per_1000_egp: 13,
                     min_quantity: 1000,
                     max_quantity: 999999999,
                     avg_time: "فوري - 100 مليون/يوم"
                 }
            ]
        },
        "Instagram": {
             "مشاهدات": [
                 {
                    id: 2100,
                    name: "مشاهدات فيديو [غير محدود♾️] [جميع الروابط] [1 مليون/يوم🚀] [دقيقتان وتكتمل⚡]",
                    price_per_1000_egp: 6,
                    min_quantity: 1000, // Default assumption
                    max_quantity: 999999999, // Unlimited
                    avg_time: "فوري - 1 مليون/يوم (تكتمل بدقيقتين)" // Clarified time
                 },
                 {
                    id: 2101,
                    name: "مشاهدات فيديو [جميع الروابط] [فوري⚡] [فيديو+ريلز+IGTV] [2 مليون/يوم]",
                    price_per_1000_egp: 6,
                    min_quantity: 1000,
                    max_quantity: 999999999, // Assuming high limit based on speed
                    avg_time: "فوري - 2 مليون/يوم"
                 }
             ],
             "متابعين": [
                  {
                    id: 2110,
                    name: "متابعين [30 ألف/يوم🚀] [بدء 0-12 ساعة] [إعادة تعبئة 30 يوم♻️]",
                    price_per_1000_egp: 60,
                    min_quantity: 100, // Default assumption
                    max_quantity: 100000, // High limit
                    avg_time: "0-12 ساعة بدء - 30 ألف/يوم"
                 },
                 {
                    id: 2111,
                    name: "متابعين [حسابات قديمة] [انخفاض بسيط] [60 ألف/يوم🚀] [فوري⚡] [بدون إعادة تعبئة]",
                    price_per_1000_egp: 65,
                    min_quantity: 100,
                    max_quantity: 200000, // High limit
                    avg_time: "فوري - 60 ألف/يوم"
                 },
                 {
                    id: 2112,
                    name: "متابعين [حسابات قديمة] [انخفاض منخفض] [50 ألف/يوم] [إعادة تعبئة 365 يوم♻️]",
                    price_per_1000_egp: 85,
                    min_quantity: 100,
                    max_quantity: 150000, // High limit
                    avg_time: "فوري - 50 ألف/يوم" // Assuming instant start if not specified
                 }
             ],
             "لايكات": [
                 {
                    id: 2120,
                    name: "لايكات [LQ] [فوري⚡] [100 ألف/يوم] [إعادة تعبئة 365 يوم♻️]",
                    price_per_1000_egp: 5,
                    min_quantity: 100, // Default assumption
                    max_quantity: 200000, // High limit
                    avg_time: "فوري - 100 ألف/يوم"
                 },
                 {
                    id: 2121,
                    name: "لايكات [حسابات قديمة+جودة عالية] [200 ألف/يوم] [فوري] [زر إعادة تعبئة 365 يوم⭐]",
                    price_per_1000_egp: 6,
                    min_quantity: 100,
                    max_quantity: 400000, // High limit
                    avg_time: "فوري - 200 ألف/يوم"
                 },
                 {
                     id: 2122,
                     name: "لايكات [جودة مميزة🧛‍♂️] [إعادة تعبئة 365♻️] [سريعة جدًا⚡]",
                     price_per_1000_egp: 12,
                     min_quantity: 50, // Premium might allow lower min
                     max_quantity: 100000, // Default assumption
                     avg_time: "فوري - سريع جدًا"
                 }
             ],
             "مشاركات وتفاعل": [
                 {
                    id: 2130,
                    name: "مشاركة (Share) [فوري⚡] [سريعة جدًا⚡] [إعادة تعبئة مدى الحياة⚡♻️]",
                    price_per_1000_egp: 6,
                    min_quantity: 100, // Default assumption
                    max_quantity: 500000, // Default assumption
                    avg_time: "فوري - سريع جدًا"
                 },
                 {
                     id: 2131,
                     name: "مشاركة + تفاعل (Share + Save) [مستقر] [يعمل 100%] [فوري🔥]",
                     price_per_1000_egp: 12,
                     min_quantity: 100,
                     max_quantity: 100000, // Default assumption
                     avg_time: "فوري - مستقر"
                 }
             ]
         },
        "Facebook": {
            "ردود الفعل (Reactions)": [
                {
                    id: 2200,
                    name: "رد فعل [ إعجاب 👍 ] [ فوري ] [ إعادة تعبئة 30 يوم ♻️ ] [ 1000/يوم ]",
                    price_per_1000_egp: 15,
                    min_quantity: 50, // Reactions often lower min
                    max_quantity: 10000, // Default based on speed
                    avg_time: "فوري - 1000/يوم"
                 },
                 {
                    id: 2201,
                    name: "رد فعل [ حب ♥️ ] [ فوري ] [ إعادة تعبئة 30 يوم ♻️ ] [ 1000/يوم ]",
                    price_per_1000_egp: 15,
                    min_quantity: 50,
                    max_quantity: 10000,
                    avg_time: "فوري - 1000/يوم"
                 },
                 {
                    id: 2202,
                    name: "رد فعل [ اهتمام 🥰 ] [ فوري ] [ إعادة تعبئة 30 يوم ♻️ ] [ 1000/يوم ]",
                    price_per_1000_egp: 15,
                    min_quantity: 50,
                    max_quantity: 10000,
                    avg_time: "فوري - 1000/يوم"
                 },
                 {
                    id: 2203,
                    name: "رد فعل [ هاها 😂 ] [ فوري ] [ إعادة تعبئة 30 يوم ♻️ ] [ 1000/يوم ]",
                    price_per_1000_egp: 15,
                    min_quantity: 50,
                    max_quantity: 10000,
                    avg_time: "فوري - 1000/يوم"
                 },
                 {
                    id: 2204,
                    name: "رد فعل [ رائع 😮 ] [ فوري ] [ إعادة تعبئة 30 يوم ♻️ ] [ 1000/يوم ]",
                    price_per_1000_egp: 15,
                    min_quantity: 50,
                    max_quantity: 10000,
                    avg_time: "فوري - 1000/يوم"
                 },
                 {
                     id: 2205, // Changed from 2204
                     name: "رد فعل [ غاضب 😡 ] [ فوري ] [ إعادة تعبئة 30 يوم ♻️ ] [ 1000/يوم ]", // Corrected emoji name
                     price_per_1000_egp: 15,
                     min_quantity: 50,
                     max_quantity: 10000,
                     avg_time: "فوري - 1000/يوم"
                 },
                 {
                     id: 2206,
                     name: "رد فعل [ حزين 😢 ] [ فوري ] [ إعادة تعبئة 30 يوم ♻️ ] [ 1000/يوم ]",
                     price_per_1000_egp: 15,
                     min_quantity: 50,
                     max_quantity: 10000,
                     avg_time: "فوري - 1000/يوم"
                 }
            ],
            "مشاهدات": [
                {
                    id: 2210,
                    name: "مشاهدات [ بكرة/فيديو ] [ 50 ألف/يوم ] [ غير قابلة للانقطاع ] [ إعادة تعبئة مدى الحياة ♻️ ]",
                    price_per_1000_egp: 12,
                    min_quantity: 1000, // Default assumption
                    max_quantity: 100000, // High limit
                    avg_time: "فوري - 50 ألف/يوم" // Assuming instant start
                 },
                 {
                     id: 2211,
                     name: "مشاهدات [ بكرة/فيديو ] [ احتفاظ عالي 3-20 ث ] [ 100 ألف/يوم ] [ مدى الحياة ♻️ ] [ 10 دقائق تكتمل ⚡]",
                     price_per_1000_egp: 12,
                     min_quantity: 1000,
                     max_quantity: 200000, // High limit
                     avg_time: "فوري - 100 ألف/يوم (تكتمل بـ 10 دقائق)"
                 }
            ],
            "متابعين (صفحة/ملف شخصي)": [
                 {
                    id: 2220,
                    name: "متابعين حقيقيين [صفحة/ملف شخصي] [🎯60% مصري] [إعادة تعبئة 60 يوم] [بدء 24-72 ساعة]",
                    price_per_1000_egp: 55,
                    min_quantity: 100, // Default assumption
                    max_quantity: 50000, // Default assumption
                    avg_time: "بدء 24-72 ساعة"
                 },
                 {
                    id: 2221,
                    name: "متابعين حقيقيين [صفحة/ملف شخصي] [🎯100% مصري] [إعادة تعبئة 60 يوم] [بدء 24-72 ساعة]",
                    price_per_1000_egp: 145,
                    min_quantity: 100,
                    max_quantity: 20000, // Egyptian often lower max
                    avg_time: "بدء 24-72 ساعة"
                 },
                 {
                     id: 2222,
                     name: "متابعين صفحة فقط [🎯100% مصري] [إعادة تعبئة 60 يوم] [بدء 0-24 ساعة]",
                     price_per_1000_egp: 66, // Price was 66
                     min_quantity: 100,
                     max_quantity: 30000, // Egyptian often lower max
                     avg_time: "بدء 0-24 ساعة"
                 }
            ],
             "أعضاء مجموعات": [
                 {
                     id: 2230,
                     name: "أعضاء مجموعة [🎯100% مصري] [نشط] [إعادة تعبئة 120 يوم] [10 ألف/يوم⚡] [بدء 0-48 ساعة]",
                     price_per_1000_egp: 160,
                     min_quantity: 100, // Default assumption
                     max_quantity: 20000, // Default assumption
                     avg_time: "بدء 0-48 ساعة - 10 ألف/يوم"
                 }
             ]
         }
        // يمكنك إضافة منصات أخرى مثل YouTube, Telegram, etc. بنفس الطريقة
    };

    // ... (باقي الكود البرمجي الخاص بـ script.js يظل كما هو) ...

    // --- Helper Functions (Keep formatCurrency, clearInputError, showInputError) ---
    const formatCurrency = (amount) => {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) return "٠٫٠٠ ج.م.‏";
        try {
            return new Intl.NumberFormat('ar-EG', {
                style: 'currency', currency: 'EGP', minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(numericAmount);
        } catch (error) {
            console.error("formatCurrency Error:", error);
            return numericAmount.toFixed(2).replace('.', ',') + " ج.م.";
        }
    };

    const clearInputError = (inputElement, errorElement) => {
        inputElement.classList.remove('invalid');
        inputElement.removeAttribute('aria-invalid');
        if (errorElement) {
             errorElement.textContent = '';
             errorElement.classList.remove('show');
             errorElement.removeAttribute('role');
        }
        if (inputElement.type === 'file') {
            inputElement.closest('.file-upload-wrapper')?.classList.remove('invalid');
        }
    };

    const showInputError = (inputElement, errorElement, message) => {
        inputElement.classList.add('invalid');
        inputElement.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            errorElement.setAttribute('role', 'alert');
        }
         if (inputElement.type === 'file') {
            inputElement.closest('.file-upload-wrapper')?.classList.add('invalid');
        }
    };

    // --- Form Reset Functions ---
    const resetServiceFields = () => {
        serviceSelect.innerHTML = '<option value="" disabled selected>-- اختر الفئة أولاً --</option>';
        serviceSelect.disabled = true;
        linkInput.value = '';
        linkInput.disabled = true;
        quantityInput.value = '';
        quantityInput.disabled = true;
        quantityLimits.textContent = 'الحد الأدنى: - | الحد الأقصى: -';
        avgTimeDisplay.value = '-';
        chargeDisplay.value = formatCurrency(0);
        chargeDisplay.placeholder = formatCurrency(0);
        currentServiceData = null;
        validatedOrderData = null; // Clear validated data on reset

        clearInputError(serviceSelect, serviceError);
        clearInputError(linkInput, linkError);
        clearInputError(quantityInput, quantityError);
    };

    const resetFullForm = () => {
         orderForm.reset();
         clearInputError(categorySelect, categoryError);
         resetServiceFields();
         populateCategories();
         serviceSelect.innerHTML = '<option value="" disabled selected>-- اختر الفئة أولاً --</option>';
         serviceSelect.disabled = true;
         linkInput.disabled = true;
         quantityInput.disabled = true;
         avgTimeDisplay.value = '-';
         chargeDisplay.value = formatCurrency(0);
         chargeDisplay.placeholder = formatCurrency(0);
         setSubmitButtonState(submitOrderButton, false); // Ensure main button is reset
         closeModal(); // Ensure modal is closed on full reset
    };

    // --- Modal Control ---
    const openModal = () => {
        if (!validatedOrderData) {
            console.error("Cannot open modal without validated order data.");
            return;
        }
        // Populate Modal Content
        modalServiceName.textContent = validatedOrderData.serviceName;
        modalQuantity.textContent = validatedOrderData.quantity.toLocaleString('ar-EG');
        modalLink.textContent = validatedOrderData.link; // Display link safely
        const formattedCharge = formatCurrency(validatedOrderData.finalPrice);
        modalCharge.textContent = formattedCharge;
        modalChargeInstruction.textContent = formattedCharge; // Update instruction text too

        // Reset screenshot input in modal
        modalScreenshotUpload.value = '';
        modalFileNameDisplay.textContent = 'لم يتم اختيار أي ملف';
        clearInputError(modalScreenshotUpload, modalScreenshotError);

        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
        modalContent.scrollTop = 0; // Scroll to top
        confirmPaymentButton.focus(); // Focus on the confirm button
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        modalOverlay.setAttribute('aria-hidden', 'true');
        setSubmitButtonState(confirmPaymentButton, false); // Ensure modal button loading state is reset
        validatedOrderData = null; // Clear data when closing
        isModalSubmitting = false; // Reset modal submitting flag
    };

    // --- Button State Control ---
    const setSubmitButtonState = (button, isLoading, isError = false) => {
        const isModalBtn = button === confirmPaymentButton;
        if (isModalBtn) {
            isModalSubmitting = isLoading;
        } else {
            isSubmitting = isLoading;
        }

        button.disabled = isLoading;
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.spinner');

        button.classList.toggle('loading', isLoading);
        if(spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
        if(buttonText) buttonText.style.opacity = isLoading ? '0' : '1';

        button.classList.remove('shake-error'); // Remove previous shake
        button.style.background = ''; // Reset background if changed by shake

        if (isError && !isLoading) {
            button.classList.add('shake-error');
            setTimeout(() => {
                button.classList.remove('shake-error');
                button.style.background = '';
            }, 600);
        }
    };

    // --- Core Functions ---
    const populateCategories = () => {
        categorySelect.innerHTML = '<option value="" disabled selected>-- الرجاء الاختيار --</option>';
        Object.entries(allServicesData).forEach(([platform, categories]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = platform;
            Object.keys(categories).forEach(categoryName => {
                const option = document.createElement('option');
                option.value = `${platform}__${categoryName}`;
                option.textContent = categoryName;
                optgroup.appendChild(option);
            });
            if (optgroup.childElementCount > 0) {
                categorySelect.appendChild(optgroup);
            }
        });
        categorySelect.disabled = false;
    };

    const populateServices = (platform, categoryName) => {
        resetServiceFields(); // Resets link/quantity disable states correctly

        const services = allServicesData[platform]?.[categoryName];
        if (!services || services.length === 0) {
            serviceSelect.innerHTML = '<option value="" disabled selected>-- لا توجد خدمات لهذه الفئة --</option>';
            serviceSelect.disabled = true;
            return;
        }

        serviceSelect.innerHTML = '<option value="" disabled selected>-- اختر الخدمة المطلوبة --</option>';
        services.forEach(service => {
            if (typeof service.price_per_1000_egp !== 'number' || isNaN(service.price_per_1000_egp) ||
                typeof service.min_quantity !== 'number' || typeof service.max_quantity !== 'number' ||
                service.min_quantity <= 0 || service.max_quantity < service.min_quantity) {
                console.error(`Data Error: Invalid data for service "${service.name}" (ID: ${service.id}). Skipping.`);
                return;
            }

            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} (${formatCurrency(service.price_per_1000_egp)} / 1000)`;
            option.dataset.price = service.price_per_1000_egp;
            option.dataset.min = service.min_quantity;
            option.dataset.max = service.max_quantity;
            option.dataset.avgTime = service.avg_time || '-';
            option.dataset.fullName = service.name;
            serviceSelect.appendChild(option);
        });
        serviceSelect.disabled = false;
    };

    const calculateAndUpdateCharge = () => {
        clearInputError(quantityInput, quantityError);
        let calculatedCharge = 0;
        let isValid = true;

        if (!currentServiceData || typeof currentServiceData.price_per_1000_egp !== 'number') {
            chargeDisplay.value = formatCurrency(0);
            return false;
        }

        const quantityStr = quantityInput.value.trim();
        const pricePer1000 = currentServiceData.price_per_1000_egp;
        const min = currentServiceData.min_quantity;
        const max = currentServiceData.max_quantity;

        if (quantityStr === '') {
            isValid = false;
        } else {
            const quantity = parseInt(quantityStr);
            if (isNaN(quantity) || quantity <= 0) {
                 isValid = false;
            } else if (quantity < min) {
                 showInputError(quantityInput, quantityError, MIN_QUANTITY_MSG(min));
                 isValid = false;
            } else if (quantity > max) {
                 showInputError(quantityInput, quantityError, MAX_QUANTITY_MSG(max));
                 isValid = false;
            } else {
                 calculatedCharge = (quantity / 1000) * pricePer1000;
                 isValid = true;
            }
        }

        chargeDisplay.value = formatCurrency(calculatedCharge);
        chargeDisplay.placeholder = formatCurrency(0);
        return isValid;
    };

    const handleServiceSelection = () => {
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
        clearInputError(serviceSelect, serviceError);

        if (!selectedOption || !selectedOption.value) {
            // Reset fields if "-- اختر الخدمة --" is selected
            linkInput.value = ''; linkInput.disabled = true;
            quantityInput.value = ''; quantityInput.disabled = true;
            quantityLimits.textContent = 'الحد الأدنى: - | الحد الأقصى: -';
            avgTimeDisplay.value = '-';
            chargeDisplay.value = formatCurrency(0);
            currentServiceData = null;
            clearInputError(quantityInput, quantityError);
            return;
        }

        const price = parseFloat(selectedOption.dataset.price);
        const min = parseInt(selectedOption.dataset.min);
        const max = parseInt(selectedOption.dataset.max);

        if (isNaN(price) || isNaN(min) || isNaN(max)) {
             console.error("Data Error: Invalid data attributes on selected service option.", selectedOption.dataset);
             showInputError(serviceSelect, serviceError, GENERIC_ERROR_MSG);
             resetServiceFields();
             return;
        }

        currentServiceData = {
            id: parseInt(selectedOption.value),
            name: selectedOption.dataset.fullName || `خدمة ${selectedOption.value}`,
            price_per_1000_egp: price,
            min_quantity: min,
            max_quantity: max,
            avg_time: selectedOption.dataset.avgTime || '-'
        };

        linkInput.disabled = false;
        quantityInput.disabled = false;
        quantityInput.value = '';
        quantityInput.min = min;
        quantityInput.max = max;
        quantityLimits.textContent = `الحد الأدنى: ${min.toLocaleString()} | الحد الأقصى: ${max.toLocaleString()}`;
        avgTimeDisplay.value = currentServiceData.avg_time;
        calculateAndUpdateCharge();
        // Optional: quantityInput.focus(); // Can be annoying if user wants to check other fields first
    };

    /** Validates only the initial form fields (before modal) */
    const validateInitialForm = () => {
        let isValid = true;
        let firstInvalidElement = null;

        const elementsToClear = [
            { input: categorySelect, error: categoryError },
            { input: serviceSelect, error: serviceError },
            { input: linkInput, error: linkError },
            { input: quantityInput, error: quantityError },
        ];
        elementsToClear.forEach(item => clearInputError(item.input, item.error));

        // 1. Validate Category
        if (!categorySelect.value) {
            showInputError(categorySelect, categoryError, "الرجاء اختيار الفئة.");
            isValid = false;
            if (!firstInvalidElement) firstInvalidElement = categorySelect;
        }

        // 2. Validate Service
        if (!serviceSelect.value || !currentServiceData) { // Check currentServiceData too
            showInputError(serviceSelect, serviceError, "الرجاء اختيار خدمة صالحة.");
            isValid = false;
             if (!firstInvalidElement) firstInvalidElement = serviceSelect;
        }

        // 3. Validate Link
        const link = linkInput.value.trim();
        if (!link) {
            showInputError(linkInput, linkError, REQUIRED_FIELD_MSG);
            isValid = false;
             if (!firstInvalidElement) firstInvalidElement = linkInput;
        } else {
            try {
                const url = new URL(link);
                if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
            } catch (_) {
                showInputError(linkInput, linkError, INVALID_LINK_MSG);
                isValid = false;
                 if (!firstInvalidElement) firstInvalidElement = linkInput;
            }
        }

        // 4. Validate Quantity
        const quantityStr = quantityInput.value.trim();
        const quantity = parseInt(quantityStr);
        if (quantityStr === '' || isNaN(quantity) || quantity <= 0) {
            showInputError(quantityInput, quantityError, INVALID_QUANTITY_MSG);
            isValid = false;
            if (!firstInvalidElement) firstInvalidElement = quantityInput;
        } else if (currentServiceData) { // Check against limits only if service selected
            const min = currentServiceData.min_quantity;
            const max = currentServiceData.max_quantity;
            if (quantity < min) {
                showInputError(quantityInput, quantityError, MIN_QUANTITY_MSG(min));
                isValid = false;
                 if (!firstInvalidElement) firstInvalidElement = quantityInput;
            } else if (quantity > max) {
                showInputError(quantityInput, quantityError, MAX_QUANTITY_MSG(max));
                isValid = false;
                 if (!firstInvalidElement) firstInvalidElement = quantityInput;
            }
        } else if (isValid) { // If quantity is numeric but no service selected (shouldn't happen if logic is right)
             showInputError(serviceSelect, serviceError, "الرجاء اختيار خدمة صالحة أولاً.");
             isValid = false;
             if (!firstInvalidElement) firstInvalidElement = serviceSelect;
        }

        // Ensure final price calculation is possible
        if (isValid && (!currentServiceData || typeof currentServiceData.price_per_1000_egp !== 'number')) {
             console.error("Validation Error: Cannot calculate final price.");
             // Show a generic error perhaps on the charge display or service select
             showInputError(serviceSelect, serviceError, "خطأ في بيانات الخدمة. حاول اختيارها مرة أخرى.");
             isValid = false;
             if (!firstInvalidElement) firstInvalidElement = serviceSelect;
        }


        // Scroll to first error
         if (!isValid && firstInvalidElement) {
            firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidElement.focus();
        }

        return isValid;
    };

    /** Validates only the screenshot input within the modal */
    const validateScreenshot = () => {
        clearInputError(modalScreenshotUpload, modalScreenshotError);
        let isValid = true;
        const maxSizeMB = 5; // 5MB limit

        if (modalScreenshotUpload.files.length === 0) {
            showInputError(modalScreenshotUpload, modalScreenshotError, SCREENSHOT_REQUIRED_MSG);
            isValid = false;
        } else {
            const file = modalScreenshotUpload.files[0];
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                showInputError(modalScreenshotUpload, modalScreenshotError, SCREENSHOT_TYPE_MSG);
                isValid = false;
            } else if (file.size > maxSizeMB * 1024 * 1024) {
                 showInputError(modalScreenshotUpload, modalScreenshotError, SCREENSHOT_SIZE_MSG(maxSizeMB));
                 isValid = false;
            }
        }
        return isValid;
    };


    /** Handles the INITIAL form submission (triggers validation and opens modal) */
    const handleInitialSubmit = (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        setSubmitButtonState(submitOrderButton, true); // Show loading on main button

        if (!validateInitialForm()) {
            console.warn("Initial form validation failed.");
            setSubmitButtonState(submitOrderButton, false, true); // Show error shake
            return;
        }

        // --- Initial validation passed ---
        const quantity = parseInt(quantityInput.value);
        const finalPrice = (quantity / 1000) * currentServiceData.price_per_1000_egp;
        const [platform, categoryName] = categorySelect.value.split('__');

        // Store data needed for the modal and final submission
        validatedOrderData = {
            platform: platform,
            categoryName: categoryName,
            serviceId: currentServiceData.id,
            serviceName: currentServiceData.name,
            quantity: quantity,
            link: linkInput.value.trim(),
            finalPrice: finalPrice,
            // avgTime: currentServiceData.avg_time // Can add if needed in modal/message
        };

        setSubmitButtonState(submitOrderButton, false); // Hide loading on main button
        openModal(); // Open the confirmation modal
    };

    /** Handles the FINAL confirmation from the modal */
    const handleModalConfirm = () => {
        if (isModalSubmitting || !validatedOrderData) return;

        if (!validateScreenshot()) {
            console.warn("Screenshot validation failed in modal.");
            modalScreenshotUpload.focus(); // Focus the screenshot input
            return; // Keep modal open
        }

        // --- Screenshot is valid, proceed with WhatsApp ---
        setSubmitButtonState(confirmPaymentButton, true); // Show loading on modal button

        // Build WhatsApp message using validatedOrderData
        let message = `*🚀 طلب خدمة جديد 🚀*\n\n`;
        message += `*المنصة:* ${validatedOrderData.platform}\n`;
        message += `*الفئة:* ${validatedOrderData.categoryName}\n`;
        message += `*الخدمة:* ${validatedOrderData.serviceName} (ID: ${validatedOrderData.serviceId})\n`;
        message += `*الكمية:* ${validatedOrderData.quantity.toLocaleString('ar-EG')}\n`;
        message += `*الرابط:* \n\`\`\`${validatedOrderData.link}\`\`\`\n`;
        message += `*التكلفة:* ${formatCurrency(validatedOrderData.finalPrice)}\n\n`;
        message += `-----------------------\n`;
        message += `✅ *تم الدفع*\n`;
        message += `📸 *تم إرفاق إثبات التحويل.*\n\n`;
        message += `*🙏 سيتم مراجعة الإثبات والبدء في تنفيذ طلبك في أقرب وقت.*`; // Updated confirmation text

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        // --- Redirect User (with short delay for spinner) ---
        setTimeout(() => {
             try {
                 const whatsappWindow = window.open(whatsappUrl, '_blank');
                  if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed == 'undefined') {
                      console.warn("Could not open WhatsApp in new tab, redirecting current window.");
                      window.location.href = whatsappUrl;
                 }
                 // Don't show alert here, reset happens after redirect attempt
                 // Close modal *before* resetting form to avoid flicker
                 closeModal();
                 resetFullForm();
             } catch (error) {
                 console.error("Error opening WhatsApp link:", error);
                 alert("حدث خطأ أثناء محاولة فتح واتساب. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.");
                 setSubmitButtonState(confirmPaymentButton, false); // Re-enable modal button on error
             }
             // No finally needed here as reset handles button state
         }, 200);
    };


    // --- Event Listeners Setup ---

    // Main Form Listeners
    categorySelect.addEventListener('change', (event) => {
        clearInputError(categorySelect, categoryError);
        const selectedValue = event.target.value;
        if (selectedValue) {
            const [platform, categoryName] = selectedValue.split('__');
            populateServices(platform, categoryName);
        } else {
            resetServiceFields();
        }
    });
    serviceSelect.addEventListener('change', handleServiceSelection);
    quantityInput.addEventListener('input', calculateAndUpdateCharge);
    linkInput.addEventListener('input', () => clearInputError(linkInput, linkError));
    orderForm.addEventListener('submit', handleInitialSubmit); // Changed to initial submit handler

    // Modal Listeners
    modalCloseButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        // Close only if clicking the overlay itself, not the content
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    // Update file name display within the modal
    modalScreenshotUpload.addEventListener('change', () => {
        clearInputError(modalScreenshotUpload, modalScreenshotError); // Clear error on change
        modalFileNameDisplay.textContent = modalScreenshotUpload.files.length > 0
            ? modalScreenshotUpload.files[0].name
            : 'لم يتم اختيار أي ملف';
    });
    confirmPaymentButton.addEventListener('click', handleModalConfirm); // Final confirm handler

    // --- Initial Page Load Setup ---
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    populateCategories();
    resetServiceFields(); // Initial state setup
    linkInput.disabled = true;

}); // End DOMContentLoaded
