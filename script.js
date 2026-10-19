/**
 * ==========================================================================
 * بوستيرا | POSTERA - منطق التطبيق (JavaScript)
 * متجر بوسترات معدنية فاخرة مطبوعة على ألومنيوم
 * ==========================================================================
 */

/* ============ إعدادات المتجر وبيانات الربط ============ */
var SHOP = window.SHOP || {
  instapay: 'postera@instapay',        // عنوان إنستا باي للمتجر
  wallet:   '01000000000',            // رقم محفظة كاش (فودافون كاش / غيرها)
  whatsapp: '01000000000',            // واتساب خدمة العملاء
  shipping: 60,                       // سعر الشحن الافتراضي لجميع المحافظات (جنيه)
  freeShippingOver: 2500,             // الشحن مجاناً لو الطلب تخطى هذا المبلغ
  govShipping: {},                    // أسعار الشحن المخصصة لكل محافظة { 'القاهرة': 50, ... }
  // المقاسات بالسنتيمتر والأسعار بالجنيه المصري (النشطة حالياً)
  sizes: [
    { id: 'm',  label: '30×45', w: 30, h: 45, price: 750 },
    { id: 'l',  label: '40×60', w: 40, h: 60, price: 1200 }
  ]
};

// استرجاع المقاسات المحفوظة محلياً لمنع أي وميض أو تغير بالأسعار
try {
  const localSizesInit = localStorage.getItem('postera_sizes');
  if (localSizesInit) {
    const parsedSizes = JSON.parse(localSizesInit);
    if (Array.isArray(parsedSizes) && parsedSizes.length) SHOP.sizes = parsedSizes;
  }
} catch (e) {}

// تهيئة أسعار المحافظات المحفوظة محلياً مبدئياً
try {
  const localGovInit = localStorage.getItem('postera_gov_shipping');
  if (localGovInit) SHOP.govShipping = JSON.parse(localGovInit);
} catch (e) {}

var SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
  url: '',
  anonKey: ''
};

let supabaseClient = null;
if (window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (e) {
    console.warn('فشل تهيئة Supabase:', e);
  }
}
/* ================================================================== */

// ضبط اتجاه ولغة الصفحة
try {
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
} catch (e) {}

