"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    // (Keep all previous references)
    const pageLoader = document.querySelector('.page-loader');
    const categorySelect = document.getElementById('category-select');
    const searchInput = document.getElementById('search-input');
    const searchSpinner = document.getElementById('search-spinner');
    const searchStatus = document.getElementById('search-status');
    const serviceSelect = document.getElementById('service-select');
    const serviceDescriptionArea = document.getElementById('service-description-area');
    const serviceDescriptionText = document.getElementById('service-description-text');
    const serviceDetailsStep = document.getElementById('service-details-step');
    const linkInput = document.getElementById('link-input');
    const linkHint = document.getElementById('link-hint');
    const quantityInput = document.getElementById('quantity-input');
    const quantityLimits = document.getElementById('quantity-limits');
    const avgTimeDisplay = document.getElementById('avg-time-display');
    const chargeDisplay = document.getElementById('charge-display');
    const submitOrderButton = document.getElementById('submit-order-button');
    const orderForm = document.getElementById('order-form');
    const currentYearSpan = document.getElementById('current-year');
    const formStatusMessage = document.getElementById('form-status-message');
    const copyFeedbackEl = document.getElementById('copy-feedback');
    const categoryError = document.getElementById('category-error');
    const serviceError = document.getElementById('service-error');
    const linkError = document.getElementById('link-error');
    const quantityError = document.getElementById('quantity-error');
    const modalOverlay = document.getElementById('payment-modal-overlay');
    const modalContent = document.getElementById('payment-modal-content');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalServiceName = document.getElementById('modal-service-name');
    const modalQuantity = document.getElementById('modal-quantity');
    const modalLink = document.getElementById('modal-link');
    const modalCharge = document.getElementById('modal-charge');
    const modalChargeInstruction = document.getElementById('modal-charge-instruction');
    const confirmPaymentButton = document.getElementById('confirm-payment-button');
    const modalStatusMessage = document.getElementById('modal-status-message');
    const modalAnimatedSections = document.querySelectorAll('.modal-animate');
    const modalContactInput = document.getElementById('modal-contact-info');
    const modalContactError = document.getElementById('modal-contact-error');
    const paymentMethodItems = document.querySelectorAll('.payment-methods li');
    const rippleButtons = document.querySelectorAll('.with-ripple'); // Select buttons for ripple

    // --- Application State ---
    // (Keep all state variables)
    let currentServiceData = null;
    let validatedOrderData = null;
    let isSubmitting = false;
    let isModalSubmitting = false;
    let currentCategoryServices = [];
    let searchTimeout = null;
    const SEARCH_DEBOUNCE_DELAY = 300;
    let copyTimeout = null;

    // --- Constants ---
    // (Keep all constants)
    const EMAILJS_SERVICE_ID = "service_jy0utzi";
    const EMAILJS_TEMPLATE_ID = "template_qoyllof";
    const REQUIRED_FIELD_MSG = "هذا الحقل مطلوب.";
    const CONTACT_INFO_REQUIRED_MSG = "الرجاء إدخال بريد إلكتروني أو رقم واتساب للتواصل.";
    const INVALID_LINK_MSG = "الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://";
    const INVALID_QUANTITY_MSG = "الرجاء إدخال كمية رقمية صحيحة وأكبر من صفر.";
    const MIN_QUANTITY_MSG = (min) => `الحد الأدنى للكمية هو ${min.toLocaleString('ar-EG')}.`;
    const MAX_QUANTITY_MSG = (max) => `الحد الأقصى للكمية هو ${max.toLocaleString('ar-EG')}.`;
    const GENERIC_ERROR_MSG = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
    const SUBMIT_ERROR_PRICE_MSG = "خطأ حرج: لا يمكن حساب السعر النهائي.";
    const EMAIL_SEND_SUCCESS_MSG = "✅ تم إرسال طلبك بنجاح! سنتواصل معك قريبًا لتأكيد الدفع.";
    const EMAIL_SEND_ERROR_MSG = "❌ حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى أو تواصل معنا.";
    const COPY_SUCCESS_MSG = "تم النسخ!";
    const COPY_ERROR_MSG = "فشل النسخ!";
    const SEARCH_PLACEHOLDER_DEFAULT = "ابحث بالاسم، الوصف، أو الرقم...";
    const SEARCH_PLACEHOLDER_NO_CATEGORY = "اختر منصة أولاً للبحث...";
    const SEARCH_MSG_EMPTY = "";
    const SEARCH_MSG_SEARCHING = "جاري البحث...";
    const SEARCH_MSG_NO_RESULTS = "لم يتم العثور على خدمات مطابقة.";
    const SEARCH_MSG_RESULTS_FOUND = (count) => `تم العثور على ${count} خدمة.`;

    // --- Service Data ---
    // (Keep the same data structure)
    const allServicesData = { // Keep the same data structure as previous version
        "TikTok": {
            "مشاهدات": [
                { id: 2001, name: "مشاهدات فيديو [ غير محدود ♾️ ] [ فوري 🚀 ]", price_per_1000_egp: 0.13, min_quantity: 1000, max_quantity: 999999999, avg_time: "فوري - 5 مليون/يوم", description: "زيادة مشاهدات فيديوهات تيك توك بسرعة فائقة وبكميات غير محدودة. مثالية للوصول الفيروسي السريع." },
                { id: 2002, name: "مشاهدات فيديو [ ضمان مدى الحياة ♻️ ]", price_per_1000_egp: 0.22, min_quantity: 10000, max_quantity: 999999999, avg_time: "فوري - 15 مليون/يوم", description: "مشاهدات عالية الجودة مع ضمان تعويض النقص مدى الحياة، سرعة تنفيذ ممتازة." }
            ],
            "متابعين": [
                { id: 2010, name: "متابعين [مقر حقيقي] [ضمان 30 يوم]", price_per_1000_egp: 25, min_quantity: 100, max_quantity: 100000, avg_time: "فوري - 50 ألف/يوم", description: "زيادة متابعين تيك توك بجودة عالية وسرعة جيدة مع ضمان لمدة شهر. *ملاحظة: تأكد من أن البث المباشر متاح في حسابك قبل الطلب.*" },
                { id: 2011, name: "متابعين [مقر حقيقي] [سرعة أعلى 🚀]", price_per_1000_egp: 30, min_quantity: 100, max_quantity: 200000, avg_time: "فوري - 100 ألف/يوم", description: "نفس جودة المتابعين السابقة ولكن بسرعة تنفيذ أعلى تصل إلى 100 ألف يوميًا. *ملاحظة: تأكد من أن البث المباشر متاح في حسابك قبل الطلب.*" },
                { id: 2012, name: "متابعين جدد [حساب حقيقي 100%]", price_per_1000_egp: 90, min_quantity: 100, max_quantity: 50000, avg_time: "فوري - 10 آلاف/يوم", description: "متابعين من حسابات تبدو حقيقية بنسبة 100%، مثالية لتحسين مظهر الحساب." }
            ],
             "لايكات (فيديو)": [
                { id: 2020, name: "لايكات فيديو [جودة عالية] [فوري ⚡]", price_per_1000_egp: 10, min_quantity: 100, max_quantity: 200000, avg_time: "فوري - 100 ألف/يوم", description: "لايكات (قلوب) على فيديوهات تيك توك بجودة عالية وسرعة تنفيذ ممتازة جدًا." },
                { id: 2021, name: "لايكات فيديو [ إعادة تعبئة 30 يوم ♻️ ]", price_per_1000_egp: 13, min_quantity: 100, max_quantity: 100000, avg_time: "فوري - 50 ألف/يوم", description: "لايكات تيك توك مع ضمان إعادة تعبئة لمدة 30 يومًا في حال حدوث أي نقص." },
                { id: 2022, name: "طوارئ🚨 | لايكات فيديو قوية [الأفضل للتصنيف]", price_per_1000_egp: 30, min_quantity: 100, max_quantity: 200000, avg_time: "فوري - 100 ألف/يوم", description: "لايكات ذات جودة فائقة من حسابات حقيقية، تعتبر الأفضل للمساعدة في رفع تصنيف الفيديو." }
            ],
             "نقاط معارك PK": [
                 { id: 2030, name: "نقاط معركة PK [فوري ⚡]", price_per_1000_egp: 15, min_quantity: 1000, max_quantity: 500000, avg_time: "فوري - سريع", description: "زيادة نقاط التحديات (PK Battles) في البث المباشر بسرعة." },
                 { id: 2031, name: "نقاط معركة PK [سرعة: 500 ألف/يوم 🔥]", price_per_1000_egp: 23, min_quantity: 1000, max_quantity: 1000000, avg_time: "بدء 5 دقائق - 500 ألف/يوم", description: "زيادة نقاط تحديات البث المباشر بسرعة عالية جدًا تصل إلى نصف مليون نقطة يوميًا." }
            ],
            "تفاعلات البث المباشر": [
                { id: 2040, name: "لايكات بث مباشر ❤️ (النوع 1)", price_per_1000_egp: 6, min_quantity: 1000, max_quantity: 1000000, avg_time: "فوري - 500 ألف/يوم", description: "إرسال قلوب (لايكات) للبث المباشر بكميات كبيرة لتحسين التفاعل." },
                { id: 2041, name: "لايكات بث مباشر ❤️ (النوع 2)", price_per_1000_egp: 7, min_quantity: 1000, max_quantity: 1000000, avg_time: "فوري - 500 ألف/يوم", description: "نوع آخر من لايكات البث المباشر، جودة وسرعة مماثلة." },
                { id: 2042, name: "تعليقات بث مباشر [مخصص]", price_per_1000_egp: 5, min_quantity: 100, max_quantity: 100000, avg_time: "فوري - 50 ألف/يوم", description: "إرسال تعليقات مخصصة (تحددها أنت) إلى البث المباشر. *ملاحظة: قد تحتاج للتواصل لتحديد التعليقات المطلوبة.*" },
                { id: 2043, name: "تعليقات بث مباشر [إيموجي]", price_per_1000_egp: 5, min_quantity: 100, max_quantity: 100000, avg_time: "فوري - 50 ألف/يوم", description: "إرسال تعليقات عبارة عن رموز تعبيرية (إيموجي) متنوعة إلى البث المباشر." }
            ],
            "مشاركات (شير)": [
                { id: 2050, name: "مشاركات [ غير محدود ♾️ ] [ فوري للغاية ⚡ ]", price_per_1000_egp: 12, min_quantity: 100, max_quantity: 999999999, avg_time: "فوري - 500 ألف/يوم", description: "زيادة عدد مشاركات (شير) الفيديو الخاص بك بسرعة فائقة للمساعدة في الانتشار." },
                { id: 2051, name: "مشاركات [ فوري 🔥 ] [ مليون/يوم 🚀 ] [ إعادة تعبئة 365 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 100, max_quantity: 2000000, avg_time: "فوري - 1 مليون/يوم", description: "مشاركات سريعة جدًا مع ضمان إعادة تعبئة لمدة سنة كاملة." },
                 { id: 2052, name: "مشاركات [ فائقة السرعة 🚀⚡ ] [ إعادة تعبئة مدى الحياة ♻️ ]", price_per_1000_egp: 16, min_quantity: 100, max_quantity: 5000000, avg_time: "فائقة السرعة", description: "أسرع خدمة مشاركات متوفرة مع ضمان تعويض مدى الحياة." },
                 { id: 2053, name: "مشاركات [ فوري ⚡ ] [ سريعة جدًا 🔥 ] [ 100 مليون/يوم 🚀 ]", price_per_1000_egp: 6, min_quantity: 1000, max_quantity: 999999999, avg_time: "فوري - 100 مليون/يوم", description: "مشاركات بسرعة جنونية تصل إلى 100 مليون يوميًا بسعر تنافسي (بدون ضمان)." },
                 { id: 2054, name: "مشاركات [ فوري ⚡ ] [ إعادة تعبئة مدى الحياة ♻️ ] [ 100 مليون/يوم 🚀 ]", price_per_1000_egp: 13, min_quantity: 1000, max_quantity: 999999999, avg_time: "فوري - 100 مليون/يوم", description: "نفس سرعة الـ 100 مليون مشاركة يوميًا ولكن مع إضافة ضمان مدى الحياة." }
            ]
        },
         "Instagram": {
             "مشاهدات": [
                 { id: 2100, name: "مشاهدات فيديو [غير محدود♾️] [1 مليون/يوم🚀]", price_per_1000_egp: 6, min_quantity: 1000, max_quantity: 999999999, avg_time: "فوري - 1 مليون/يوم", description: "مشاهدات لجميع أنواع فيديوهات انستغرام (فيديو عادي، ريلز، IGTV) بسرعة عالية جدًا." },
                 { id: 2101, name: "مشاهدات فيديو [فيديو+ريلز+IGTV] [2 مليون/يوم]", price_per_1000_egp: 6, min_quantity: 1000, max_quantity: 999999999, avg_time: "فوري - 2 مليون/يوم", description: "زيادة مشاهدات فيديوهات انستغرام المختلفة بسرعة تنفيذ أعلى." }
             ],
             "متابعين": [
                 { id: 2110, name: "متابعين [30 ألف/يوم🚀] [ضمان 30 يوم♻️]", price_per_1000_egp: 60, min_quantity: 100, max_quantity: 100000, avg_time: "0-12 ساعة بدء - 30 ألف/يوم", description: "متابعون انستغرام بجودة جيدة مع ضمان تعويض النقص لمدة 30 يومًا." },
                 { id: 2111, name: "متابعين [حسابات قديمة] [انخفاض بسيط]", price_per_1000_egp: 65, min_quantity: 100, max_quantity: 200000, avg_time: "فوري - 60 ألف/يوم", description: "متابعون من حسابات تبدو قديمة، معدل النقص قليل نسبيًا، بدون ضمان تعويض." },
                 { id: 2112, name: "متابعين [حسابات قديمة] [ضمان 365 يوم♻️]", price_per_1000_egp: 85, min_quantity: 100, max_quantity: 150000, avg_time: "فوري - 50 ألف/يوم", description: "متابعون من حسابات قديمة بجودة عالية مع ضمان تعويض النقص لمدة سنة كاملة." }
             ],
             "لايكات": [
                 { id: 2120, name: "لايكات [LQ] [ضمان 365 يوم♻️]", price_per_1000_egp: 5, min_quantity: 100, max_quantity: 200000, avg_time: "فوري - 100 ألف/يوم", description: "لايكات انستغرام أساسية (LQ) بسعر منخفض وسرعة عالية مع ضمان لمدة سنة." },
                 { id: 2121, name: "لايكات [حسابات قديمة+جودة عالية] [ضمان 365 يوم⭐]", price_per_1000_egp: 6, min_quantity: 100, max_quantity: 400000, avg_time: "فوري - 200 ألف/يوم", description: "لايكات بجودة أفضل من حسابات قديمة مع ضمان سنة وسرعة تنفيذ عالية." },
                 { id: 2122, name: "لايكات [جودة مميزة🧛‍♂️] [ضمان 365♻️]", price_per_1000_egp: 12, min_quantity: 50, max_quantity: 100000, avg_time: "فوري - سريع جدًا", description: "لايكات انستغرام بأعلى جودة متاحة، مثالية للمنشورات الهامة، مع ضمان سنة." }
             ],
             "مشاركات وتفاعل": [
                 { id: 2130, name: "مشاركة (Share) [فوري⚡] [مدى الحياة⚡♻️]", price_per_1000_egp: 6, min_quantity: 100, max_quantity: 500000, avg_time: "فوري - سريع جدًا", description: "زيادة عدد مشاركات (Shares) منشورات انستغرام بسرعة، مع ضمان مدى الحياة." },
                 { id: 2131, name: "مشاركة + حفظ (Share + Save) [مستقر]", price_per_1000_egp: 12, min_quantity: 100, max_quantity: 100000, avg_time: "فوري - مستقر", description: "زيادة تفاعل المنشور عبر زيادة المشاركات (Shares) والحفظ (Saves) معًا." }
             ]
        },
         "Facebook": {
            "ردود الفعل (Reactions)": [
                 { id: 2200, name: "رد فعل [ إعجاب 👍 ] [ ضمان 30 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 50, max_quantity: 10000, avg_time: "فوري - 1000/يوم", description: "زيادة تفاعل 'الإعجاب' (Like) على منشورات فيسبوك مع ضمان تعويض لمدة شهر." },
                 { id: 2201, name: "رد فعل [ حب ♥️ ] [ ضمان 30 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 50, max_quantity: 10000, avg_time: "فوري - 1000/يوم", description: "زيادة تفاعل 'أحببته' (Love) على منشورات فيسبوك مع ضمان تعويض لمدة شهر." },
                 { id: 2202, name: "رد فعل [ اهتمام 🥰 ] [ ضمان 30 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 50, max_quantity: 10000, avg_time: "فوري - 1000/يوم", description: "زيادة تفاعل 'أدعمه' (Care) على منشورات فيسبوك مع ضمان تعويض لمدة شهر." },
                 { id: 2203, name: "رد فعل [ هاها 😂 ] [ ضمان 30 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 50, max_quantity: 10000, avg_time: "فوري - 1000/يوم", description: "زيادة تفاعل 'أضحكني' (Haha) على منشورات فيسبوك مع ضمان تعويض لمدة شهر." },
                 { id: 2204, name: "رد فعل [ رائع 😮 ] [ ضمان 30 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 50, max_quantity: 10000, avg_time: "فوري - 1000/يوم", description: "زيادة تفاعل 'واو' (Wow) على منشورات فيسبوك مع ضمان تعويض لمدة شهر." },
                 { id: 2205, name: "رد فعل [ غاضب 😡 ] [ ضمان 30 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 50, max_quantity: 10000, avg_time: "فوري - 1000/يوم", description: "زيادة تفاعل 'أغضبني' (Angry) على منشورات فيسبوك مع ضمان تعويض لمدة شهر." },
                 { id: 2206, name: "رد فعل [ حزين 😢 ] [ ضمان 30 يوم ♻️ ]", price_per_1000_egp: 15, min_quantity: 50, max_quantity: 10000, avg_time: "فوري - 1000/يوم", description: "زيادة تفاعل 'أحزنني' (Sad) على منشورات فيسبوك مع ضمان تعويض لمدة شهر." }
             ],
            "مشاهدات": [
                { id: 2210, name: "مشاهدات [ بكرة/فيديو ] [ ضمان مدى الحياة ♻️ ]", price_per_1000_egp: 12, min_quantity: 1000, max_quantity: 100000, avg_time: "فوري - 50 ألف/يوم", description: "زيادة مشاهدات مقاطع الفيديو أو الريلز على فيسبوك، مع ضمان تعويض للنقص مدى الحياة." },
                { id: 2211, name: "مشاهدات [ احتفاظ عالي 3-20 ث ] [ مدى الحياة ♻️ ]", price_per_1000_egp: 12, min_quantity: 1000, max_quantity: 200000, avg_time: "فوري - 100 ألف/يوم (تكتمل بـ 10 دقائق)", description: "مشاهدات فيديو فيسبوك مع نسبة احتفاظ جيدة (3-20 ثانية)، تساعد في خوارزميات فيسبوك، مع ضمان مدى الحياة." }
            ],
            "متابعين (صفحة/ملف شخصي)": [
                { id: 2220, name: "متابعين حقيقيين [🎯60% مصري] [ضمان 60 يوم]", price_per_1000_egp: 55, min_quantity: 100, max_quantity: 50000, avg_time: "بدء 24-72 ساعة", description: "زيادة متابعين لصفحات أو ملفات فيسبوك الشخصية، نسبة كبيرة منهم من مصر، مع ضمان 60 يومًا." },
                { id: 2221, name: "متابعين حقيقيين [🎯100% مصري] [ضمان 60 يوم]", price_per_1000_egp: 145, min_quantity: 100, max_quantity: 20000, avg_time: "بدء 24-72 ساعة", description: "متابعون مصريون 100% لصفحات أو ملفات فيسبوك الشخصية، مثالي للاستهداف المحلي، مع ضمان 60 يومًا." },
                { id: 2222, name: "متابعين صفحة فقط [🎯100% مصري] [ضمان 60 يوم]", price_per_1000_egp: 66, min_quantity: 100, max_quantity: 30000, avg_time: "بدء 0-24 ساعة", description: "متابعون مصريون 100% مخصصون لصفحات فيسبوك فقط (وليس الملفات الشخصية)، مع ضمان 60 يومًا." }
            ],
             "أعضاء مجموعات": [
                 { id: 2230, name: "أعضاء مجموعة [🎯100% مصري] [نشط] [ضمان 120 يوم]", price_per_1000_egp: 160, min_quantity: 100, max_quantity: 20000, avg_time: "بدء 0-48 ساعة - 10 ألف/يوم", description: "زيادة أعضاء مجموعات فيسبوك بأعضاء مصريين 100% ونشطين، مع ضمان طويل لمدة 120 يومًا." }
             ]
         }
    };

    // --- Helper Functions ---
    // (Keep: formatCurrency, debounce, clearInputError, showInputError, showStatusMessage, hideStatusMessage, setElementDisabled, showCopyFeedback, copyToClipboard)
     const formatCurrency = (amount) => { const numericAmount = Number(amount); if (isNaN(numericAmount)) return "٠٫٠٠ ج.م.‏"; try { return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericAmount); } catch (error) { console.error("formatCurrency Error:", error); return numericAmount.toFixed(2).replace('.', ',') + " ج.م.‏"; } };
     const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => { func.apply(this, args); }, delay); }; };
     const clearInputError = (inputElement, errorElement) => { if (!inputElement) return; inputElement.closest('.input-wrapper')?.classList.remove('invalid'); inputElement.removeAttribute('aria-invalid'); if (errorElement) { errorElement.classList.remove('show'); errorElement.textContent = ''; } };
     const showInputError = (inputElement, errorElement, message) => { if (!inputElement) return; inputElement.closest('.input-wrapper')?.classList.add('invalid'); inputElement.setAttribute('aria-invalid', 'true'); if (errorElement) { errorElement.textContent = message; errorElement.classList.add('show'); inputElement.setAttribute('aria-describedby', errorElement.id); } };
     const showStatusMessage = (element, message, type = 'error') => { if (!element) return; requestAnimationFrame(() => { element.textContent = message; element.className = `status-message ${type}`; void element.offsetWidth; element.classList.add('show'); element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); }); };
     const hideStatusMessage = (element) => { if (!element) return; element.classList.remove('show'); setTimeout(() => { if (!element.classList.contains('show')) { element.textContent = ''; element.className = 'status-message'; } }, 400); };
     const setElementDisabled = (element, isDisabled) => { if(element) element.disabled = isDisabled; element?.closest('.form-group')?.classList.toggle('disabled', isDisabled); };
     const showCopyFeedback = (message, type = 'success') => { if (!copyFeedbackEl) return; copyFeedbackEl.textContent = message; copyFeedbackEl.className = `copy-feedback ${type}`; copyFeedbackEl.classList.add('visible'); clearTimeout(copyTimeout); copyTimeout = setTimeout(() => { copyFeedbackEl.classList.remove('visible'); }, 1800); }; // Shorter duration
     const copyToClipboard = async (textToCopy, successMessage = COPY_SUCCESS_MSG, errorMessage = COPY_ERROR_MSG) => { if (!navigator.clipboard) { try { const ta = document.createElement("textarea"); ta.value = textToCopy; ta.style.position = "fixed"; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showCopyFeedback(successMessage, 'success'); } catch (err) { console.error('Fallback copy failed:', err); showCopyFeedback(errorMessage, 'error'); } return; } try { await navigator.clipboard.writeText(textToCopy); showCopyFeedback(successMessage, 'success'); } catch (err) { console.error('Async clipboard copy failed:', err); showCopyFeedback(errorMessage, 'error'); } };


    // --- Form State & UI Updates ---
    const updateSubmitButtonState = () => { // Keep logic
        const isCategorySelected = !!categorySelect.value; const isServiceSelected = !!serviceSelect.value && !!currentServiceData; const isLinkValid = validateLink(false); const isQuantityValid = validateQuantity(false);
        const canSubmit = isCategorySelected && isServiceSelected && isLinkValid && isQuantityValid;
        setElementDisabled(submitOrderButton, !canSubmit || isSubmitting);
        if (canSubmit && !isSubmitting) submitOrderButton.classList.add('pulse-ready'); else submitOrderButton.classList.remove('pulse-ready');
    };

    const resetServiceDetailsUI = (fullReset = false) => { // Keep logic, ensure UI reset matches new structure
        linkInput.value = ''; setElementDisabled(linkInput, true); clearInputError(linkInput, linkError);
        quantityInput.value = ''; setElementDisabled(quantityInput, true); clearInputError(quantityInput, quantityError);
        quantityInput.min = 1; quantityInput.max = undefined; quantityLimits.textContent = 'الحد الأدنى: - | الحد الأقصى: -';
        avgTimeDisplay.textContent = '-'; // Target text content for div
        chargeDisplay.textContent = formatCurrency(0); // Target text content for div
        linkInput.placeholder = 'https://...';
        serviceDescriptionArea.classList.remove('visible'); serviceDescriptionText.textContent = '';
        serviceDetailsStep.style.visibility = 'hidden'; serviceDetailsStep.style.opacity = '0'; serviceDetailsStep.classList.remove('visible');
        currentServiceData = null; validatedOrderData = null;
        if (fullReset) {
            setElementDisabled(serviceSelect, true); serviceSelect.innerHTML = '<option value="" disabled selected>-- اختر المنصة أولاً --</option>'; clearInputError(serviceSelect, serviceError);
            setElementDisabled(searchInput, true); searchInput.value = ''; searchInput.placeholder = SEARCH_PLACEHOLDER_NO_CATEGORY; hideSearchStatus();
            currentCategoryServices = []; clearInputError(categorySelect, categoryError);
            categorySelect.value = ''; serviceSelect.value = ''; // Reset selects
        }
        updateSubmitButtonState();
    };

    const resetFullForm = () => { // Keep logic
         orderForm.reset(); populateCategories(); resetServiceDetailsUI(true); categorySelect.value = '';
         hideStatusMessage(formStatusMessage); hideStatusMessage(modalStatusMessage);
         setLoadingState(submitOrderButton, false); closeModal();
         if (confirmPaymentButton) {
             setLoadingState(confirmPaymentButton, false);
             const btnText = confirmPaymentButton.querySelector('.button-text');
             if(btnText) btnText.innerHTML = '<i class="fas fa-check-circle"></i> تأكيد وإرسال الطلب';
         }
    };

    // --- Modal Control ---
    const openModal = () => { // Keep logic, ensure animation triggers correctly
         if (!validatedOrderData) return;
         modalServiceName.textContent = validatedOrderData.serviceName; modalQuantity.textContent = validatedOrderData.quantity.toLocaleString('ar-EG'); modalLink.textContent = validatedOrderData.link; modalCharge.textContent = validatedOrderData.formattedPrice; modalChargeInstruction.textContent = validatedOrderData.formattedPrice;
         if (modalContactInput) modalContactInput.value = ''; if (modalContactError) clearInputError(modalContactInput, modalContactError); hideStatusMessage(modalStatusMessage);
         modalOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; modalOverlay.setAttribute('aria-hidden', 'false'); modalContent.scrollTop = 0;
         modalAnimatedSections.forEach(section => { const delay = parseFloat(section.dataset.animationDelay || 0) * 100; /* Faster delay */ section.style.opacity = '0'; section.style.transform = 'translateY(15px)'; /* Slide Up */ setTimeout(() => { section.style.opacity = '1'; section.style.transform = 'translateY(0)'; }, delay); });
         if (modalContactInput) setTimeout(() => modalContactInput.focus(), 400); // Slightly faster focus
    };
    const closeModal = () => { // Keep logic
        modalOverlay.classList.remove('active'); document.body.style.overflow = ''; modalOverlay.setAttribute('aria-hidden', 'true');
        if (!isModalSubmitting) setLoadingState(confirmPaymentButton, false);
        hideStatusMessage(modalStatusMessage);
    };

    // --- Button Loading/State Control ---
    const setLoadingState = (button, isLoading, isError = false) => { // Keep logic
        if (!button) return; const isModalBtn = button === confirmPaymentButton; if (isModalBtn) { isModalSubmitting = isLoading; } else { isSubmitting = isLoading; }
        button.disabled = isLoading; const btnText = button.querySelector('.button-text'); const spinner = button.querySelector('.spinner');
        button.classList.toggle('loading', isLoading); if(spinner) spinner.style.display = isLoading ? 'block' : 'none'; if(btnText) btnText.style.opacity = isLoading ? '0' : '1';
        button.classList.remove('shake-error'); if (isError && !isLoading) { button.disabled = false; button.classList.add('shake-error'); setTimeout(() => button.classList.remove('shake-error'), 500); } // Faster shake
        if (button === submitOrderButton) updateSubmitButtonState();
    };

     // --- Search Status Control ---
    const showSearchStatus = (message, type = 'info') => { // Keep logic
        if (!searchStatus) return; searchStatus.textContent = message; searchStatus.className = `status-message search-status ${type} visible`;
    };
    const hideSearchStatus = () => { // Keep logic
        if (!searchStatus) return; searchStatus.classList.remove('visible');
         setTimeout(() => { if (!searchStatus.classList.contains('visible')) { searchStatus.textContent = ''; searchStatus.className = 'status-message search-status'; } }, 300);
    };
    const setSearchLoading = (isLoading) => { // Keep logic
        if (searchSpinner) searchSpinner.style.display = isLoading ? 'inline-block' : 'none';
        if (isLoading) showSearchStatus(SEARCH_MSG_SEARCHING, 'searching');
    };

    // --- Core Logic Functions ---
    const populateCategories = () => { // Keep logic
         categorySelect.innerHTML = '<option value="" disabled selected>-- حدد المنصة --</option>';
         Object.entries(allServicesData).forEach(([platform, categories]) => { const optgroup = document.createElement('optgroup'); optgroup.label = platform; Object.keys(categories).forEach(categoryName => { const option = document.createElement('option'); option.value = `${platform}__${categoryName}`; option.textContent = categoryName; optgroup.appendChild(option); }); if (optgroup.childElementCount > 0) categorySelect.appendChild(optgroup); });
         setElementDisabled(categorySelect, false);
    };

    const populateServices = (platform, categoryName) => { // Keep logic
        resetServiceDetailsUI();
        const allCategoryServices = allServicesData[platform]?.[categoryName];
        if (!allCategoryServices || allCategoryServices.length === 0) { serviceSelect.innerHTML = '<option value="" disabled selected>-- لا توجد خدمات --</option>'; setElementDisabled(serviceSelect, true); setElementDisabled(searchInput, true); searchInput.placeholder = SEARCH_PLACEHOLDER_NO_CATEGORY; currentCategoryServices = []; return; }
        currentCategoryServices = allCategoryServices; setElementDisabled(searchInput, false); searchInput.placeholder = "ابحث بالاسم أو الرقم..."; filterAndDisplayServices('');
    };

    const filterAndDisplayServices = (term) => { // Keep logic
        setSearchLoading(true); const searchTerm = term.trim().toLowerCase(); let filteredServices = [];
        if (currentCategoryServices.length > 0) { if (searchTerm === '') { filteredServices = [...currentCategoryServices]; } else { filteredServices = currentCategoryServices.filter(s => s.name.toLowerCase().includes(searchTerm) || s.id.toString().includes(searchTerm) || (s.description && s.description.toLowerCase().includes(searchTerm))); } }
        serviceSelect.innerHTML = '';
        if (filteredServices.length === 0) { const opt = document.createElement('option'); opt.value = ""; opt.textContent = "-- لا توجد خدمات مطابقة --"; opt.disabled = true; opt.selected = true; serviceSelect.appendChild(opt); setElementDisabled(serviceSelect, true); if (searchTerm !== '') showSearchStatus(SEARCH_MSG_NO_RESULTS, 'no-results'); else hideSearchStatus();
        } else { const ph = document.createElement('option'); ph.value = ""; ph.textContent = `-- اختر الخدمة (${filteredServices.length}) --`; ph.disabled = true; ph.selected = true; serviceSelect.appendChild(ph);
            filteredServices.forEach(service => { if (typeof service.price_per_1000_egp !== 'number' || isNaN(service.price_per_1000_egp) || typeof service.min_quantity !== 'number' || isNaN(service.min_quantity) || typeof service.max_quantity !== 'number' || isNaN(service.max_quantity) || service.min_quantity <= 0 || service.max_quantity < service.min_quantity) { console.error(`Data Error: Service "${service.name}" (ID: ${service.id}). Skipping.`); return; } const opt = document.createElement('option'); opt.value = service.id; opt.textContent = `[${service.id}] ${service.name} (${formatCurrency(service.price_per_1000_egp)} / 1000)`; Object.keys(service).forEach(key => { if(key !== 'name') opt.dataset[key] = service[key]; }); opt.dataset.fullName = service.name; serviceSelect.appendChild(opt); });
            setElementDisabled(serviceSelect, false); if (searchTerm !== '') showSearchStatus(SEARCH_MSG_RESULTS_FOUND(filteredServices.length), 'success'); else hideSearchStatus();
        }
        const isCurrentVisible = currentServiceData && filteredServices.some(s => s.id === currentServiceData.id); if (!isCurrentVisible && currentServiceData) handleServiceSelectionChange();
        setSearchLoading(false);
    };

    const calculateAndUpdateCharge = () => { // Update to target div
        clearInputError(quantityInput, quantityError); let charge = 0;
        if (currentServiceData && validateQuantity(false)) { const quantity = parseInt(quantityInput.value.trim().replace(/,/g, '')); charge = (quantity / 1000) * currentServiceData.price_per_1000_egp; }
        chargeDisplay.textContent = formatCurrency(charge); // Update text content
        updateSubmitButtonState();
    };

    const handleServiceSelectionChange = () => { // Update to target divs
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex]; clearInputError(serviceSelect, serviceError); hideStatusMessage(formStatusMessage);
        if (!selectedOption || !selectedOption.value) { resetServiceDetailsUI(); return; }
        const serviceId = parseInt(selectedOption.value); const price = parseFloat(selectedOption.dataset.price_per_1000_egp); const min = parseInt(selectedOption.dataset.min_quantity); const max = parseInt(selectedOption.dataset.max_quantity);
        if (isNaN(serviceId) || isNaN(price) || isNaN(min) || isNaN(max) || min <= 0 || max < min) { console.error("Data Error from dataset.", selectedOption.dataset); showInputError(serviceSelect, serviceError, GENERIC_ERROR_MSG); resetServiceDetailsUI(); return; }
        currentServiceData = { id: serviceId, name: selectedOption.dataset.fullName, price_per_1000_egp: price, min_quantity: min, max_quantity: max, avg_time: selectedOption.dataset.avg_time || '-', description: selectedOption.dataset.description || 'لا يوجد وصف.' };
        serviceDescriptionText.textContent = currentServiceData.description; serviceDescriptionArea.classList.add('visible');
        serviceDetailsStep.style.visibility = 'visible'; serviceDetailsStep.style.opacity = '1'; serviceDetailsStep.classList.add('visible');
        setElementDisabled(linkInput, false); setElementDisabled(quantityInput, false); quantityInput.value = ''; quantityInput.min = min; quantityInput.max = max; quantityLimits.textContent = `الأدنى: ${min.toLocaleString('ar-EG')} | الأقصى: ${max.toLocaleString('ar-EG')}`;
        avgTimeDisplay.textContent = currentServiceData.avg_time; // Update text content
        chargeDisplay.textContent = formatCurrency(0); // Update text content
        clearInputError(quantityInput, quantityError); clearInputError(linkInput, linkError); linkInput.placeholder = "https://..."; quantityInput.placeholder="1000";
        const platform = categorySelect.options[categorySelect.selectedIndex]?.closest('optgroup')?.label;
        if (platform === 'TikTok') linkHint.textContent = "رابط فيديو أو حساب تيك توك.";
        else if (platform === 'Instagram') linkHint.textContent = "رابط منشور، ريلز أو حساب انستا.";
        else if (platform === 'Facebook') linkHint.textContent = "رابط منشور، فيديو أو صفحة فيسبوك.";
        else linkHint.textContent = "رابط المنشور أو الحساب.";
        setTimeout(() => linkInput.focus(), 300); updateSubmitButtonState();
    };

    // --- Validation Functions ---
    // (Keep implementations)
     const validateLink = (showError = true) => { clearInputError(linkInput, linkError); const link = linkInput.value.trim(); let isValid = true; if (!link) { if (showError) showInputError(linkInput, linkError, REQUIRED_FIELD_MSG); isValid = false; } else { try { const url = new URL(link); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol'); } catch (_) { if (showError) showInputError(linkInput, linkError, INVALID_LINK_MSG); isValid = false; } } return isValid; };
     const validateQuantity = (showError = true) => { clearInputError(quantityInput, quantityError); if (!currentServiceData) return false; const quantityStr = quantityInput.value.trim(); const quantity = parseInt(quantityStr.replace(/,/g, '')); let isValid = true; if (quantityStr === '' || isNaN(quantity) || quantity <= 0) { if (showError) showInputError(quantityInput, quantityError, INVALID_QUANTITY_MSG); isValid = false; } else { const min = currentServiceData.min_quantity; const max = currentServiceData.max_quantity; if (quantity < min) { if (showError) showInputError(quantityInput, quantityError, MIN_QUANTITY_MSG(min)); isValid = false; } else if (quantity > max) { if (showError) showInputError(quantityInput, quantityError, MAX_QUANTITY_MSG(max)); isValid = false; } } return isValid; };
     const validateContactInfo = (showError = true) => { if (!modalContactInput || !modalContactError) return true; clearInputError(modalContactInput, modalContactError); hideStatusMessage(modalStatusMessage); let isValid = true; const contactValue = modalContactInput.value.trim(); if (!contactValue) { if (showError) showInputError(modalContactInput, modalContactError, CONTACT_INFO_REQUIRED_MSG); isValid = false; } else if (!contactValue.includes('@') && !/^\+?[0-9\s\-()]{8,}$/.test(contactValue)) { if (showError) showInputError(modalContactInput, modalContactError, "يرجى إدخال بريد إلكتروني صالح أو رقم هاتف للتواصل."); isValid = false; } if (!isValid && showError) modalContactInput.focus(); return isValid; };
     const validateInitialForm = () => { let isValid = true; let firstInvalidElement = null; hideStatusMessage(formStatusMessage); [categorySelect, serviceSelect, linkInput, quantityInput].forEach(el => clearInputError(el, document.getElementById(`${el.id}-error`))); if (!categorySelect.value) { showInputError(categorySelect, categoryError, "اختر المنصة."); isValid = false; if (!firstInvalidElement) firstInvalidElement = categorySelect; } if (!serviceSelect.value || !currentServiceData) { showInputError(serviceSelect, serviceError, "اختر خدمة."); isValid = false; if (!firstInvalidElement) firstInvalidElement = serviceSelect; } if (currentServiceData && !validateLink(true)) { isValid = false; if (!firstInvalidElement) firstInvalidElement = linkInput; } if (currentServiceData && !validateQuantity(true)) { isValid = false; if (!firstInvalidElement) firstInvalidElement = quantityInput; } if (isValid && currentServiceData) { const quantity = parseInt(quantityInput.value.trim().replace(/,/g, '')); const finalPrice = (quantity / 1000) * currentServiceData.price_per_1000_egp; if (isNaN(finalPrice)) { showInputError(quantityInput, quantityError, "خطأ حساب السعر."); isValid = false; if (!firstInvalidElement) firstInvalidElement = quantityInput; } } if (!isValid && firstInvalidElement) { firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => firstInvalidElement.focus(), 150); } updateSubmitButtonState(); return isValid; };

    // --- Event Handlers ---
    const handleInitialSubmit = (event) => { // Keep logic
        event.preventDefault(); if (isSubmitting) return; setLoadingState(submitOrderButton, true);
        if (!validateInitialForm()) { showStatusMessage(formStatusMessage, "يرجى مراجعة الحقول.", 'error'); setLoadingState(submitOrderButton, false, true); return; }
        const quantity = parseInt(quantityInput.value.trim().replace(/,/g, '')); const finalPrice = (quantity / 1000) * currentServiceData.price_per_1000_egp; const categoryOption = categorySelect.options[categorySelect.selectedIndex]; const platform = categoryOption ? categoryOption.closest('optgroup')?.label || 'N/A' : 'N/A'; const categoryName = categoryOption ? categoryOption.textContent : 'N/A'; if (isNaN(finalPrice)) { console.error("Critical Error: Final price NaN."); showStatusMessage(formStatusMessage, SUBMIT_ERROR_PRICE_MSG, 'error'); setLoadingState(submitOrderButton, false, true); return; }
        validatedOrderData = { platform, categoryName, serviceId: currentServiceData.id, serviceName: currentServiceData.name, quantity, link: linkInput.value.trim(), finalPrice, formattedPrice: formatCurrency(finalPrice) };
        setLoadingState(submitOrderButton, false); openModal();
    };

    const handleModalConfirm = async () => { // Keep logic
        if (isModalSubmitting || !validatedOrderData) return; if (!validateContactInfo(true)) return; setLoadingState(confirmPaymentButton, true); hideStatusMessage(modalStatusMessage);
        try { const templateParams = { from_name: "طلب خدمة (المتجر الأنيق)", platform: validatedOrderData.platform, categoryName: validatedOrderData.categoryName, serviceName: validatedOrderData.serviceName, serviceId: validatedOrderData.serviceId, quantity: validatedOrderData.quantity.toLocaleString('ar-EG'), link: validatedOrderData.link, finalPrice: validatedOrderData.formattedPrice, contact_info: modalContactInput.value.trim() }; console.log("Sending EmailJS:", templateParams); if (typeof emailjs === 'undefined') throw new Error("EmailJS SDK not loaded."); await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            console.log('EmailJS SUCCESS!'); showStatusMessage(modalStatusMessage, EMAIL_SEND_SUCCESS_MSG, 'success'); const btnText = confirmPaymentButton.querySelector('.button-text'); if (btnText) btnText.innerHTML = '<i class="fas fa-check-double"></i> تم الإرسال بنجاح'; confirmPaymentButton.disabled = true; setTimeout(resetFullForm, 3500);
        } catch (error) { console.error('EmailJS FAILED:', error); let errorMessage = EMAIL_SEND_ERROR_MSG; if (error?.status === 413) errorMessage = "❌ خطأ: حجم البيانات كبير."; else if (error?.text) errorMessage += ` (${error.status} - ${error.text})`; else if (error instanceof Error) errorMessage += ` (${error.message})`; showStatusMessage(modalStatusMessage, errorMessage, 'error'); setLoadingState(confirmPaymentButton, false, true); }
    };

    // --- Ripple Effect Logic ---
    function createRipple(event) {
        const button = event.currentTarget;
        // Prevent ripple if button is disabled or loading
        if (button.disabled || button.classList.contains('loading')) {
             return;
        }

        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        const rippleX = event.clientX - rect.left - radius;
        const rippleY = event.clientY - rect.top - radius;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${rippleX}px`;
        circle.style.top = `${rippleY}px`;
        circle.classList.add("ripple");

        // Ensure only one ripple runs at a time for cleaner effect
        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);

        // Remove ripple after animation finishes
        circle.addEventListener('animationend', () => {
            circle.remove();
        });
    }

    // --- Event Listeners Setup ---
    categorySelect.addEventListener('change', () => { clearInputError(categorySelect, categoryError); hideStatusMessage(formStatusMessage); searchInput.value = ''; const selectedValue = categorySelect.value; if (selectedValue) { const [platform, categoryName] = selectedValue.split('__'); populateServices(platform, categoryName); } else { resetServiceDetailsUI(true); } });
    const debouncedSearchHandler = debounce(() => { if (!searchInput.disabled) filterAndDisplayServices(searchInput.value); }, SEARCH_DEBOUNCE_DELAY);
    searchInput.addEventListener('input', debouncedSearchHandler);
    searchInput.addEventListener('search', () => { if (searchInput.value === '') filterAndDisplayServices(''); });
    serviceSelect.addEventListener('change', handleServiceSelectionChange);
    linkInput.addEventListener('input', () => { validateLink(false); updateSubmitButtonState(); }); linkInput.addEventListener('blur', () => validateLink(true));
    quantityInput.addEventListener('input', () => { validateQuantity(true); calculateAndUpdateCharge(); });
    orderForm.addEventListener('submit', handleInitialSubmit);
    modalCloseButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => { if (event.target === modalOverlay) closeModal(); });
    if(modalContactInput) { modalContactInput.addEventListener('input', () => validateContactInfo(false)); modalContactInput.addEventListener('blur', () => validateContactInfo(true)); }
    if(confirmPaymentButton) confirmPaymentButton.addEventListener('click', handleModalConfirm);
    paymentMethodItems.forEach(item => { const textEl = item.querySelector('.payment-number'); const copyBtn = item.querySelector('.button-copy'); const textToCopy = textEl?.textContent.trim(); if (textEl && textToCopy) { textEl.addEventListener('click', () => copyToClipboard(textToCopy)); if (copyBtn) copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyToClipboard(textToCopy); }); } });

    // Attach Ripple Listener to relevant buttons
    rippleButtons.forEach(button => {
        button.addEventListener("click", createRipple);
    });

    // --- Initial Page Load ---
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    populateCategories();
    resetServiceDetailsUI(true);
    setTimeout(() => { document.body.classList.remove('preload'); }, 50); // Remove preload class quickly

}); // End DOMContentLoaded
