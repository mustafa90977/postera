/**
 * ==============================================================================
 * بوستيرا | POSTERA - ملف الإعدادات العامة (Configuration)
 * مشترك بين واجهة المتجر الرئيسية ولوحة الإدارة
 * ==============================================================================
 */

/* ============ إعدادات الربط مع Supabase ============ */
// الصق رابط مشروعك والمفتاح العام من Supabase Dashboard -> Settings -> API
// ⚠️ تنبيه أمني مهم: استخدم فقط المفتاح العام (anon / public key).
// لا تضع إطلاقاً مفتاح (service_role secret key) في ملفات الواجهة!
window.SUPABASE_CONFIG = {
  url: 'https://vgwsexvwbpwlhfrwfnii.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd3NleHZ3YnB3bGhmcndmbmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTQwMTksImV4cCI6MjEwNzQ5MDAxOX0.3v6jaQCO20n1VE0P_yOYNDILc0GSyRF5KVC7yHdX46k'
};

/* ============ إعدادات المتجر وبيانات الدفع ============ */
window.SHOP = {
  instapay: 'postera@instapay',        // عنوان إنستا باي للمتجر
  wallet:   '01000000000',            // رقم محفظة كاش (فودافون كاش / غيرها)
  whatsapp: '01000000000',            // واتساب خدمة العملاء
  shipping: 60,                       // سعر الشحن لجميع المحافظات (جنيه)
  freeShippingOver: 2500,             // الشحن مجاناً لو الطلب تخطى هذا المبلغ
  // خاصية دفع العربون (Deposit Option)
  depositEnabled: true,               // تفعيل إمكانية دفع عربون للعميل
  depositType: 'percent',             // 'percent' (نسبة مئوية) أو 'fixed' (مبلغ ثابت)
  depositValue: 50,                   // 50% أو قيمة بالجنيه (مثلاً 200)
  // المقاسات بالسنتيمتر والأسعار بالجنيه المصري
  sizes: [
    { id: 's',  label: '20×30', w: 20, h: 30, price: 450 },
    { id: 'm',  label: '30×45', w: 30, h: 45, price: 750 },
    { id: 'l',  label: '40×60', w: 40, h: 60, price: 1200 },
    { id: 'xl', label: '50×75', w: 50, h: 75, price: 1800 }
  ]
};

/* ============ إعدادات تنبيهات الإدارة (اختياري) ============ */
// يمكنك ضبط هذه القيم هنا أو حفظها مباشرة بأمان من داخل لوحة الإدارة (/admin)
window.ADMIN_CONFIG = {
  notificationEmail: 'admin@postera.com', // إيميل المدير لتلقي إشعارات الطلبات
  resendApiKey: '',                      // أو ادخله من لوحة الإدارة ليُحفظ مشفراً في قاعدة البيانات
  emailWebhookUrl: ''                    // رابط Formspree أو Webhook آمن بدون أي مفاتيح
};