// دوال مساعدة (Helpers)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const egp = n => Number(n).toLocaleString('en-US') + ' ج.م';
const sizeOf = id => SHOP.sizes.find(s => s.id === id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toLatin = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

/* ---------- لوحات فنية مرسومة برمجياً بصيغة SVG ---------- */
function rng(seed) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

let uidN = 0;
const ART = {
  moon(u) {
    const r = rng(7);
    let st = '';
    for (let i = 0; i < 46; i++) {
      st += `<circle cx="${(r() * 200).toFixed(1)}" cy="${(r() * 210).toFixed(1)}" r="${(r() * 0.9 + 0.2).toFixed(2)}" fill="#f1e6c8" opacity="${(r() * 0.6 + 0.25).toFixed(2)}"/>`;
    }
    return `<defs><radialGradient id="a${u}" cx="50%" cy="36%" r="75%"><stop offset="0" stop-color="#2b2535"/><stop offset="1" stop-color="#09080d"/></radialGradient><linearGradient id="b${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e6bb"/><stop offset="1" stop-color="#b78a3a"/></linearGradient></defs><rect width="200" height="300" fill="url(#a${u})"/>${st}<circle cx="100" cy="124" r="62" fill="none" stroke="#c9a45c" stroke-width=".6" opacity=".7"/><circle cx="100" cy="124" r="46" fill="url(#b${u})"/><circle cx="84" cy="110" r="9" fill="#a37a30" opacity=".35"/><circle cx="116" cy="138" r="6" fill="#a37a30" opacity=".3"/><circle cx="108" cy="104" r="4" fill="#a37a30" opacity=".25"/><path d="M0 250Q50 236 100 248T200 242V300H0Z" fill="#050408"/><path d="M0 270Q60 258 110 268T200 262V300H0Z" fill="#0d0b12"/>`;
  },
  mountains(u) {
    return `<defs><linearGradient id="a${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2447"/><stop offset=".55" stop-color="#7a4d6b"/><stop offset="1" stop-color="#e8a26b"/></linearGradient></defs><rect width="200" height="300" fill="url(#a${u})"/><circle cx="100" cy="170" r="34" fill="#ffd9a0" opacity=".95"/><path d="M0 205L45 150L78 185L120 120L165 180L200 150V300H0Z" fill="#4a3558"/><path d="M0 235L55 185L95 225L140 170L200 230V300H0Z" fill="#2f2340"/><path d="M0 265L40 235L90 262L150 225L200 258V300H0Z" fill="#1b1428"/><path d="M0 285L70 272L130 284L200 270V300H0Z" fill="#0e0a16"/>`;
  },
  pyramids(u) {
    const r = rng(21);
    let st = '';
    for (let i = 0; i < 22; i++) {
      st += `<circle cx="${(r() * 200).toFixed(1)}" cy="${(r() * 90).toFixed(1)}" r=".7" fill="#fff4d6" opacity="${(r() * 0.6 + 0.3).toFixed(2)}"/>`;
    }
    return `<defs><linearGradient id="a${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1a2c"/><stop offset=".55" stop-color="#b8763f"/><stop offset="1" stop-color="#e0b36a"/></linearGradient></defs><rect width="200" height="300" fill="url(#a${u})"/>${st}<circle cx="150" cy="66" r="14" fill="#f6ead0"/><path d="M30 232L105 120L180 232Z" fill="#6b4424"/><path d="M105 120L180 232L122 232Z" fill="#4a2e18"/><path d="M-10 240L45 170L100 240Z" fill="#7d5230"/><path d="M45 170L100 240L62 240Z" fill="#5a3a20"/><path d="M150 242L185 196L220 242Z" fill="#7d5230"/><path d="M0 240Q60 222 120 238T200 232V300H0Z" fill="#c28a4a"/><path d="M0 265Q70 248 140 262T200 258V300H0Z" fill="#9a6531"/>`;
  },
  desert(u) {
    return `<defs><linearGradient id="a${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1a3a"/><stop offset=".55" stop-color="#d9733f"/><stop offset="1" stop-color="#f2b366"/></linearGradient></defs><rect width="200" height="300" fill="url(#a${u})"/><circle cx="100" cy="150" r="28" fill="#fff1c9"/><path d="M0 200Q50 170 110 195T200 185V300H0Z" fill="#c9703a"/><path d="M0 230Q70 200 130 225T200 215V300H0Z" fill="#a5542c"/><path d="M0 260Q60 238 120 256T200 246V300H0Z" fill="#7c3a21"/><path d="M0 285Q80 268 200 282V300H0Z" fill="#4a2217"/>`;
  },
  deco(u) {
    let arcs = '';
    for (let i = 0; i < 6; i++) {
      const x = 34 + i * 11, rr = 100 - x;
      arcs += `<path d="M${x} 262V130A${rr} ${rr} 0 0 1 ${200 - x} 130V262" fill="none" stroke="url(#b${u})" stroke-width="${(1.3 - i * 0.12).toFixed(2)}" opacity="${(1 - i * 0.1).toFixed(2)}"/>`;
    }
    return `<defs><linearGradient id="b${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dca0"/><stop offset="1" stop-color="#a8792e"/></linearGradient></defs><rect width="200" height="300" fill="#0d1512"/>${arcs}<circle cx="100" cy="134" r="5" fill="url(#b${u})"/><path d="M26 262H174M18 270H182" stroke="url(#b${u})" stroke-width=".9" fill="none"/><path d="M100 40V52M92 46H108" stroke="url(#b${u})" stroke-width=".8"/>`;
  },
  waves(u) {
    let p = '';
    for (let k = 0; k < 16; k++) {
      const y0 = 70 + k * 12, amp = 9 + k * 0.8;
      let d = '';
      for (let x = 0; x <= 200; x += 4) {
        const y = y0 + Math.sin(x / 200 * Math.PI * 3 + k * 0.35) * amp;
        d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
      }
      p += `<path d="${d}" fill="none" stroke="url(#b${u})" stroke-width=".9" opacity="${(0.22 + k * 0.05).toFixed(2)}"/>`;
    }
    return `<defs><linearGradient id="a${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1220"/><stop offset="1" stop-color="#10253b"/></linearGradient><linearGradient id="b${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9b46a"/><stop offset="1" stop-color="#f0e3bd"/></linearGradient></defs><rect width="200" height="300" fill="url(#a${u})"/>${p}`
  },
  city(u) {
    const r = rng(5);
    let far = '', near = '', x = 0;
    while (x < 200) {
      const w = 14 + r() * 12, h = 50 + r() * 70;
      far += `<rect x="${x.toFixed(1)}" y="${(300 - h).toFixed(1)}" width="${(w + 0.5).toFixed(1)}" height="${h.toFixed(1)}" fill="#3b2252" opacity=".9"/>`;
      x += w;
    }
    x = -4;
    while (x < 200) {
      const w = 16 + r() * 14, h = 70 + r() * 110, top = 300 - h;
      near += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#130b20"/>`;
      for (let wy = top + 8; wy < 290; wy += 8) {
        for (let wx = x + 3; wx < x + w - 3; wx += 6) {
          if (r() < 0.33) near += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="2.2" height="3.2" fill="#f7c978" opacity=".8"/>`;
        }
      }
      x += w + 1;
    }
    return `<defs><linearGradient id="a${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1030"/><stop offset=".7" stop-color="#d0546e"/><stop offset="1" stop-color="#f39a6b"/></linearGradient></defs><rect width="200" height="300" fill="url(#a${u})"/><circle cx="140" cy="118" r="22" fill="#ffe3b0" opacity=".9"/>${far}${near}`;
  },
  calli(u) {
    return `<defs><linearGradient id="b${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dca0"/><stop offset="1" stop-color="#a8792e"/></linearGradient></defs><rect width="200" height="300" fill="#12100c"/><rect x="10" y="10" width="180" height="280" fill="none" stroke="url(#b${u})" stroke-width=".9"/><rect x="16" y="16" width="168" height="268" fill="none" stroke="url(#b${u})" stroke-width=".4"/><text x="100" y="172" text-anchor="middle" font-family="Amiri,serif" font-size="88" font-weight="700" fill="url(#b${u})">جمال</text><path d="M70 202H130" stroke="url(#b${u})" stroke-width=".8"/><circle cx="100" cy="202" r="2.4" fill="url(#b${u})"/>`;
  }
};

function artSvg(kind, label) {
  const u = ++uidN;
  return `<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label || '')}" xmlns="http://www.w3.org/2000/svg">${ART[kind](u)}</svg>`;
}

// قائمة اللوحات الجاهزة المطابقة للمرجع (Displate Artworks)
let POSTERS = [
  { id: 1, title: 'إنترستيلار: ثقب جارغانتوا الأسود', cat: 'أفلام ومسلسلات', tag: 'الأكثر مبيعاً', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3IJjbnItpSdF9haCU_FngEABSkFOcRsQU1JGXiCHbeeOAQ1Lm8grXhd7ZY-4_Dqo974MQXPSYzF1XFhcuYc0qvQFQV3ZiGr8m3h6fDBSN6H6AokyzAPj_nTdfg2qxgPyzMsU4MFC3tFaE_f2dwubSuXvGcQbkpg5qUWSlTEwZx1YN3tC8KLtLTP3ampmJS2DWxPHkCwaZhlQB3hU_icvtrIr0DkR3ACsJuQwTi3o' },
  { id: 2, title: 'إلدن رينج: شجرة الظلال', cat: 'ألعاب', tag: 'تريند', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiyhELUUbbJZCMR7V1nZbU2sYZNK9TdyUFA4nJtjfWQ68K3-eQ-xoXpk2gKsR3ehbCvYmCNXobVmXShKJaMy1xZSU-g4hNKlz5Jl45hq5AxvH7lN3o_ISx6qkp4S20iOkfT2Y6AWwoOgxWSCrqoglMHrOvinGYZDzxxJKobijaPD8N8AIr7HAoS-uiuu-g6jyHrJXF9UgoNg53mT_5NDR8gAz8OAmZiGsIeNalq2M' },
  { id: 3, title: 'سايبربانك 2077: نايت سيتي', cat: 'ألعاب', tag: 'إصدار حصري', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80' },
  { id: 4, title: 'هجوم العمالقة: إيرين ييغر', cat: 'أنمي', tag: 'الأكثر طلباً', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC06lnKSPuudLbHbFTuZ5RI6Dqq8cqepJtG6qcgbzX3uJiatMhZzynS1weEPeVnTjH8Qt1Lzz3NfhhA9I7p-VYanEFERNBgSRpzKo4e75pj29vtna_UO-QeDIOccXzD5TjXu3ZJVjwAzSopPKLzwKqvF6nsGe6fm6d5wX2NNLlKNRl_fwzgw4uK13dVnWv49DHUJjHsgmeXvCZKthfpBO2FmRl9ARRbLhIHXaw5Cbs' },
  { id: 5, title: 'قاتل الشياطين: هينوكامي كاجورا', cat: 'أنمي', tag: 'تريند', image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80' },
  { id: 6, title: 'بورشه 911 GT3 RS موتورسبورت', cat: 'سيارات', tag: 'إصدار فاخر', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnt-rm093C11cXoklaZUVfxuBOsLzxtj0WHzjY_xRfuepeXdOkeLys-Jui9QqZiUTPMYgn6scV8T6FRBrmxQlqBmyUJh0eXvUSE9rZd4gvwn3Tt8GjAO9P6BfDPf3MEYKAjyPNMSWV15zPEihgpZ-fhozKz9uB9KPnJVtdDEil5Bfkw3gPx45hY-w0M9DrSc9TKJd5wIVbUzhT3NF2oJxsGVK5F8Nt2-3jJjMSERo' },
  { id: 7, title: 'باتمان: فارس الظلام', cat: 'أفلام ومسلسلات', tag: 'كلاسيكيات', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa6p-ivT93GOwZYKdpU8OTwRkZEGKoJjYqZGOwnxcYciKJZ8UhK_VYvWZOc4hdAI7OoWPfQfgOcivr-cJwrZUQIXRzauWg8CnQgd10cCnNJvdCjfB4PTyxBIVYDQz6umE6pG5jA5R5tYLAZY8VJ6PTi-di-Hm_hTWT-xcNAtB3KrIbTdiHysrlTqSD_ySt490F_obLfCC71fFhsrQ0X7zWHJOxC7CCyqXSijH9Yx4' },
  { id: 8, title: 'فيراري دايتونا SP3 أسطورة السرعة', cat: 'سيارات', tag: 'جديد', image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80' }
];
let CATS = ['الكل', 'أفلام ومسلسلات', 'ألعاب', 'أنمي', 'سيارات'];

/* ---------- إدارة الحالة والسلة (State & Cart Storage) ---------- */
function loadCart() {
  try {
    const raw = localStorage.getItem('postera_cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('postera_cart', JSON.stringify(cart));
  } catch (e) {}
}

let cart = loadCart();
const st = { filter: 'الكل', sizes: {} };

/* ---------- نظام الإشعارات السريعة (Toast) ---------- */
let tt;
function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ---------- التمرير السلس للروابط داخل الصفحة ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-scroll]');
  if (!a) return;
  e.preventDefault();
  const el = document.getElementById(a.dataset.scroll);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ==========================================================================
   نظام البانرات والفيديو وسلايدر الهيرو (Displate Hero Slider & Banners)
   ========================================================================== */
const DEFAULT_BANNERS = [
  {
    id: 'b-1',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
    badge: 'إصدارات حصرية 2026 ✨',
    title: 'حوّل حيطتك لتحفة فنية من المعدن',
    subtitle: 'بوسترات ألومنيوم فائقة الجودة بتفاصيل حادة ولمعان معدني يدوم للأبد بدون بهتان.',
    primaryBtnText: 'اكتشف المجموعة',
    primaryBtnLink: '#gallery',
    secondaryBtnText: 'اصنع لوحتك الخاصة',
    secondaryBtnLink: '#custom',
    isActive: true,
    order: 1
  },
  {
    id: 'b-2',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    badge: 'خصم 20% لفترة محدودة 🔥',
    title: 'عالم الألعاب والأنمي بأعلى دقة',
    subtitle: 'تصميمات أيقونية مطبوعة على ألومنيوم فاخر بلمسة نهائية فائقة الوضوح ومقاومة للخدش.',
    primaryBtnText: 'تصفح ألعاب وأنيمي',
    primaryBtnLink: '#gallery',
    secondaryBtnText: 'شاهد كل المعرض',
    secondaryBtnLink: '#gallery',
    isActive: true,
    order: 2
  },
  {
    id: 'b-3',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600&auto=format&fit=crop&q=80',
    badge: 'الأكثر مبيعاً 🏆',
    title: 'هيبة السيارات والفن السينمائي',
    subtitle: 'أضف طابع الفخامة والقوة لغرفتك أو مكتبك مع لوحات بوستيرا المعدنية الفاخرة.',
    primaryBtnText: 'تصفح تصنيف السيارات',
    primaryBtnLink: '#gallery',
    secondaryBtnText: 'اطلب تصميمك المفضل',
    secondaryBtnLink: '#custom',
    isActive: true,
    order: 3
  }
];

const DEFAULT_CURATED = [
  { id: 'c1', title: 'ألعاب وجيمنج', sub: 'عالم المغامرة والأبطال', cat: 'أنمي', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80' },
  { id: 'c2', title: 'سينما ومسلسلات', sub: 'أعظم مشاهد الشاشة', cat: 'سينما', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80' },
  { id: 'c3', title: 'سيارات وسرعة', sub: 'قوة وفخامة المحركات', cat: 'سيارات', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80' },
  { id: 'c4', title: 'فن تجريدي ومودرن', sub: 'لمسات عصرية ملهمة', cat: 'فن تجريدي', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80' }
];

let BANNERS = [];
try {
  const localBanners = localStorage.getItem('postera_banners');
  if (localBanners) BANNERS = JSON.parse(localBanners);
} catch (e) {}
if (!BANNERS || !BANNERS.length) BANNERS = [...DEFAULT_BANNERS];

let CURATED = [];
try {
  const localCurated = localStorage.getItem('postera_curated_cards');
  if (localCurated) CURATED = JSON.parse(localCurated);
} catch (e) {}
if (!CURATED || !CURATED.length) CURATED = [...DEFAULT_CURATED];

let currentSlideIdx = 0;
let sliderAutoplayTimer = null;

function renderHeroSlider() {
  const track = $('#heroSliderTrack');
  const indicators = $('#sliderIndicators');
  if (!track) return;

  const activeBanners = BANNERS.filter(b => b.isActive !== false).sort((a,b) => (a.order || 0) - (b.order || 0));
  const list = activeBanners.length ? activeBanners : DEFAULT_BANNERS;

  if (currentSlideIdx >= list.length) currentSlideIdx = 0;

  track.innerHTML = list.map((b, idx) => {
    const isAct = idx === currentSlideIdx ? 'active' : '';
    let mediaHtml = '';
    if (b.type === 'video' && b.videoUrl) {
      mediaHtml = `
        <video class="hero-slide-video" autoplay muted loop playsinline preload="auto" poster="${esc(b.posterUrl || '')}">
          <source src="${esc(b.videoUrl)}" type="video/mp4">
          ${b.posterUrl ? `<img src="${esc(b.posterUrl)}" alt="${esc(b.title || '')}" class="hero-slide-img">` : ''}
        </video>
      `;
    } else {
      mediaHtml = `
        <img class="hero-slide-img" src="${esc(b.imageUrl || b.posterUrl || '')}" alt="${esc(b.title || '')}">
      `;
    }
    return `
      <div class="hero-slide ${isAct}" data-index="${idx}">
        <div class="hero-slide-media">${mediaHtml}</div>
        <div class="hero-slide-overlay"></div>
        <div class="hero-slide-content">
          ${b.badge ? `<div class="hero-slide-badge">${esc(b.badge)}</div>` : ''}
          <h1 class="hero-slide-title">${esc(b.title || '')}</h1>
          ${b.subtitle ? `<p class="hero-slide-sub">${esc(b.subtitle)}</p>` : ''}
          <div class="hero-slide-actions">
            ${b.primaryBtnText ? `
              <a href="${esc(b.primaryBtnLink || '#gallery')}" class="btn hero-cta-btn-primary" data-scroll="${b.primaryBtnLink && b.primaryBtnLink.startsWith('#') ? b.primaryBtnLink.replace('#','') : ''}">
                <span>${esc(b.primaryBtnText)}</span>
                <span class="btn-arrow" aria-hidden="true">←</span>
              </a>
            ` : ''}
            ${b.secondaryBtnText ? `
              <a href="${esc(b.secondaryBtnLink || '#custom')}" class="hero-cta-btn-secondary" data-scroll="${b.secondaryBtnLink && b.secondaryBtnLink.startsWith('#') ? b.secondaryBtnLink.replace('#','') : ''}">
                <span>${esc(b.secondaryBtnText)}</span>
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (indicators) {
    indicators.innerHTML = list.map((_, idx) => `
      <button class="slider-dot ${idx === currentSlideIdx ? 'active' : ''}" type="button" aria-label="الشريحة ${idx + 1}" data-slide-to="${idx}"></button>
    `).join('');
  }

  const activeVideo = track.querySelector('.hero-slide.active video');
  if (activeVideo && activeVideo.paused) {
    activeVideo.play().catch(() => {});
  }
}

function goToSlide(idx) {
  const activeBanners = BANNERS.filter(b => b.isActive !== false);
  const total = activeBanners.length || DEFAULT_BANNERS.length;
  currentSlideIdx = (idx + total) % total;

  const slides = $$('.hero-slide', $('#heroSliderTrack'));
  slides.forEach((sl, i) => {
    sl.classList.toggle('active', i === currentSlideIdx);
    const vid = sl.querySelector('video');
    if (vid) {
      if (i === currentSlideIdx) vid.play().catch(() => {});
      else vid.pause();
    }
  });

  const dots = $$('.slider-dot', $('#sliderIndicators'));
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlideIdx));
}

function nextSlide() {
  goToSlide(currentSlideIdx + 1);
}

function prevSlide() {
  goToSlide(currentSlideIdx - 1);
}

function startSliderAutoplay() {
  stopSliderAutoplay();
  sliderAutoplayTimer = setInterval(nextSlide, 6500);
}

function stopSliderAutoplay() {
  if (sliderAutoplayTimer) {
    clearInterval(sliderAutoplayTimer);
    sliderAutoplayTimer = null;
  }
}

function initSliderInteractions() {
  const prevBtn = $('#sliderPrevBtn');
  const nextBtn = $('#sliderNextBtn');
  if (prevBtn && !prevBtn.dataset.bound) {
    prevBtn.dataset.bound = 'true';
    prevBtn.addEventListener('click', () => { prevSlide(); startSliderAutoplay(); });
  }
  if (nextBtn && !nextBtn.dataset.bound) {
    nextBtn.dataset.bound = 'true';
    nextBtn.addEventListener('click', () => { nextSlide(); startSliderAutoplay(); });
  }

  const indicators = $('#sliderIndicators');
  if (indicators && !indicators.dataset.bound) {
    indicators.dataset.bound = 'true';
    indicators.addEventListener('click', e => {
      const dot = e.target.closest('[data-slide-to]');
      if (!dot) return;
      goToSlide(Number(dot.dataset.slideTo));
      startSliderAutoplay();
    });
  }

  const container = $('#heroSliderContainer');
  if (container && !container.dataset.bound) {
    container.dataset.bound = 'true';
    container.addEventListener('mouseenter', stopSliderAutoplay);
    container.addEventListener('mouseleave', startSliderAutoplay);

    let touchStartX = 0;
    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    container.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) prevSlide();
        else nextSlide();
        startSliderAutoplay();
      }
    }, { passive: true });
  }

  startSliderAutoplay();
}

function renderCuratedGrid() {
  const gridEl = $('#curatedGrid');
  if (!gridEl) return;
  gridEl.innerHTML = CURATED.map(c => `
    <div class="relative bg-neutral-900 rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition flex flex-col h-[380px] cursor-pointer curated-card" data-cat-filter="${esc(c.cat || '')}">
      <div class="absolute inset-0 z-0">
        <img alt="${esc(c.title || '')}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-75" src="${esc(c.img || '')}"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60"></div>
      </div>
      <div class="relative z-10 p-5 flex flex-col justify-between h-full text-center">
        <div>
          <h3 class="text-white font-extrabold uppercase tracking-wide text-sm bg-black/40 backdrop-blur-sm py-1.5 px-3 rounded inline-block">
            ${esc(c.title || '')}
          </h3>
          <p class="text-xs text-neutral-300 mt-2 font-normal">${esc(c.sub || '')}</p>
        </div>
        <div>
          <span class="inline-block bg-neutral-900/90 group-hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded transition duration-200 border border-neutral-700 group-hover:border-transparent">
            استكشف المزيد
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

/* فلترة التصنيفات من شريط الهيدر وبطاقات المجموعات وبطاقات الفاندومز (Fandoms) */
document.addEventListener('click', e => {
  const fandomCard = e.target.closest('.fandom-card');
  if (fandomCard) {
    const fKeyword = fandomCard.dataset.fandomFilter;
    const fCat = fandomCard.dataset.catFilter;
    if (fCat && CATS.includes(fCat)) st.filter = fCat;
    const searchInput = $('#storeSearchInput');
    if (searchInput && fKeyword) {
      searchInput.value = fKeyword;
    }
    renderFilters();
    renderGrid();
    const gal = document.getElementById('gallery');
    if (gal) gal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const catBtn = e.target.closest('[data-cat-filter], .cat-card, .curated-card');
  if (!catBtn) return;
  const targetCat = catBtn.dataset.catFilter || catBtn.dataset.cat;
  if (!targetCat) return;

  const galleryEl = document.getElementById('gallery');
  if (!galleryEl) {
    // إذا كان المستخدم في صفحة تفاصيل المنتج أو صفحة أخرى، توجه إلى المعرض في الصفحة الرئيسية مع التصنيف المختار
    window.location.href = `index.html?cat=${encodeURIComponent(targetCat)}#gallery`;
    return;
  }

  e.preventDefault();
  st.filter = targetCat;
  document.querySelectorAll('.header-nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.catFilter === targetCat);
  });
  renderFilters();
  renderGrid();
  galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

if ($('#footWa')) $('#footWa').textContent = SHOP.whatsapp;

function segHTML(items, cur, attr) {
  return items.map(i => `<button type="button" ${attr}="${i.id}" aria-pressed="${i.id === cur}">${i.html}</button>`).join('');
}

function renderFilters() {
  if ($('#filters')) {
    $('#filters').innerHTML = CATS.map(c => {
      const isSel = c === st.filter;
      return `<button class="px-4 py-2 rounded text-xs font-bold transition-all shadow-sm ${
        isSel 
          ? 'bg-primary text-on-primary' 
          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
      }" type="button" data-cat="${c}" aria-pressed="${isSel}">${c}</button>`;
    }).join('');
  }
}

function getWishlist() {
  try {
    const raw = localStorage.getItem('postera_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function toggleWishlist(id) {
  let list = getWishlist();
  const sId = String(id);
  const idx = list.indexOf(sId);
  const p = POSTERS.find(x => String(x.id) === sId);
  const name = p ? p.title : 'البوستر';
  if (idx > -1) {
    list.splice(idx, 1);
    toast(`تمت إزالة "${name}" من المفضلة`);
  } else {
    list.push(sId);
    toast(`تمت إضافة "${name}" إلى مفضلتك ❤️`);
  }
  try {
    localStorage.setItem('postera_wishlist', JSON.stringify(list));
  } catch (e) {}
  renderGrid();
}

function renderGrid() {
  const grid = $('#grid');
  if (!grid) return;

  let list = POSTERS.filter(p => st.filter === 'الكل' || p.cat === st.filter);

  // دعم البحث المباشر
  const searchInput = $('#storeSearchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (query) {
    list = list.filter(p => (p.title && p.title.toLowerCase().includes(query)) || (p.cat && p.cat.toLowerCase().includes(query)));
  }

  const favList = getWishlist();

  grid.innerHTML = list.map(p => {
    const artContent = p.image_url 
      ? `<img src="${p.image_url}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none">` 
      : (p.kind ? artSvg(p.kind, p.title) : artSvg('moon', p.title));
    
    const isFav = favList.includes(String(p.id));

    return `<a href="product?id=${encodeURIComponent(p.id)}" class="poster-card group relative aspect-[2/3] w-full rounded-lg overflow-hidden poster-shadow cursor-pointer select-none transition-all duration-300 bg-surface-container block" data-id="${p.id}" title="${esc(p.title)}">
      <!-- Metal Poster Image (صور فقط كما في ديسبليت) -->
      <div class="w-full h-full">
        ${artContent}
      </div>

      <!-- Real Metal Chamfer Bevel Inset Highlight -->
      <div class="absolute inset-0 pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(0,0,0,0.5)] rounded-lg"></div>

      <!-- Subtle Specular Reflection on Hover -->
      <div class="absolute inset-0 bg-gradient-to-tr from-pure-black/35 via-transparent to-canvas-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      <!-- Wishlist / Favorite Heart Button -->
      <button type="button" class="wishlist-btn absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-pure-black/60 hover:bg-pure-black text-white flex items-center justify-center transition-all ${isFav ? '!text-red-500 opacity-100 bg-pure-black/80' : 'opacity-80 hover:opacity-100'} hover:scale-110 shadow-md cursor-pointer" data-fav-id="${p.id}" aria-label="${isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}" title="${isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}">
        <span class="material-symbols-outlined text-[17px] pointer-events-none">${isFav ? 'favorite' : 'favorite_border'}</span>
      </button>

      <!-- Hover Quick View Pill Button -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 bg-pure-black/20 backdrop-blur-[2px]">
        <span class="px-4 py-2 bg-pure-black/90 text-canvas-white text-xs font-bold rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span>عرض التفاصيل</span>
        </span>
      </div>
    </a>`;
  }).join('');
}

/* ==========================================================================
   نافذة تفاصيل اللوحة الفنية التفاعلية (Product Details Modal - Displate Grade)
   ========================================================================== */
let currentProductModal = null;
let currentPmSize = 'm';
let currentPmFinish = 'مطفي';
let currentPmQty = 1;

function openProductModal(id) {
  const p = POSTERS.find(x => String(x.id) === String(id));
  if (!p) return;
  currentProductModal = p;
  currentPmSize = (SHOP.sizes[0] && SHOP.sizes[0].id) || 'm';
  currentPmFinish = 'مطفي';
  currentPmQty = 1;

  // تعيين صورة المعاينة الكبيرة
  const modalImg = $('#pmImg');
  if (modalImg) {
    if (p.image_url) {
      modalImg.src = p.image_url;
      modalImg.alt = p.title;
      modalImg.style.display = 'block';
    } else {
      modalImg.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80';
      modalImg.alt = p.title;
    }
  }

  // تعيين النصوص والتصنيف
  if ($('#pmTitle')) $('#pmTitle').textContent = p.title || 'بوستر معدني فاخر';
  if ($('#pmCat')) $('#pmCat').textContent = p.cat || 'مجموعة خاصة';
  if ($('#pmTag')) $('#pmTag').textContent = p.tag || 'إصدار أصلي جاهز للتعليق';

  // توليد أزرار المقاسات وتحديث السعر
  renderModalSizes();
  setModalFinish(currentPmFinish);
  updateModalPrice();

  // فتح المودال مع تأثير انتقال ناعم
  const modal = $('#productModal');
  const card = $('#productModalCard');
  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    document.body.style.overflow = 'hidden';
  }
}

function closeProductModal() {
  const modal = $('#productModal');
  const card = $('#productModalCard');
  if (modal && card) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    card.classList.add('scale-95');
    card.classList.remove('scale-100');
    document.body.style.overflow = '';
  }
}

function renderModalSizes() {
  const grid = $('#pmSizeGrid');
  if (!grid) return;
  grid.innerHTML = SHOP.sizes.map(s => {
    const isSel = s.id === currentPmSize;
    return `<button type="button" class="p-3 rounded-xl border text-center transition-all cursor-pointer ${
      isSel 
        ? 'border-primary bg-primary text-on-primary shadow-sm font-bold' 
        : 'border-warm-gray bg-surface-container-lowest text-primary hover:border-primary font-medium'
    }" data-msize="${s.id}">
      <span class="block text-xs uppercase tracking-wider font-mono">${s.id.toUpperCase()}</span>
      <span class="block text-sm font-bold mt-0.5"><bdi>${s.label}</bdi> سم</span>
      <span class="block text-[11px] mt-1 ${isSel ? 'text-on-primary/90' : 'text-outline'}">${egp(s.price)}</span>
    </button>`;
  }).join('');
}

function updateModalPrice() {
  const sz = sizeOf(currentPmSize) || SHOP.sizes[0] || { price: 750, label: '30×45', w: 30, h: 45 };
  const unitPrice = sz.price;
  const totalPrice = unitPrice * currentPmQty;

  if ($('#pmPrice')) $('#pmPrice').textContent = egp(totalPrice);
  if ($('#pmBtnPrice')) $('#pmBtnPrice').textContent = `(${egp(totalPrice)})`;
  if ($('#pmSizeBadge')) $('#pmSizeBadge').textContent = `${sz.label} سم`;
  if ($('#pmSizeDims')) $('#pmSizeDims').textContent = `${sz.w || 30} × ${sz.h || 45} سم`;
  if ($('#pmQtyVal')) $('#pmQtyVal').textContent = currentPmQty;

  // رابط واتساب السريع
  if ($('#pmWhatsAppBtn') && currentProductModal) {
    const p = currentProductModal;
    const msg = `مرحباً بوستيرا، أود طلب بوستر "${p.title}" المعدني المصفح:\n- المقاس: ${sz.label} سم (${currentPmSize.toUpperCase()})\n- اللمسة: ${currentPmFinish}\n- الكمية: ${currentPmQty}\n- الإجمالي: ${egp(totalPrice)}`;
    const phone = SHOP.whatsapp || '01000000000';
    const waNum = phone.startsWith('0') ? '2' + phone : phone;
    $('#pmWhatsAppBtn').href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
  }
}

function setModalFinish(finish) {
  currentPmFinish = finish;
  const isGloss = finish === 'لامع';
  const glossOverlay = $('#pmGlossOverlay');
  const matteOverlay = $('#pmMatteOverlay');
  const btnMatte = $('#pmFinishMatte');
  const btnGloss = $('#pmFinishGloss');
  const desc = $('#pmFinishDesc');

  if (glossOverlay) glossOverlay.style.opacity = isGloss ? '0.85' : '0';
  if (matteOverlay) matteOverlay.style.opacity = isGloss ? '0' : '1';

  if (btnMatte && btnGloss) {
    if (isGloss) {
      btnGloss.className = 'px-4 py-1.5 rounded-full font-bold transition-all bg-primary text-on-primary cursor-pointer shadow-sm';
      btnMatte.className = 'px-4 py-1.5 rounded-full font-medium transition-all text-on-surface-variant hover:text-primary cursor-pointer';
      if (desc) desc.textContent = 'لمعان فائق وانعكاسات سينمائية تبرز عمق الألوان والمعدن';
    } else {
      btnMatte.className = 'px-4 py-1.5 rounded-full font-bold transition-all bg-primary text-on-primary cursor-pointer shadow-sm';
      btnGloss.className = 'px-4 py-1.5 rounded-full font-medium transition-all text-on-surface-variant hover:text-primary cursor-pointer';
      if (desc) desc.textContent = 'مطفي هادئ بدون انعكاسات إضاءة، مثالي للإضاءة المباشرة';
    }
  }

  updateModalPrice();
}

// مستمعي أحداث المودال
$('#closeProductModal')?.addEventListener('click', closeProductModal);
$('#productModal')?.addEventListener('click', e => {
  if (e.target === $('#productModal')) closeProductModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProductModal();
});

$('#pmFinishMatte')?.addEventListener('click', () => setModalFinish('مطفي'));
$('#pmFinishGloss')?.addEventListener('click', () => setModalFinish('لامع'));

$('#pmSizeGrid')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-msize]');
  if (!btn) return;
  currentPmSize = btn.dataset.msize;
  renderModalSizes();
  updateModalPrice();
});

$('#pmQtyMinus')?.addEventListener('click', () => {
  if (currentPmQty > 1) {
    currentPmQty--;
    updateModalPrice();
  }
});

$('#pmQtyPlus')?.addEventListener('click', () => {
  currentPmQty++;
  updateModalPrice();
});

$('#pmAddToCart')?.addEventListener('click', () => {
  if (!currentProductModal) return;
  const p = currentProductModal;
  const sz = sizeOf(currentPmSize) || SHOP.sizes[0] || { id: 'm', label: '30×45', price: 750 };
  
  for (let i = 0; i < currentPmQty; i++) {
    addItem({
      key: `g-${p.id}-${sz.id}-${currentPmFinish}`,
      title: p.title,
      sub: `${sz.label} سم • ${currentPmFinish}`,
      price: sz.price,
      kind: p.kind,
      img: p.image_url,
      custom: false
    });
  }

  closeProductModal();
  toast(`تمت إضافة "${p.title}" إلى سلتك بنجاح ✨`);
  openCart();
});

// التفاعل مع زر المفضلة (Wishlist) على الكروت
document.addEventListener('click', e => {
  const wishBtn = e.target.closest('.wishlist-btn');
  if (wishBtn) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(wishBtn.dataset.favId);
    return;
  }
});

/* ==========================================================================
   إدارة نافذة السياسات والأسئلة الشائعة (Policy & FAQ Modal)
   ========================================================================== */
function openPolicyModal(tabKey = 'tabShipping') {
  const modal = $('#policyModal');
  const card = $('#policyModalCard');
  if (!modal || !card) return;

  // تنشيط التبويب المطلوب
  $$('.policy-tab-btn').forEach(btn => {
    const isAct = btn.dataset.tab === tabKey;
    btn.classList.toggle('active', isAct);
    btn.classList.toggle('border-primary', isAct);
    btn.classList.toggle('text-primary', isAct);
    btn.classList.toggle('border-transparent', !isAct);
  });
  $$('.policy-pane').forEach(pane => {
    pane.classList.toggle('hidden', pane.id !== tabKey);
  });

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  card.classList.remove('scale-95');
  card.classList.add('scale-100');
  document.body.style.overflow = 'hidden';
}

function closePolicyModal() {
  const modal = $('#policyModal');
  const card = $('#policyModalCard');
  if (!modal || !card) return;
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  card.classList.add('scale-95');
  card.classList.remove('scale-100');
  document.body.style.overflow = '';
}

$('#closePolicyModal')?.addEventListener('click', closePolicyModal);
$('#okPolicyModal')?.addEventListener('click', closePolicyModal);
$('#policyModal')?.addEventListener('click', e => {
  if (e.target === $('#policyModal')) closePolicyModal();
});

document.addEventListener('click', e => {
  const trigger = e.target.closest('.policy-trigger');
  if (trigger) {
    e.preventDefault();
    openPolicyModal(trigger.dataset.policy || 'tabShipping');
    return;
  }
  const tabBtn = e.target.closest('.policy-tab-btn');
  if (tabBtn) {
    const targetTab = tabBtn.dataset.tab;
    $$('.policy-tab-btn').forEach(btn => {
      const isAct = btn === tabBtn;
      btn.classList.toggle('active', isAct);
      btn.classList.toggle('border-primary', isAct);
      btn.classList.toggle('text-primary', isAct);
      btn.classList.toggle('border-transparent', !isAct);
    });
    $$('.policy-pane').forEach(pane => {
      pane.classList.toggle('hidden', pane.id !== targetTab);
    });
  }
});

$('#filters')?.addEventListener('click', e => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  st.filter = b.dataset.cat;
  renderFilters();
  renderGrid();
});

const storeSearch = $('#storeSearchInput');
if (storeSearch && !storeSearch.dataset.bound) {
  storeSearch.dataset.bound = 'true';
  storeSearch.addEventListener('input', () => {
    renderGrid();
  });
}

/* ---------- قسم الطباعة المخصصة الفاخرة ثلاثية الأبعاد (3D Custom Metal Plate) ---------- */
const C = {
  size: 'm',
  orient: 'p',
  fit: 'cover',
  finish: 'مطفي',
  url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
  w: 3840,
  h: 2560,
  name: 'alpine_sunset_golden_hour.jpg',
  meta: '3840 × 2560 px · 5.4 MB',
  file: null,
  qty: 1
};

function renderCustomSizes() {
  const container = $('#size-selector-group');
  if (!container) return;
  const sizeNames = { s: 'كومباكت (S)', m: 'كلاسيك (M)', l: 'جاليري (L)', xl: 'ماستر (XL)' };
  container.innerHTML = SHOP.sizes.map(s => {
    const isSelected = C.size === s.id;
    const isPopular = s.id === 'm';
    const name = sizeNames[s.id] || `مقاس (${s.id.toUpperCase()})`;
    return `
      <button class="size-btn relative p-3 rounded-xl border text-right transition-all group focus:outline-none ${
        isSelected
          ? 'border-2 border-blue-600 bg-blue-50/50 shadow-xs'
          : 'border-gray-200 bg-white hover:border-gray-400'
      }" data-size="${s.id}" type="button">
        ${isPopular ? '<span class="absolute -top-2.5 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-blue-600 text-white">الأكثر طلباً</span>' : ''}
        <span class="block text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-gray-900'}">${name}</span>
        <span class="block text-[11px] text-gray-500 mt-0.5 font-mono">${s.w} × ${s.h} سم</span>
        <span class="block text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-900'} mt-1.5">${egp(s.price)}</span>
      </button>
    `;
  }).join('');
}

function renderCustom() {
  const sz = sizeOf(C.size) || SHOP.sizes[0] || { w: 30, h: 45, price: 750 };
  const pw = C.orient === 'p' ? sz.w : sz.h;
  const ph = C.orient === 'p' ? sz.h : sz.w;

  // 1. أبعاد اللوحة والنصوص
  const dimText = $('#selected-dimension-text');
  if (dimText) dimText.textContent = `${pw} × ${ph} سم`;

  const wLabel = $('#plate-width-label');
  if (wLabel) wLabel.textContent = `${pw} سم`;
  const hLabel = $('#plate-height-label');
  if (hLabel) hLabel.textContent = `${ph} سم`;

  // 2. المحاكي ثلاثي الأبعاد
  const mockup = $('#metal-poster-mockup');
  if (mockup) {
    mockup.style.aspectRatio = `${pw} / ${ph}`;
    if (C.orient === 'p') {
      mockup.style.width = 'min(350px, 85vw)';
    } else {
      mockup.style.width = 'min(460px, 90vw)';
    }
  }

  // 3. طبقة الصورة والملء
  const artLayer = $('#poster-art-layer');
  const emptyOverlay = $('#empty-state-overlay');
  if (artLayer) {
    if (C.url) {
      artLayer.style.backgroundImage = `url('${C.url}')`;
      artLayer.style.backgroundSize = C.fit === 'contain' ? 'contain' : 'cover';
      artLayer.style.backgroundRepeat = 'no-repeat';
      artLayer.style.backgroundColor = C.fit === 'contain' ? '#0e1013' : 'transparent';
      if (emptyOverlay) emptyOverlay.classList.add('hidden');
    } else {
      artLayer.style.backgroundImage = 'none';
      artLayer.style.backgroundColor = '#18181b';
      if (emptyOverlay) emptyOverlay.classList.remove('hidden');
    }
  }

  // 4. السعر والكمية
  const totalPrice = (sz.price || 0) * (C.qty || 1);
  const totalDisplay = $('#total-price-display');
  if (totalDisplay) totalDisplay.textContent = egp(totalPrice);

  const ctaBtn = $('#cta-button-text');
  if (ctaBtn) {
    ctaBtn.textContent = C.url ? `أضف اللوحة المخصصة للسلة — ${egp(totalPrice)}` : 'يرجى اختيار صورة أولاً';
  }

  const addBtn = $('#cAdd');
  if (addBtn) {
    addBtn.disabled = !C.url;
    addBtn.classList.toggle('opacity-50', !C.url);
    addBtn.classList.toggle('cursor-not-allowed', !C.url);
  }

  const qtyEl = $('#qty-display');
  if (qtyEl) qtyEl.textContent = C.qty || 1;

  // 5. فحص جودة الطباعة (DPI Resolution Audit)
  const dpiChip = $('#dpi-indicator-chip');
  const dpiText = $('#dpi-text');
  const resStatus = $('#file-resolution-status');

  if (C.url && C.w && C.h) {
    const needW = (pw / 2.54) * 150;
    const needH = (ph / 2.54) * 150;
    const ratio = Math.min(C.w / needW, C.h / needH);

    if (dpiChip) {
      if (ratio >= 1) {
        dpiChip.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
        if (dpiText) dpiText.textContent = 'جاهز للطباعة: 300 DPI';
        if (resStatus) resStatus.textContent = `دقة ممتازة ومثالية للمقاس (${C.w}×${C.h} بكسل)`;
      } else if (ratio >= 0.6) {
        dpiChip.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200';
        if (dpiText) dpiText.textContent = 'جودة مقبولة للطباعة';
        if (resStatus) resStatus.textContent = `دقة مقبولة (${C.w}×${C.h} بكسل) — تظهر بوضوح أكبر بمقاس أصغر`;
      } else {
        dpiChip.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200';
        if (dpiText) dpiText.textContent = 'دقة منخفضة للطباعة';
        if (resStatus) resStatus.textContent = `الصورة صغيرة للمقاس ده (${C.w}×${C.h} بكسل) — جرّب مقاس أصغر`;
      }
    }
  } else if (dpiChip) {
    dpiChip.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200';
    if (dpiText) dpiText.textContent = 'في انتظار الصورة';
  }
}

function applyCustomFinish(type) {
  C.finish = type;
  const overlay = $('#finish-specular-overlay');
  const badge = $('#badge-current-finish');
  const btnMatte = $('#toggle-matte-btn');
  const btnGloss = $('#toggle-gloss-btn');

  if (type === 'لامع' || type === 'glossy') {
    if (overlay) overlay.className = 'absolute inset-0 gloss-specular transition-opacity duration-300 pointer-events-none opacity-100';
    if (badge) badge.textContent = 'لامع سينمائي (Gloss)';
    if (btnGloss) {
      btnGloss.className = 'px-3.5 py-1 rounded-md bg-white text-gray-900 shadow-xs transition-all';
    }
    if (btnMatte) {
      btnMatte.className = 'px-3.5 py-1 rounded-md text-gray-600 hover:text-black transition-all';
    }
  } else {
    if (overlay) overlay.className = 'absolute inset-0 matte-diffuse transition-opacity duration-300 pointer-events-none opacity-90';
    if (badge) badge.textContent = 'مطفي مخملي (Matte)';
    if (btnMatte) {
      btnMatte.className = 'px-3.5 py-1 rounded-md bg-white text-gray-900 shadow-xs transition-all';
    }
    if (btnGloss) {
      btnGloss.className = 'px-3.5 py-1 rounded-md text-gray-600 hover:text-black transition-all';
    }
  }

  // تحديث أزرار البطاقة السفلية
  $$('#finish-selector-group .finish-btn').forEach(btn => {
    const isThis = btn.dataset.finish === type;
    btn.classList.toggle('border-2', isThis);
    btn.classList.toggle('border-gray-900', isThis);
    btn.classList.toggle('bg-gray-50/50', isThis);
    btn.classList.toggle('border-gray-200', !isThis);
    btn.classList.toggle('bg-white', !isThis);
    const dot = btn.querySelector('.finish-radio-dot');
    if (dot) dot.classList.toggle('hidden', !isThis);
  });
}

function loadCustomFile(file) {
  if (!file) return;
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff'];
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|tiff?)$/i.test(file.name);
  if (!isImage) {
    toast('نوع الملف غير مدعوم، اختار ملف صورة (JPG, PNG, WebP, TIFF)');
    return;
  }
  const MAX_CUSTOM_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_CUSTOM_SIZE) {
    toast('حجم الصورة كبير جداً (الحد الأقصى 50 ميجابايت)');
    return;
  }

  if (C.url && C.url.startsWith('blob:')) {
    try { URL.revokeObjectURL(C.url); } catch (e) {}
  }

  C.file = file;
  const url = URL.createObjectURL(file);
  const im = new Image();
  im.onload = () => {
    C.url = url;
    C.w = im.naturalWidth;
    C.h = im.naturalHeight;
    C.name = file.name;
    C.meta = `${im.naturalWidth} × ${im.naturalHeight} px · ${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    // تحديث بطاقة الرفع
    const emptyState = $('#dropzone-empty-state');
    const fileState = $('#dropzone-file-state');
    if (emptyState) emptyState.classList.add('hidden');
    if (fileState) fileState.classList.remove('hidden');

    const thumb = $('#upload-thumbnail');
    if (thumb) thumb.style.backgroundImage = `url('${url}')`;

    const nameLabel = $('#file-name-label');
    if (nameLabel) nameLabel.textContent = file.name;

    const metaLabel = $('#file-meta-label');
    if (metaLabel) metaLabel.textContent = C.meta;

    renderCustom();
    toast('تم تحميل صورتك بنجاح');
  };
  im.onerror = () => toast('تعذر فتح الصورة، يرجى تجربة صورة أخرى');
  im.src = url;
}

// تهيئة تفاعلات قسم الطباعة الخاصة
function initCustomizerEvents() {
  // 1. المقاسات
  const sizeGroup = $('#size-selector-group');
  if (sizeGroup) {
    sizeGroup.addEventListener('click', e => {
      const btn = e.target.closest('.size-btn');
      if (!btn) return;
      C.size = btn.dataset.size;
      renderCustomSizes();
      renderCustom();
    });
  }

  // 2. الاتجاه (طولي / عرضي)
  $$('#orientation-toggle-group .orientation-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orient = btn.dataset.orientation === 'portrait' ? 'p' : 'l';
      C.orient = orient;
      $$('#orientation-toggle-group .orientation-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('border-2', active);
        b.classList.toggle('border-blue-600', active);
        b.classList.toggle('bg-blue-50/50', active);
        b.classList.toggle('text-blue-700', active);
        b.classList.toggle('font-bold', active);
        b.classList.toggle('border-gray-200', !active);
        b.classList.toggle('bg-white', !active);
        b.classList.toggle('text-gray-600', !active);
        b.classList.toggle('font-medium', !active);
      });
      renderCustom();
    });
  });

  // 3. ملء الصورة (Cover / Contain)
  $$('#fit-toggle-group .fit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      C.fit = btn.dataset.fit;
      $$('#fit-toggle-group .fit-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('border-2', active);
        b.classList.toggle('border-gray-900', active);
        b.classList.toggle('bg-gray-50', active);
        b.classList.toggle('font-bold', active);
        b.classList.toggle('text-gray-900', active);
        b.classList.toggle('border-gray-200', !active);
        b.classList.toggle('bg-white', !active);
        b.classList.toggle('font-medium', !active);
        b.classList.toggle('text-gray-600', !active);
      });
      renderCustom();
    });
  });

  // 4. التشطيب السطحي (مطفي / لامع)
  $$('#finish-selector-group .finish-btn').forEach(btn => {
    btn.addEventListener('click', () => applyCustomFinish(btn.dataset.finish));
  });
  const tMatte = $('#toggle-matte-btn');
  if (tMatte) tMatte.addEventListener('click', () => applyCustomFinish('مطفي'));
  const tGloss = $('#toggle-gloss-btn');
  if (tGloss) tGloss.addEventListener('click', () => applyCustomFinish('لامع'));

  // 5. عداد الكمية
  const qMinus = $('#qty-minus');
  if (qMinus) {
    qMinus.addEventListener('click', () => {
      if (C.qty > 1) {
        C.qty--;
        renderCustom();
      }
    });
  }
  const qPlus = $('#qty-plus');
  if (qPlus) {
    qPlus.addEventListener('click', () => {
      if (C.qty < 50) {
        C.qty++;
        renderCustom();
      }
    });
  }

  // 6. رفع الملفات والسحب والإفلات
  const fileInput = $('#customFile');
  const dropArea = $('#dropzone-area');
  const triggerBtn = $('#btn-trigger-upload');
  const browseEmpty = $('#btn-browse-empty');

  if (fileInput) {
    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) loadCustomFile(e.target.files[0]);
    });
  }
  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', e => {
      e.stopPropagation();
      fileInput.click();
    });
  }
  if (browseEmpty && fileInput) {
    browseEmpty.addEventListener('click', e => {
      e.stopPropagation();
      fileInput.click();
    });
  }
  if (dropArea && fileInput) {
    dropArea.addEventListener('click', e => {
      if (!e.target.closest('#btn-trigger-upload') && !e.target.closest('#btn-browse-empty')) {
        fileInput.click();
      }
    });
    ['dragenter', 'dragover'].forEach(ev => {
      dropArea.addEventListener(ev, e => {
        e.preventDefault();
        dropArea.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dropArea.addEventListener(ev, e => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
      });
    });
    dropArea.addEventListener('drop', e => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadCustomFile(e.dataTransfer.files[0]);
      }
    });
  }

  // 7. نماذج المعاينة السريعة (Demo State Pills)
  $$('#demo-state-pills .state-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      e.stopPropagation();
      $$('#demo-state-pills .state-pill').forEach(p => {
        p.classList.remove('bg-gray-900', 'text-white');
        p.classList.add('bg-gray-100', 'text-gray-700');
      });
      pill.classList.add('bg-gray-900', 'text-white');
      pill.classList.remove('bg-gray-100', 'text-gray-700');

      const st = pill.dataset.state;
      if (st === 'sample') {
        C.url = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85';
        C.w = 3840;
        C.h = 2560;
        C.name = 'alpine_sunset_golden_hour.jpg';
        C.meta = '3840 × 2560 px · 5.4 MB';
        C.file = null;
        $('#dropzone-empty-state')?.classList.add('hidden');
        $('#dropzone-file-state')?.classList.remove('hidden');
        if ($('#upload-thumbnail')) $('#upload-thumbnail').style.backgroundImage = `url('${C.url}')`;
        if ($('#file-name-label')) $('#file-name-label').textContent = C.name;
        if ($('#file-meta-label')) $('#file-meta-label').textContent = C.meta;
      } else if (st === 'minimal') {
        C.url = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85';
        C.w = 4096;
        C.h = 2800;
        C.name = 'abstract_bauhaus_geometry.png';
        C.meta = '4096 × 2800 px · 3.8 MB';
        C.file = null;
        $('#dropzone-empty-state')?.classList.add('hidden');
        $('#dropzone-file-state')?.classList.remove('hidden');
        if ($('#upload-thumbnail')) $('#upload-thumbnail').style.backgroundImage = `url('${C.url}')`;
        if ($('#file-name-label')) $('#file-name-label').textContent = C.name;
        if ($('#file-meta-label')) $('#file-meta-label').textContent = C.meta;
      } else {
        C.url = null;
        C.w = 0;
        C.h = 0;
        C.name = '';
        C.file = null;
        $('#dropzone-empty-state')?.classList.remove('hidden');
        $('#dropzone-file-state')?.classList.add('hidden');
      }
      renderCustom();
    });
  });

  // 8. محاكاة التمايل ثلاثي الأبعاد والانعكاس (3D Tilt Parallax)
  const mockup = $('#metal-poster-mockup');
  const specular = $('#finish-specular-overlay');
  if (mockup) {
    const handleMove = (clientX, clientY) => {
      const rect = mockup.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      mockup.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;

      if (C.finish === 'لامع' && specular) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        specular.style.background = `linear-gradient(${percentX + 45}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) ${percentY}%, rgba(255,255,255,0) 100%)`;
      }
    };

    mockup.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
    mockup.addEventListener('mouseleave', () => {
      mockup.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      if (C.finish === 'لامع' && specular) {
        specular.className = 'absolute inset-0 gloss-specular transition-opacity duration-300 pointer-events-none opacity-100';
        specular.style.background = '';
      }
    });

    // لمس الشاشة للموبايل
    mockup.addEventListener('touchmove', e => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    mockup.addEventListener('touchend', () => {
      mockup.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  // 9. إضافة اللوحة المخصصة للسلة
  const cAddBtn = $('#cAdd');
  if (cAddBtn) {
    cAddBtn.addEventListener('click', () => {
      if (!C.url) {
        toast('يرجى اختيار صورة أولاً');
        return;
      }
      const sz = sizeOf(C.size) || SHOP.sizes[0] || { w: 30, h: 45, price: 750 };
      const pw = C.orient === 'p' ? sz.w : sz.h;
      const ph = C.orient === 'p' ? sz.h : sz.w;
      addItem({
        key: 'c-' + Date.now(),
        title: 'لوحة معدنية مخصصة (صورتك الخاصة)',
        sub: `${pw}×${ph} سم — تشطيب ${C.finish}`,
        price: sz.price,
        qty: C.qty || 1,
        img: C.url,
        file: C.file,
        orientation: C.orient,
        fit: C.fit,
        finish: C.finish,
        custom: true
      });
      setStep('cart');
      openDrawer();
    });
  }
}

// تشغيل التهيئة
renderCustomSizes();
renderCustom();
initCustomizerEvents();

/* ---------- إدارة السلة (Shopping Cart) ---------- */
function addItem(it) {
  const addCount = it.qty || 1;
  const ex = cart.find(c => c.key === it.key);
  if (ex) ex.qty += addCount;
  else cart.push({ ...it, qty: addCount });
  saveCart();
  renderCart();
  toast('اتضافت للسلة');
  const b = $('#badge');
  if (b && b.animate) {
    b.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 260 });
  }
}

const subtotal = () => cart.reduce((a, i) => a + i.price * i.qty, 0);

function getGovShippingFee(govName) {
  if (!govName) return SHOP.shipping;
  if (SHOP.govShipping && typeof SHOP.govShipping === 'object' && SHOP.govShipping[govName] !== undefined && SHOP.govShipping[govName] !== '') {
    const fee = Number(SHOP.govShipping[govName]);
    if (!isNaN(fee) && fee >= 0) return fee;
  }
  return SHOP.shipping;
}

const shipping = (gov) => {
  if (!cart.length || subtotal() >= SHOP.freeShippingOver) return 0;
  const currentGov = gov || ($('#fGov') ? $('#fGov').value : '');
  return getGovShippingFee(currentGov);
};

const total = () => subtotal() + shipping();

function totalsHTML() {
  const gov = $('#fGov')?.value;
  const s = shipping(gov);
  return `<div><span>المجموع</span><span class="num">${egp(subtotal())}</span></div>
          <div><span>الشحن${gov ? ` (${gov})` : ''}</span><span class="num">${s ? egp(s) : 'ببلاش'}</span></div>
          <div class="grand"><span>الإجمالي</span><span class="num">${egp(total())}</span></div>`;
}

/* دوال احتساب العربون (Deposit) */
function getDepositAmount() {
  if (!SHOP.depositEnabled) return total();
  const t = total();
  if (SHOP.depositType === 'fixed') {
    const fixedVal = Math.round(Number(SHOP.depositValue) || 200);
    return Math.min(t, Math.max(50, fixedVal));
  } else {
    const pct = Math.max(10, Math.min(90, Number(SHOP.depositValue) || 50));
    return Math.max(50, Math.round((t * pct) / 100));
  }
}

function isDepositSelected() {
  if (!SHOP.depositEnabled) return false;
  const rad = document.querySelector('input[name="payType"]:checked');
  return rad ? rad.value === 'deposit' : false;
}

function getRemainingAmount() {
  return isDepositSelected() ? Math.max(0, total() - getDepositAmount()) : 0;
}

function checkoutTotalsHTML() {
  const gov = $('#fGov')?.value;
  const s = shipping(gov);
  const sub = subtotal();
  const t = total();
  const isDep = isDepositSelected();
  const depAmt = getDepositAmount();
  const remAmt = getRemainingAmount();

  const shipTitle = gov ? `سعر الشحن لـ ${gov}:` : 'سعر الشحن لعنوانك:';
  const govHint = gov ? '' : ' <small style="font-size:0.75rem;color:var(--muted);font-weight:normal;">(اختار المحافظة)</small>';

  if (isDep) {
    return `
      <div style="font-size:0.9rem;color:var(--muted);margin-bottom:4px;"><span>مجموع المنتجات:</span><span class="num">${egp(sub)}</span></div>
      <div style="font-size:0.9rem;color:${s ? 'var(--fg)' : '#52b788'};margin-bottom:6px;">
        <span>${shipTitle}</span>
        <span class="num font-bold">${s ? egp(s) : 'شحن مجاني ✓'}${govHint}</span>
      </div>
      <div style="color:var(--muted);font-size:0.85rem;border-top:1px dashed var(--line);padding-top:6px;margin-bottom:6px;">
        <span>إجمالي الطلب بالكامل:</span>
        <span class="num font-bold">${egp(t)}</span>
      </div>
      <div class="grand" style="border-top:1px dashed var(--gold);padding-top:8px;margin-top:2px;">
        <span style="color:var(--gold-text)">المطلوب تحويله الآن (عربون):</span>
        <span class="num" style="color:var(--gold-hi)">${egp(depAmt)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.88rem;color:#6dbb8e;margin-top:6px;background:rgba(109,187,142,0.12);padding:7px 10px;border-radius:8px;">
        <span>المتبقي عند الاستلام مع المندوب:</span>
        <span class="num font-bold">${egp(remAmt)}</span>
      </div>
    `;
  }

  return `
    <div style="font-size:0.9rem;color:var(--muted);margin-bottom:4px;"><span>مجموع المنتجات:</span><span class="num">${egp(sub)}</span></div>
    <div style="font-size:0.9rem;color:${s ? 'var(--fg)' : '#52b788'};margin-bottom:6px;">
      <span>${shipTitle}</span>
      <span class="num font-bold">${s ? egp(s) : 'شحن مجاني ✓'}${govHint}</span>
    </div>
    <div class="grand" style="border-top:1px dashed var(--gold);padding-top:8px;margin-top:2px;">
      <span style="color:var(--gold-text)">الإجمالي المطلوب تحويله:</span>
      <span class="num" style="color:var(--gold-hi)">${egp(t)}</span>
    </div>
  `;
}

function updateDepositUI() {
  const depositBox = $('#depositChoiceField');
  if (!depositBox) return;

  if (!SHOP.depositEnabled || !cart.length) {
    depositBox.style.display = 'none';
    return;
  }
  depositBox.style.display = 'block';

  const gov = $('#fGov')?.value;
  const s = shipping(gov);
  const t = total();
  const depAmt = getDepositAmount();
  const remAmt = Math.max(0, t - depAmt);

  const fullAmtEl = $('#optPayFullAmt');
  if (fullAmtEl) fullAmtEl.textContent = egp(t);

  const fullNoteEl = $('#optPayFullShippingNote');
  if (fullNoteEl) {
    if (!s) {
      fullNoteEl.textContent = 'شحن مجاني بالكامل';
    } else {
      fullNoteEl.textContent = gov ? `شامل مصاريف الشحن لـ ${gov} (${egp(s)})` : `شامل مصاريف الشحن (${egp(s)})`;
    }
  }

  const depTitleEl = $('#optPayDepositTitle');
  if (depTitleEl) {
    depTitleEl.textContent = SHOP.depositType === 'fixed' 
      ? `دفع عربون مقدماً (${egp(depAmt)})` 
      : `دفع عربون مقدماً (${SHOP.depositValue || 50}%)`;
  }

  const depAmtEl = $('#optPayDepositAmt');
  if (depAmtEl) depAmtEl.textContent = egp(depAmt) + ' الآن';

  const depRemEl = $('#optPayDepositRemaining');
  if (depRemEl) {
    depRemEl.textContent = `المتبقي: ${egp(remAmt)} عند الاستلام مع المندوب`;
  }

  const isDep = isDepositSelected();
  const cardFull = $('#optPayFullCard');
  const cardDep = $('#optPayDepositCard');
  if (cardFull) cardFull.classList.toggle('active', !isDep);
  if (cardDep) cardDep.classList.toggle('active', isDep);
}

function renderCart() {
  if ($('#badge')) $('#badge').textContent = cart.reduce((a, i) => a + i.qty, 0);
  if ($('#headerCartTotal')) $('#headerCartTotal').textContent = egp(subtotal());
  const list = $('#cartList');
  if (!list) return;

  if (!cart.length) {
    list.innerHTML = '<div class="empty"><p>السلة فاضية لسه.</p><button class="btn ghost sm" type="button" id="emptyGo">شوف التشكيلة</button></div>';
    if ($('#cartTotals')) $('#cartTotals').innerHTML = '';
  } else {
    list.innerHTML = cart.map(i => `
      <div class="item" data-key="${i.key}">
        <div class="thumb">${i.img ? `<img src="${i.img}" alt="">` : (i.kind ? artSvg(i.kind, i.title) : '<div style="background:var(--metal);width:100%;height:100%"></div>')}</div>
        <div>
          <h4>${esc(i.title)}</h4>
          <small>${esc(i.sub)}</small>
          <div class="qty">
            <button type="button" data-act="dec" aria-label="تقليل">−</button>
            <span class="num" aria-live="polite">${i.qty}</span>
            <button type="button" data-act="inc" aria-label="زيادة">+</button>
          </div>
          <br>
          <button class="rm" type="button" data-act="del">حذف</button>
        </div>
        <div class="price num">${egp(i.price * i.qty)}</div>
      </div>
    `).join('');
    if ($('#cartTotals')) $('#cartTotals').innerHTML = totalsHTML();
  }
  renderGovOptions();
  if ($('#coTotals')) $('#coTotals').innerHTML = checkoutTotalsHTML();
  updateDepositUI();
  renderPay();
  updateAmtHint();
  renderFoot();
}

$('#cartList')?.addEventListener('click', e => {
  if (e.target.id === 'emptyGo') {
    closeDrawer();
    const gal = document.getElementById('gallery');
    if (gal) {
      gal.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = 'index.html#gallery';
    }
    return;
  }
  const row = e.target.closest('.item'), b = e.target.closest('[data-act]');
  if (!row || !b) return;
  const it = cart.find(c => c.key === row.dataset.key);
  if (!it) return;
  if (b.dataset.act === 'inc') it.qty++;
  else if (b.dataset.act === 'dec') {
    it.qty--;
    if (it.qty <= 0) cart = cart.filter(c => c !== it);
  } else {
    cart = cart.filter(c => c !== it);
  }
  saveCart();
  renderCart();
});

/* ---------- التحكم في نافذة السلة والخطوات ---------- */
let step = 'cart', lastFocus = null;

function openDrawer() {
  lastFocus = document.activeElement;
  if (!$('#drawer') || !$('#scrim')) return;
  $('#drawer').inert = false;
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#drawer').classList.add('open');
  $('#scrim').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#closeCart')?.focus(), 50);
}

function openCart() {
  if ($('#navDrawer') && $('#navDrawer').classList.contains('open')) closeNavMenu();
  setStep(step === 'done' ? 'cart' : step);
  openDrawer();
}

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#scrim').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#drawer').inert = true;
  document.body.style.overflow = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function setStep(s) {
  step = s;
  $('#stepCart').hidden = s !== 'cart';
  $('#stepCheckout').hidden = s !== 'checkout';
  $('#stepDone').hidden = s !== 'done';
  $('#dTitle').textContent = s === 'cart' ? 'سلتك' : s === 'checkout' ? 'بيانات الطلب والدفع' : 'تم';
  $$('#stepbar span').forEach((sp, i) => sp.classList.toggle('on', i === ['cart', 'checkout', 'done'].indexOf(s)));
  $('#stepbar').hidden = false;
  $('#dbody').scrollTop = 0;
  if (s === 'checkout') {
    renderGovOptions();
    $('#coTotals').innerHTML = checkoutTotalsHTML();
    updateDepositUI();
    renderPay();
    updateAmtHint();
  }
  renderFoot();
}

function renderFoot() {
  const f = $('#dfoot');
  if (step === 'cart') {
    f.hidden = false;
    f.innerHTML = `<button class="btn block" type="button" id="goCheckout" ${cart.length ? '' : 'disabled'}>إتمام الطلب</button>`;
  } else if (step === 'checkout') {
    f.hidden = false;
    f.innerHTML = `<div style="display:flex;gap:10px">
      <button class="btn ghost" type="button" id="backCart">رجوع</button>
      <button class="btn block" type="button" id="submitOrder">تأكيد الطلب</button>
    </div>`;
  } else {
    f.hidden = true;
  }
}

$('#dfoot').addEventListener('click', e => {
  if (e.target.id === 'goCheckout' && cart.length) setStep('checkout');
  if (e.target.id === 'backCart') setStep('cart');
  if (e.target.id === 'submitOrder') submitOrder();
});

/* ---------- التحكم في القائمة الجانبية (Sidebar Navigation) ---------- */
let lastNavFocus = null;

function openNavMenu() {
  const menu = $('#navDrawer');
  const scrim = $('#navScrim');
  const openBtn = $('#openMenu');
  if (!menu || !scrim) return;
  lastNavFocus = document.activeElement;
  menu.inert = false;
  menu.setAttribute('aria-hidden', 'false');
  menu.classList.add('open');
  scrim.classList.add('open');
  if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const c = $('#closeMenu');
    if (c) c.focus();
  }, 50);
}

function closeNavMenu() {
  const menu = $('#navDrawer');
  const scrim = $('#navScrim');
  const openBtn = $('#openMenu');
  if (!menu || !scrim) return;
  menu.classList.remove('open');
  scrim.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  menu.inert = true;
  if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  if (lastNavFocus && lastNavFocus.focus) lastNavFocus.focus();
}

if ($('#openMenu')) $('#openMenu').addEventListener('click', openNavMenu);
if ($('#closeMenu')) $('#closeMenu').addEventListener('click', closeNavMenu);
if ($('#navScrim')) $('#navScrim').addEventListener('click', closeNavMenu);

// إغلاق القائمة الجانبية عند الضغط على أي عنصر داخلها
$$('#navDrawer .nav-item').forEach(item => {
  item.addEventListener('click', () => {
    closeNavMenu();
  });
});

$('#openCart')?.addEventListener('click', () => {
  if ($('#navDrawer') && $('#navDrawer').classList.contains('open')) closeNavMenu();
  setStep(step === 'done' ? 'cart' : step);
  openDrawer();
});
$('#closeCart')?.addEventListener('click', closeDrawer);
$('#scrim')?.addEventListener('click', closeDrawer);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('#drawer') && $('#drawer').classList.contains('open')) closeDrawer();
    if ($('#navDrawer') && $('#navDrawer').classList.contains('open')) closeNavMenu();
  }
});

$('#backShop')?.addEventListener('click', () => {
  cart = [];
  saveCart();
  renderCart();
  setStep('cart');
  closeDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- إتمام الطلب والدفع (Checkout) ---------- */
const GOVS = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية',
  'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح',
  'شمال سيناء', 'جنوب سيناء', 'الوادي الجديد'
];
function renderGovOptions() {
  const sel = $('#fGov');
  if (!sel) return;
  const curVal = sel.value;
  const isFree = cart.length && subtotal() >= SHOP.freeShippingOver;

  sel.innerHTML = '<option value="">اختار المحافظة</option>' + GOVS.map(g => {
    const fee = getGovShippingFee(g);
    const feeText = isFree ? 'شحن مجاني ✓' : (fee ? `${fee} ج.م` : 'شحن مجاني');
    return `<option value="${g}">${g} (${feeText})</option>`;
  }).join('');

  if (curVal && GOVS.includes(curVal)) {
    sel.value = curVal;
  }
}
renderGovOptions();

function payMethod() {
  return ($('input[name="pay"]:checked') || {}).value || 'instapay';
}

function renderPay() {
  const w = payMethod() === 'wallet';
  $('#payHow').textContent = w ? 'حوّل على رقم محفظة كاش ده:' : 'حوّل على إنستا باي على العنوان ده:';
  $('#payNum').textContent = w ? SHOP.wallet : SHOP.instapay;

  const subText = $('#paySubText');
  if (subText && cart.length) {
    const gov = $('#fGov')?.value;
    const s = shipping(gov);
    const isDep = isDepositSelected();
    const reqAmt = isDep ? getDepositAmount() : total();
    const shipStr = s ? (gov ? `سعر الشحن لـ ${gov} ${egp(s)}` : `سعر الشحن ${egp(s)}`) : 'الشحن مجاني';

    if (isDep) {
      const rem = getRemainingAmount();
      subText.innerHTML = `المطلوب تحويله الآن كعربون: <b class="num" style="color:var(--gold-text);font-weight:700;">${egp(reqAmt)}</b> <span style="font-size:0.82rem;color:var(--muted);">(شامل ${shipStr} + جزء من قيمة اللوحات | والمتبقي ${egp(rem)} عند الاستلام)</span>`;
    } else {
      subText.innerHTML = `المطلوب تحويله بالكامل: <b class="num" style="color:var(--gold-text);font-weight:700;">${egp(reqAmt)}</b> <span style="font-size:0.82rem;color:var(--muted);">(مجموع اللوحات ${egp(subtotal())} + ${shipStr})</span>`;
    }
  }
}
$$('input[name="pay"]').forEach(r => r.addEventListener('change', renderPay));
renderPay();

// مستمعات اختيار طريقة السداد: بالكامل أو عربون مقدماً
$$('input[name="payType"]').forEach(r => {
  r.addEventListener('change', () => {
    updateDepositUI();
    $('#coTotals').innerHTML = checkoutTotalsHTML();
    renderPay();
    updateAmtHint();
  });
});

if ($('#fGov')) {
  $('#fGov').addEventListener('change', () => {
    $('#coTotals').innerHTML = checkoutTotalsHTML();
    updateDepositUI();
    renderPay();
    updateAmtHint();
  });
}

const cardFull = $('#optPayFullCard');
const cardDep = $('#optPayDepositCard');
if (cardFull) {
  cardFull.addEventListener('click', () => {
    const r = $('#payTypeFull') || cardFull.querySelector('input[type="radio"]');
    if (r && !r.checked) {
      r.checked = true;
      r.dispatchEvent(new Event('change'));
    }
  });
}
if (cardDep) {
  cardDep.addEventListener('click', () => {
    const r = $('#payTypeDeposit') || cardDep.querySelector('input[type="radio"]');
    if (r && !r.checked) {
      r.checked = true;
      r.dispatchEvent(new Event('change'));
    }
  });
}

$('#copyNum').addEventListener('click', () => {
  const t = $('#payNum').textContent;
  const done = () => toast('اتنسخ');
  try {
    navigator.clipboard.writeText(t).then(done, () => {
      selectNum();
      toast('حدد الرقم وانسخه');
    });
  } catch (e) {
    selectNum();
    toast('حدد الرقم وانسخه');
  }
});

function selectNum() {
  const r = document.createRange();
  r.selectNodeContents($('#payNum'));
  const s = getSelection();
  s.removeAllRanges();
  s.addRange(r);
}

function updateAmtHint() {
  const h = $('#amtHint');
  if (!h) return;
  if (!cart.length) {
    h.textContent = '';
    return;
  }
  const gov = $('#fGov')?.value;
  const s = shipping(gov);
  const sub = subtotal();
  const isDep = isDepositSelected();
  const requiredAmt = isDep ? getDepositAmount() : total();
  const shipText = s ? (gov ? `سعر الشحن لـ ${gov} ${egp(s)}` : `سعر الشحن ${egp(s)}`) : 'شحن مجاني';

  if (isDep) {
    const rem = getRemainingAmount();
    h.innerHTML = `العربون المطلوب تحويله الآن: <b style="color:var(--gold,#c9a45c);">${egp(requiredAmt)}</b> <span style="font-size:0.82rem;color:var(--muted);">(شامل ${shipText}، والمتبقي ${egp(rem)} عند الاستلام مع المندوب)</span>`;
  } else {
    h.innerHTML = `الإجمالي المطلوب تحويله كاملاً: <b style="color:var(--gold,#c9a45c);">${egp(requiredAmt)}</b> <span style="font-size:0.82rem;color:var(--muted);">(مجموع اللوحات ${egp(sub)} + ${shipText})</span>`;
  }
}

let shotFile = null;
$('#fShot').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  // التحقق من نوع الصورة
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const isImg = f.type.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(f.name);
  if (!isImg) {
    toast('نوع الملف غير مدعوم، اختار صورة إيصال صحيحة (JPG, PNG, WebP)');
    e.target.value = '';
    return;
  }
  // التحقق من أقصى حجم (10 ميجابايت كحد أقصى)
  const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;
  if (f.size > MAX_RECEIPT_SIZE) {
    toast('حجم سكرين التحويل كبير جداً (الحد الأقصى 10 ميجابايت)');
    e.target.value = '';
    return;
  }
  shotFile = f;
  const im = $('#shotImg');
  if (im.src) {
    try { URL.revokeObjectURL(im.src); } catch (_) {}
  }
  im.src = URL.createObjectURL(f);
  im.hidden = false;
  $('#shotBtn').textContent = 'غيّر الصورة';
});

async function submitOrder() {
  // 1. حماية البوتات الصامتة (Honeypot)
  const honey = $('#fHoney') ? $('#fHoney').value.trim() : '';
  if (honey) {
    console.warn('Bot detected via honeypot.');
    setStep('done');
    return;
  }

  // 2. حماية تكرار الطلبات السريع (Rate limit / Cooldown)
  const lastSubmit = sessionStorage.getItem('postera_last_order');
  if (lastSubmit && (Date.now() - Number(lastSubmit)) < 45000) {
    toast('تم إرسال طلبك بالفعل! برجاء الانتظار دقيقة قبل إرسال طلب آخر.');
    return;
  }

  const errs = [];
  const name = $('#fName').value.trim();
  const phone = toLatin($('#fPhone').value).replace(/[\s-]/g, '');
  const gov = $('#fGov').value;
  const addr = $('#fAddr').value.trim();
  const amt = parseFloat(toLatin($('#fAmount').value).replace(/[,،]/g, ''));

  const isDep = isDepositSelected();
  const requiredAmt = isDep ? getDepositAmount() : total();
  const remAmt = isDep ? getRemainingAmount() : 0;

  if (!cart.length) errs.push(['fName', 'السلة فاضية.']);
  if (name.length < 3) errs.push(['fName', 'اكتب الاسم بالكامل (3 حروف على الأقل).']);
  if (!/^01[0125]\d{8}$/.test(phone)) errs.push(['fPhone', 'رقم الموبايل لازم يكون 11 رقم مصري صحيح ويبدأ بـ 01.']);
  if (!gov) errs.push(['fGov', 'اختار المحافظة.']);
  if (addr.length < 6) errs.push(['fAddr', 'اكتب العنوان بالتفصيل (الشارع والمنطقة).']);
  if (!(amt > 0)) {
    errs.push(['fAmount', 'اكتب المبلغ اللي حوّلته.']);
  } else if (amt < requiredAmt) {
    if (isDep) {
      errs.push(['fAmount', `المبلغ أقل من العربون المطلوب تحويله الآن (${egp(requiredAmt)} شاملاً مصاريف الشحن).`]);
    } else {
      errs.push(['fAmount', `المبلغ أقل من الإجمالي المطلوب (${egp(requiredAmt)} شاملاً مصاريف الشحن).`]);
    }
  }
  if (!shotFile) errs.push(['fShot', 'ارفع سكرين التحويل.']);

  const box = $('#errBox');
  if (errs.length) {
    box.hidden = false;
    box.innerHTML = '<ul>' + errs.map(e => `<li>${e[1]}</li>`).join('') + '</ul>';
    box.scrollIntoView({ block: 'nearest' });
    const f = $('#' + errs[0][0]);
    if (f && f.focus && errs[0][0] !== 'fShot') f.focus();
    return;
  }
  box.hidden = true;

  const submitBtn = $('#submitOrder');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري إرسال الطلب...';
  }

  /* توليد رقم الطلب ببادئة بوستيرا PST- */
  const currentShippingCost = shipping(gov);
  const order = {
    no: 'PST-' + String(Math.floor(1000 + Math.random() * 9000)),
    name,
    phone,
    gov,
    addr,
    pay: payMethod(),
    amount: amt,
    total: total(),
    is_deposit: isDep,
    deposit_amount: isDep ? amt : 0,
    remaining_amount: remAmt,
    shipping_fee: currentShippingCost,
    items: cart.map(i => ({
      title: i.title,
      sub: i.sub,
      qty: i.qty,
      price: i.price,
      custom: i.custom,
      file: i.file,
      orientation: i.orientation,
      fit: i.fit,
      finish: i.finish
    })),
    screenshot: shotFile
  };

  /* في حال كان Supabase مربوطاً */
  if (supabaseClient) {
    try {
      // 1. رفع سكرين التحويل للحاوية الخاصة (Private Storage)
      let screenshotPath = null;
      if (shotFile) {
        const extMatch = shotFile.name.match(/\.(jpe?g|png|webp|heic)$/i);
        const fileExt = extMatch ? extMatch[1].toLowerCase() : 'jpg';
        const fileName = `${order.no}_receipt_${Date.now()}.${fileExt}`;
        const { error: shotErr } = await supabaseClient.storage
          .from('payment_screenshots')
          .upload(fileName, shotFile);
        if (!shotErr) screenshotPath = fileName;
      }

      // 2. رفع صور الطباعة الخاصة للحاوية الخاصة (Private Storage)
      for (const it of order.items) {
        if (it.custom && it.file) {
          const extMatch = it.file.name.match(/\.(jpe?g|png|webp|heic|tiff?)$/i);
          const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
          const customName = `${order.no}_custom_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          const { error: cErr } = await supabaseClient.storage
            .from('custom_designs')
            .upload(customName, it.file);
          if (!cErr) it.uploadedPath = customName;
        }
      }

      const orderDbId = (window.crypto && window.crypto.randomUUID) 
        ? window.crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });

      const shipDesc = currentShippingCost ? `مصاريف شحن ${gov} (${egp(currentShippingCost)})` : `شحن مجاني لـ ${gov}`;
      const notesText = (isDep
        ? `نظام الدفع: عربون مقدماً (${egp(amt)}) - متبقي للاستلام مع المندوب (${egp(remAmt)})`
        : 'نظام الدفع: سداد كامل المبلغ مقدماً') + ` | ${shipDesc}`;

      const orderPayload = {
        id: orderDbId,
        order_number: order.no,
        customer_name: order.name,
        customer_phone: order.phone,
        governorate: order.gov,
        address: order.addr,
        payment_method: order.pay,
        total_amount: order.total,
        transferred_amount: order.amount,
        payment_screenshot_url: screenshotPath,
        status: 'pending',
        is_deposit: isDep,
        deposit_amount: isDep ? amt : 0,
        remaining_amount: remAmt,
        shipping_fee: currentShippingCost,
        notes: notesText
      };

      // 3. إدخال الطلب في جدول orders (INSERT فقط مسموح للزائر)
      let { error: orderErr } = await supabaseClient
        .from('orders')
        .insert([orderPayload]);

      // Fallback في حال لم تنفّذ أعمدة العربون أو سعر الشحن بعد في Supabase
      if (orderErr && (orderErr.message?.includes('is_deposit') || orderErr.message?.includes('deposit_amount') || orderErr.message?.includes('remaining_amount') || orderErr.message?.includes('shipping_fee'))) {
        console.warn('Fallback: إعادة محاولة الحفظ بدون الأعمدة غير المضافة بعد في orders مع الاحتفاظ بالملاحظات:', orderErr.message);
        delete orderPayload.is_deposit;
        delete orderPayload.deposit_amount;
        delete orderPayload.remaining_amount;
        delete orderPayload.shipping_fee;
        let retry = await supabaseClient.from('orders').insert([orderPayload]);
        if (retry.error && retry.error.message?.includes('notes')) {
          delete orderPayload.notes;
          retry = await supabaseClient.from('orders').insert([orderPayload]);
        }
        orderErr = retry.error;
      }

      // 4. إدخال عناصر الطلب في جدول order_items
      if (!orderErr) {
        const dbItems = order.items.map(i => ({
          order_id: orderDbId,
          product_title: i.title,
          size_label: i.sub,
          quantity: i.qty,
          unit_price: i.price,
          total_price: i.price * i.qty,
          is_custom: !!i.custom,
          custom_image_url: i.uploadedPath || null,
          orientation: i.orientation || null,
          fit: i.fit || null,
          finish: i.finish || null
        }));
        await supabaseClient.from('order_items').insert(dbItems);
      } else {
        console.warn('تنبيه إضافة الطلب في Supabase:', orderErr);
      }
    } catch (err) {
      console.warn('تنبيه حفظ Supabase (سيتم الاستمرار محلياً):', err);
    }
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'تأكيد الطلب';
  }

  // 1. إرسال تنبيه بالبريد الإلكتروني للإدارة
  sendAdminNotification(order);

  // 2. تحديث ملخص العربون في شاشة التأكيد (#stepDone)
  const doneDep = $('#doneDepositInfo');
  if (doneDep) {
    if (order.is_deposit) {
      doneDep.style.display = 'block';
      doneDep.innerHTML = `
        <div style="font-weight:700;color:var(--gold-text);margin-bottom:6px;font-size:1.05rem;">نظام الدفع: عربون مقدماً</div>
        <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:4px;">
          <span class="muted">العربون المسدد الآن:</span>
          <strong class="num">${egp(order.amount)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.95rem;color:#6dbb8e;font-weight:700;padding-top:6px;border-top:1px dashed rgba(255,255,255,0.15);margin-top:4px;">
          <span>المتبقي عند الاستلام مع المندوب:</span>
          <strong class="num">${egp(order.remaining_amount)}</strong>
        </div>
      `;
    } else {
      doneDep.style.display = 'none';
      doneDep.innerHTML = '';
    }
  }

  // 3. تفعيل زر كلّم خدمة العملاء على واتساب
  const waBtn = $('#waOrderBtn');
  if (waBtn) {
    const paySystemDesc = order.is_deposit
      ? `• نظام الدفع: دفع عربون مقدماً\n• العربون المحوّل: ${egp(order.amount)}\n• المتبقي للدفع عند الاستلام مع المندوب: ${egp(order.remaining_amount)}\n`
      : `• نظام الدفع: سداد كامل المبلغ مقدماً (${egp(order.amount)})\n`;

    const waMsg = encodeURIComponent(
      `مرحباً بوستيرا، قمت بطلب جديد عبر المتجر:\n\n` +
      `رقم الطلب: ${order.no}\n` +
      `الاسم: ${order.name}\n` +
      `الموبايل: ${order.phone}\n` +
      `المحافظة: ${order.gov}\n` +
      `العنوان: ${order.addr}\n` +
      `طريقة الدفع: ${order.pay === 'instapay' ? 'إنستا باي' : 'محفظة كاش'}\n` +
      `• مصاريف الشحن لـ ${order.gov}: ${order.shipping_fee ? egp(order.shipping_fee) : 'شحن مجاني'}\n` +
      paySystemDesc +
      `إجمالي الطلب: ${egp(order.total)}\n\n` +
      `البنود:\n${order.items.map(it => `• ${it.title} (${it.sub}) × ${it.qty}`).join('\n')}\n\n` +
      `تم رفع إيصال التحويل بنجاح في الموقع للمراجعة.`
    );
    waBtn.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}?text=${waMsg}`;
    waBtn.textContent = 'كلّم خدمة العملاء على واتساب';
    waBtn.style.display = 'inline-flex';
  }

  try {
    sessionStorage.setItem('postera_last_order', String(Date.now()));
  } catch (e) {}
  cart = [];
  saveCart();
  renderCart();
  if ($('#ordNo')) $('#ordNo').textContent = order.no;
  setStep('done');
}

/* ---------- إرسال تنبيه بريد إلكتروني للإدارة عند طلب جديد ---------- */
async function sendAdminNotification(order) {
  const adminUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'admin.html';
  const targetEmail = SHOP.notification_email || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.notificationEmail) || 'admin@postera.com';
  const apiKey = SHOP.resend_api_key || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.resendApiKey);
  const webhookUrl = SHOP.email_webhook_url || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.emailWebhookUrl);

  const payTitle = order.is_deposit ? `[عربون: ${egp(order.amount)}]` : `[سداد كامل]`;
  const subject = `طلب جديد في بوستيرا: [${order.no}] ${payTitle} - ${order.name} (${egp(order.total)})`;
  const htmlBody = `
    <div dir="rtl" style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1c1a17;max-width:620px;margin:20px auto;padding:26px;border:1px solid #e2ddd1;border-radius:14px;background:#faf8f5;">
      <div style="border-bottom:2px solid #c9a45c;padding-bottom:12px;margin-bottom:18px;">
        <h2 style="color:#a47e32;margin:0 0 6px 0;font-size:22px;">وصلك طلب جديد في بوستيرا</h2>
        <span style="color:#5f5a52;font-size:14px;">تم تسجيل الطلب في المتجر وهو بانتظار مراجعتك وتأكيده للطباعة.</span>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:15px;">
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;width:140px;">رقم الطلب:</td><td style="padding:10px 0;font-weight:bold;color:#a47e32;font-size:17px;">${order.no}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">نظام الدفع:</td><td style="padding:10px 0;font-weight:bold;color:${order.is_deposit ? '#d97706' : '#1f7a48'};">${order.is_deposit ? `عربون مقدماً (متبقي ${egp(order.remaining_amount)} للاستلام مع المندوب)` : 'سداد كامل المبلغ مقدماً'}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">اسم العميل:</td><td style="padding:10px 0;font-weight:bold;">${order.name}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">رقم الموبايل:</td><td style="padding:10px 0;"><a href="tel:${order.phone}" style="color:#a47e32;text-decoration:none;font-weight:bold;">${order.phone}</a></td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">المحافظة:</td><td style="padding:10px 0;">${order.gov}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">مصاريف الشحن (${order.gov}):</td><td style="padding:10px 0;font-weight:bold;color:#a47e32;">${order.shipping_fee ? egp(order.shipping_fee) : 'شحن مجاني ✓'}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">العنوان:</td><td style="padding:10px 0;">${order.addr}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">طريقة الدفع:</td><td style="padding:10px 0;">${order.pay === 'instapay' ? 'إنستا باي (InstaPay)' : 'محفظة كاش إلكترونية'}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">المبلغ المحوّل الآن:</td><td style="padding:10px 0;font-weight:bold;">${egp(order.amount)}</td></tr>
        ${order.is_deposit ? `<tr style="border-bottom:1px solid #e2ddd1;background:#eef8f2;"><td style="padding:10px 8px;color:#1f7a48;font-weight:bold;">المتبقي للمندوب عند الاستلام:</td><td style="padding:10px 8px;font-weight:bold;color:#1f7a48;font-size:17px;">${egp(order.remaining_amount)}</td></tr>` : ''}
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">الإجمالي المطلوب:</td><td style="padding:10px 0;font-weight:bold;color:#1f7a48;font-size:18px;">${egp(order.total)}</td></tr>
      </table>

      <div style="background:#f1ece1;border-radius:10px;padding:14px;margin:18px 0;">
        <strong style="display:block;margin-bottom:6px;color:#7a5a1a;">بنود الطلب:</strong>
        <ul style="margin:0;padding-inline-start:20px;font-size:14px;color:#333;">
          ${order.items.map(it => `<li><strong>${it.title}</strong> (${it.sub}) × ${it.qty} = ${egp(it.price * it.qty)}</li>`).join('')}
        </ul>
      </div>

      <div style="margin:26px 0;text-align:center;">
        <a href="${adminUrl}" style="background:linear-gradient(135deg,#e2c88a,#c9a45c);color:#1a1408;padding:12px 32px;text-decoration:none;border-radius:999px;font-weight:bold;font-size:16px;display:inline-block;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          فتح وفحص الطلب في لوحة الإدارة
        </a>
      </div>

      <p style="font-size:12px;color:#888;text-align:center;margin-top:20px;">
        تم إرسال هذا التنبيه التلقائي فور تسجيل الطلب في متجر بوستيرا POSTERA.
      </p>
    </div>
  `;

  if (apiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'بوستيرا POSTERA <onboarding@resend.dev>',
          to: [targetEmail],
          subject: subject,
          html: htmlBody
        })
      });
      return;
    } catch (e) {
      console.warn('Resend email error:', e);
    }
  }

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: subject,
          order_no: order.no,
          customer_name: order.name,
          customer_phone: order.phone,
          governorate: order.gov,
          address: order.addr,
          total_amount: order.total,
          transferred_amount: order.amount,
          admin_url: adminUrl,
          message: htmlBody
        })
      });
    } catch (e) {
      console.warn('Webhook email error:', e);
    }
  }
}

/* ---------- مزامنة المتجر الحية مع Supabase ---------- */
async function syncWithSupabase() {
  if (!supabaseClient) return;
  try {
    // 1. مزامنة الإعدادات (Settings)
    const { data: sData } = await supabaseClient.from('settings').select('*').single();
    if (sData) {
      if (sData.instapay_handle) SHOP.instapay = sData.instapay_handle;
      if (sData.wallet_number) SHOP.wallet = sData.wallet_number;
      if (sData.whatsapp_number) SHOP.whatsapp = sData.whatsapp_number;
      if (sData.notification_email) SHOP.notification_email = sData.notification_email;
      if (sData.resend_api_key) SHOP.resend_api_key = sData.resend_api_key;
      if (sData.email_webhook_url) SHOP.email_webhook_url = sData.email_webhook_url;
      if (sData.shipping_fee !== null && sData.shipping_fee !== undefined) SHOP.shipping = Number(sData.shipping_fee);
      if (sData.free_shipping_threshold !== null && sData.free_shipping_threshold !== undefined) SHOP.freeShippingOver = Number(sData.free_shipping_threshold);
      if (sData.governorate_shipping) {
        SHOP.govShipping = typeof sData.governorate_shipping === 'string'
          ? JSON.parse(sData.governorate_shipping)
          : sData.governorate_shipping;
      } else {
        const localGov = localStorage.getItem('postera_gov_shipping');
        if (localGov) {
          try { SHOP.govShipping = JSON.parse(localGov); } catch (e) {}
        }
      }
      if (sData.deposit_enabled !== undefined && sData.deposit_enabled !== null) {
        SHOP.depositEnabled = sData.deposit_enabled;
      } else if (localStorage.getItem('postera_deposit_enabled') !== null) {
        SHOP.depositEnabled = localStorage.getItem('postera_deposit_enabled') === 'true';
      }
      if (sData.deposit_type) {
        SHOP.depositType = sData.deposit_type;
      } else if (localStorage.getItem('postera_deposit_type')) {
        SHOP.depositType = localStorage.getItem('postera_deposit_type');
      }
      if (sData.deposit_value !== undefined && sData.deposit_value !== null) {
        SHOP.depositValue = Number(sData.deposit_value);
      } else if (localStorage.getItem('postera_deposit_value')) {
        SHOP.depositValue = Number(localStorage.getItem('postera_deposit_value'));
      }
      if ($('#footWa')) $('#footWa').textContent = SHOP.whatsapp;
      const revBtn = $('#reviewShareWa');
      if (revBtn && SHOP.whatsapp) {
        revBtn.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent('مرحباً بوستيرا، حابب أشارك رأيي وصورة اللوحة بعد التركيب')}`;
      }
      const navWa = $('#navWhatsappLink');
      if (navWa && SHOP.whatsapp) {
        navWa.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}`;
      }
      const floatWa = $('#whatsappFloat');
      if (floatWa) {
        const floatEnabled = sData.whatsapp_float_enabled !== false && localStorage.getItem('postera_wa_float') !== 'false';
        if (floatEnabled && SHOP.whatsapp) {
          floatWa.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}`;
          floatWa.style.display = 'inline-flex';
        } else {
          floatWa.style.display = 'none';
        }
      }
      if (sData.banners) {
        try {
          const fetchedBanners = typeof sData.banners === 'string' ? JSON.parse(sData.banners) : sData.banners;
          if (Array.isArray(fetchedBanners) && fetchedBanners.length) {
            BANNERS = fetchedBanners;
            localStorage.setItem('postera_banners', JSON.stringify(BANNERS));
            renderHeroSlider();
          }
        } catch (e) {}
      }
      if (sData.curated_cards) {
        try {
          const fetchedCurated = typeof sData.curated_cards === 'string' ? JSON.parse(sData.curated_cards) : sData.curated_cards;
          if (Array.isArray(fetchedCurated) && fetchedCurated.length) {
            CURATED = fetchedCurated;
            localStorage.setItem('postera_curated_cards', JSON.stringify(CURATED));
            renderCuratedGrid();
          }
        } catch (e) {}
      }
      renderGovOptions();
      renderPay();
      updateDepositUI();
      renderCart();
    }

    // 2. مزامنة المقاسات والأسعار (Sizes & Prices)
    const { data: szData } = await supabaseClient
      .from('sizes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (szData && szData.length) {
      SHOP.sizes = szData.map(s => ({
        id: s.id,
        label: s.label,
        w: Number(s.width_cm),
        h: Number(s.height_cm),
        price: Number(s.price)
      }));
      try {
        localStorage.setItem('postera_sizes', JSON.stringify(SHOP.sizes));
      } catch (e) {}
      if (!sizeOf(C.size)) C.size = SHOP.sizes[0].id;
      if ($('#cSize')) $('#cSize').innerHTML = segHTML(SHOP.sizes.map(s => ({ id: s.id, html: `<bdi>${s.label}</bdi>` })), C.size, 'data-v');
      renderCustomSizes();
      renderCustom();
      renderGrid();
    }

    // 3. مزامنة المنتجات والكتالوج (Products)
    const { data: pData } = await supabaseClient
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });

    if (pData && pData.length) {
      const hasRealImages = pData.some(p => p.image_url && p.image_url.trim() !== '');
      if (hasRealImages) {
        POSTERS = pData.map(p => ({
          id: p.id,
          kind: p.kind,
          title: p.title,
          cat: p.category,
          image_url: p.image_url
        }));
        CATS = ['الكل', ...new Set(POSTERS.map(p => p.cat))];
        if (!CATS.includes(st.filter)) st.filter = 'الكل';
      }
      renderFilters();
      renderGrid();
      try {
        window.dispatchEvent(new CustomEvent('postera:products-synced'));
      } catch (e) {}
    }
  } catch (e) {
    console.warn('تنبيه المزامنة مع Supabase (سيتم استخدام البيانات المحلية):', e);
  }
}

/* ==========================================================================
   إدارة مظهر ديسبليت (Theme Manager: Displate Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const saved = localStorage.getItem('postera_theme') || 'light';
  setTheme(saved, false);
}

function setTheme(theme, showToast = true) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('postera_theme', theme);
  const isDark = theme === 'dark';
  const icon = isDark ? '☀️' : '🌙';
  const label = isDark ? 'الوضع الفاتح' : 'وضع ديسبليت الداكن';
  const tIcon = $('#themeIcon');
  if (tIcon) tIcon.textContent = icon;
  const dIcon = $('#drawerThemeIcon');
  if (dIcon) dIcon.textContent = icon;
  const dLabel = $('#drawerThemeLabel');
  if (dLabel) dLabel.textContent = label;
  if (showToast) {
    toast(isDark ? 'تم التفعيل: مظهر ديسبليت الداكن 🌙' : 'تم التفعيل: الوضع الفاتح ☀️');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next, true);
}

const themeBtn = $('#themeToggle');
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

const drawerThemeBtn = $('#drawerThemeToggle');
if (drawerThemeBtn) drawerThemeBtn.addEventListener('click', toggleTheme);

/* ---------- بدء التشغيل (Init) ---------- */
initTheme();
renderHeroSlider();
initSliderInteractions();
renderCuratedGrid();
if ($('#footWa')) $('#footWa').textContent = SHOP.whatsapp;
const initRevBtn = $('#reviewShareWa');
if (initRevBtn && SHOP.whatsapp) {
  initRevBtn.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent('مرحباً بوستيرا، حابب أشارك رأيي وصورة اللوحة بعد التركيب')}`;
}
const initNavWa = $('#navWhatsappLink');
if (initNavWa && SHOP.whatsapp) {
  initNavWa.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}`;
}
const initFloatWa = $('#whatsappFloat');
if (initFloatWa) {
  const floatEnabled = localStorage.getItem('postera_wa_float') !== 'false';
  if (floatEnabled && SHOP.whatsapp) {
    initFloatWa.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}`;
    initFloatWa.style.display = 'inline-flex';
  } else {
    initFloatWa.style.display = 'none';
  }
}
try {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat');
  if (catParam) {
    st.filter = decodeURIComponent(catParam);
  }
  const qParam = urlParams.get('q');
  const searchInput = $('#storeSearchInput');
  if (qParam && searchInput) {
    searchInput.value = decodeURIComponent(qParam);
  }
} catch (e) {}

renderFilters();
renderGrid();
renderCustomSizes();
renderCustom();
renderCart();
setStep('cart');
syncWithSupabase();
