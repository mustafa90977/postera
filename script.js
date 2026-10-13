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
  shipping: 60,                       // سعر الشحن لجميع المحافظات (جنيه)
  freeShippingOver: 2500,             // الشحن مجاناً لو الطلب تخطى هذا المبلغ
  // المقاسات بالسنتيمتر والأسعار بالجنيه المصري
  sizes: [
    { id: 's',  label: '20×30', w: 20, h: 30, price: 450 },
    { id: 'm',  label: '30×45', w: 30, h: 45, price: 750 },
    { id: 'l',  label: '40×60', w: 40, h: 60, price: 1200 },
    { id: 'xl', label: '50×75', w: 50, h: 75, price: 1800 }
  ]
};

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

// قائمة اللوحات الجاهزة
let POSTERS = [
  { id: 1, kind: 'pyramids',  title: 'ليل الأهرامات',      cat: 'مصر' },
  { id: 2, kind: 'moon',      title: 'القمر الذهبي',       cat: 'فضاء' },
  { id: 3, kind: 'mountains', title: 'جبال الفجر',        cat: 'طبيعة' },
  { id: 4, kind: 'deco',      title: 'أقواس الآرت ديكو',   cat: 'تجريدي' },
  { id: 5, kind: 'city',      title: 'مدينة بعد الغروب',   cat: 'مدن' },
  { id: 6, kind: 'calli',     title: 'جمال',             cat: 'مصر' },
  { id: 7, kind: 'desert',    title: 'كثبان الصحراء',     cat: 'طبيعة' },
  { id: 8, kind: 'waves',     title: 'خطوط الموج',        cat: 'تجريدي' }
];
let CATS = ['الكل', ...new Set(POSTERS.map(p => p.cat))];

/* ---------- إدارة الحالة (State) ---------- */
let cart = [];
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

/* ---------- قسم الهيرو والمعرض ---------- */
$('#heroArt').innerHTML = artSvg('moon', 'لوحة القمر الذهبي');
$('#footWa').textContent = SHOP.whatsapp;

function segHTML(items, cur, attr) {
  return items.map(i => `<button type="button" ${attr}="${i.id}" aria-pressed="${i.id === cur}">${i.html}</button>`).join('');
}

function renderFilters() {
  $('#filters').innerHTML = CATS.map(c => `<button type="button" data-cat="${c}" aria-pressed="${c === st.filter}">${c}</button>`).join('');
}

function renderGrid() {
  const list = POSTERS.filter(p => st.filter === 'الكل' || p.cat === st.filter);
  const defaultSz = (SHOP.sizes[0] && SHOP.sizes[0].id) || 'm';
  $('#grid').innerHTML = list.map(p => {
    const cur = st.sizes[p.id] || defaultSz;
    const szObj = sizeOf(cur) || SHOP.sizes[0] || { price: 0 };
    const artContent = p.image_url 
      ? `<img src="${p.image_url}" alt="${esc(p.title)}" style="width:100%;height:100%;object-fit:cover;">` 
      : (p.kind ? artSvg(p.kind, p.title) : artSvg('moon', p.title));
    return `<article class="card" data-id="${p.id}">
      <div class="plate"><div class="art">${artContent}</div></div>
      <div class="meta">
        <div><h3>${esc(p.title)}</h3><span class="cat">${esc(p.cat)}</span></div>
        <div class="seg" role="group" aria-label="المقاس">${segHTML(SHOP.sizes.map(s => ({ id: s.id, html: `<bdi>${s.label}</bdi>` })), cur, 'data-size')}</div>
        <div class="buy">
          <div class="price num"><span data-p>${egp(szObj.price)}</span></div>
          <button class="btn sm" type="button" data-add>ضيف للسلة</button>
        </div>
      </div>
    </article>`;
  }).join('');
}

$('#filters').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  st.filter = b.dataset.cat;
  renderFilters();
  renderGrid();
});

$('#grid').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  const id = card.dataset.id, p = POSTERS.find(x => String(x.id) === String(id));
  if (!p) return;
  const sb = e.target.closest('[data-size]');
  if (sb) {
    st.sizes[id] = sb.dataset.size;
    $$('[data-size]', card).forEach(b => b.setAttribute('aria-pressed', b === sb));
    const szObj = sizeOf(sb.dataset.size) || SHOP.sizes[0];
    $('[data-p]', card).textContent = egp(szObj ? szObj.price : 0);
    return;
  }
  if (e.target.closest('[data-add]')) {
    const defaultSz = (SHOP.sizes[0] && SHOP.sizes[0].id) || 'm';
    const sz = sizeOf(st.sizes[id] || defaultSz) || SHOP.sizes[0];
    addItem({
      key: `g-${id}-${sz.id}`,
      title: p.title,
      sub: `${sz.label} سم`,
      price: sz.price,
      kind: p.kind,
      img: p.image_url,
      custom: false
    });
  }
});

/* ---------- قسم الطباعة المخصصة (اطبع صورتك) ---------- */
const C = { size: 'm', orient: 'p', fit: 'cover', finish: 'لامع', url: null, w: 0, h: 0, name: '' };
$('#cSize').innerHTML = segHTML(SHOP.sizes.map(s => ({ id: s.id, html: `<bdi>${s.label}</bdi>` })), C.size, 'data-v');

function renderCustom() {
  const sz = sizeOf(C.size), pw = C.orient === 'p' ? sz.w : sz.h, ph = C.orient === 'p' ? sz.h : sz.w;
  const art = $('#cArt');
  art.style.aspectRatio = `${pw} / ${ph}`;
  $('#cPlate').style.setProperty('--pw', C.orient === 'p' ? '340px' : '470px');
  art.style.setProperty('--fit', C.fit);

  if (C.url) {
    if (!art.firstElementChild || art.firstElementChild.tagName !== 'IMG') {
      art.innerHTML = '<img alt="معاينة صورتك على اللوحة">';
    }
    const im = art.firstElementChild;
    if (im.getAttribute('src') !== C.url) im.src = C.url;
  } else if (!art.firstElementChild || art.firstElementChild.tagName !== 'svg') {
    art.innerHTML = artSvg('mountains', 'مثال توضيحي');
  }

  $('#cPrice').textContent = egp(sz.price);
  $('#cAdd').disabled = !C.url;
  $('#cTag').textContent = C.url ? `${pw}×${ph} سم — ${C.finish}` : 'مثال توضيحي — صورتك هتظهر هنا بنفس شكل اللوحة.';

  const q = $('#quality'), qt = $('#qText');
  q.className = 'q';
  if (!C.url) {
    qt.textContent = 'ارفع صورة عشان نقيّم جودتها للمقاس.';
    return;
  }
  const needW = (pw / 2.54) * 150, needH = (ph / 2.54) * 150, ratio = Math.min(C.w / needW, C.h / needH);
  if (ratio >= 1) {
    q.classList.add('ok');
    qt.textContent = `جودة ممتازة للمقاس ده (${C.w}×${C.h} بكسل).`;
  } else if (ratio >= 0.6) {
    q.classList.add('warn');
    qt.textContent = `جودة مقبولة (${C.w}×${C.h} بكسل). هتبان أحسن في مقاس أصغر.`;
  } else {
    q.classList.add('bad');
    qt.textContent = `الصورة صغيرة للمقاس ده (${C.w}×${C.h} بكسل) وممكن تطلع مش واضحة. جرّب مقاس أصغر أو صورة أكبر.`;
  }
}

function bindSeg(sel, key) {
  $(sel).addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    C[key] = b.dataset.v;
    $$('button', $(sel)).forEach(x => x.setAttribute('aria-pressed', x === b));
    renderCustom();
  });
}
bindSeg('#cSize', 'size');
bindSeg('#cOrient', 'orient');
bindSeg('#cFit', 'fit');
bindSeg('#cFinish', 'finish');

function loadCustom(file) {
  if (!file) return;
  // التحقق من نوع الملف (صور فقط)
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff'];
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|tiff?)$/i.test(file.name);
  if (!isImage) {
    toast('نوع الملف غير مدعوم، اختار ملف صورة (JPG, PNG, WebP, TIFF)');
    return;
  }
  // التحقق من الحجم الأقصى (50 ميجابايت كحد أقصى لدقة الطباعة)
  const MAX_CUSTOM_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_CUSTOM_SIZE) {
    toast('حجم الصورة كبير جداً (الحد الأقصى 50 ميجابايت)');
    return;
  }
  if (C.url) {
    try { URL.revokeObjectURL(C.url); } catch (e) {}
  }
  C.file = file; // الاحتفاظ بملف الصورة لرفعه للتخزين الخاص
  const url = URL.createObjectURL(file), im = new Image();
  im.onload = () => {
    C.url = url;
    C.w = im.naturalWidth;
    C.h = im.naturalHeight;
    C.name = file.name;
    $('#dropTitle').textContent = file.name;
    $('#dropSub').textContent = 'اضغط عشان تغيّر الصورة';
    renderCustom();
  };
  im.onerror = () => toast('مقدرناش نفتح الصورة دي، جرّب صورة تانية');
  im.src = url;
}

$('#customFile').addEventListener('change', e => loadCustom(e.target.files[0]));
const drop = $('#drop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => loadCustom(e.dataTransfer.files[0]));

$('#cAdd').addEventListener('click', () => {
  if (!C.url) return;
  const sz = sizeOf(C.size), pw = C.orient === 'p' ? sz.w : sz.h, ph = C.orient === 'p' ? sz.h : sz.w;
  addItem({
    key: 'c-' + Date.now(),
    title: 'لوحة بصورتك',
    sub: `${pw}×${ph} سم — ${C.finish}`,
    price: sz.price,
    img: C.url,
    file: C.file,
    orientation: C.orient,
    fit: C.fit,
    finish: C.finish,
    custom: true
  });
});

/* ---------- إدارة السلة (Shopping Cart) ---------- */
function addItem(it) {
  const ex = cart.find(c => c.key === it.key);
  if (ex) ex.qty++;
  else cart.push({ ...it, qty: 1 });
  renderCart();
  toast('اتضافت للسلة');
  const b = $('#badge');
  if (b.animate) {
    b.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 260 });
  }
}

const subtotal = () => cart.reduce((a, i) => a + i.price * i.qty, 0);
const shipping = () => cart.length && subtotal() < SHOP.freeShippingOver ? SHOP.shipping : 0;
const total = () => subtotal() + shipping();

function totalsHTML() {
  const s = shipping();
  return `<div><span>المجموع</span><span class="num">${egp(subtotal())}</span></div>
          <div><span>الشحن</span><span class="num">${s ? egp(s) : 'ببلاش'}</span></div>
          <div class="grand"><span>الإجمالي</span><span class="num">${egp(total())}</span></div>`;
}

function renderCart() {
  $('#badge').textContent = cart.reduce((a, i) => a + i.qty, 0);
  const list = $('#cartList');
  if (!cart.length) {
    list.innerHTML = '<div class="empty"><p>السلة فاضية لسه.</p><button class="btn ghost sm" type="button" id="emptyGo">شوف التشكيلة</button></div>';
    $('#cartTotals').innerHTML = '';
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
    $('#cartTotals').innerHTML = totalsHTML();
  }
  $('#coTotals').innerHTML = totalsHTML();
  updateAmtHint();
  renderFoot();
}

$('#cartList').addEventListener('click', e => {
  if (e.target.id === 'emptyGo') {
    closeDrawer();
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
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
  renderCart();
});

/* ---------- التحكم في نافذة السلة والخطوات ---------- */
let step = 'cart', lastFocus = null;

function openDrawer() {
  lastFocus = document.activeElement;
  $('#drawer').inert = false;
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#drawer').classList.add('open');
  $('#scrim').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#closeCart').focus(), 50);
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

$('#openCart').addEventListener('click', () => {
  if ($('#navDrawer') && $('#navDrawer').classList.contains('open')) closeNavMenu();
  setStep(step === 'done' ? 'cart' : step);
  openDrawer();
});
$('#closeCart').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('#drawer') && $('#drawer').classList.contains('open')) closeDrawer();
    if ($('#navDrawer') && $('#navDrawer').classList.contains('open')) closeNavMenu();
  }
});

$('#backShop').addEventListener('click', () => {
  cart = [];
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
$('#fGov').innerHTML = '<option value="">اختار المحافظة</option>' + GOVS.map(g => `<option>${g}</option>`).join('');

function payMethod() {
  return ($('input[name="pay"]:checked') || {}).value || 'instapay';
}

function renderPay() {
  const w = payMethod() === 'wallet';
  $('#payHow').textContent = w ? 'حوّل على رقم محفظة كاش ده:' : 'حوّل على إنستا باي على العنوان ده:';
  $('#payNum').textContent = w ? SHOP.wallet : SHOP.instapay;
}
$$('input[name="pay"]').forEach(r => r.addEventListener('change', renderPay));
renderPay();

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
  if (h) h.textContent = cart.length ? `الإجمالي المطلوب: ${egp(total())}` : '';
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

  if (!cart.length) errs.push(['fName', 'السلة فاضية.']);
  if (name.length < 3) errs.push(['fName', 'اكتب الاسم بالكامل (3 حروف على الأقل).']);
  if (!/^01[0125]\d{8}$/.test(phone)) errs.push(['fPhone', 'رقم الموبايل لازم يكون 11 رقم مصري صحيح ويبدأ بـ 01.']);
  if (!gov) errs.push(['fGov', 'اختار المحافظة.']);
  if (addr.length < 6) errs.push(['fAddr', 'اكتب العنوان بالتفصيل (الشارع والمنطقة).']);
  if (!(amt > 0)) errs.push(['fAmount', 'اكتب المبلغ اللي حوّلته.']);
  else if (amt < total()) errs.push(['fAmount', `المبلغ أقل من الإجمالي (${egp(total())}).`]);
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
  const order = {
    no: 'PST-' + String(Math.floor(1000 + Math.random() * 9000)),
    name,
    phone,
    gov,
    addr,
    pay: payMethod(),
    amount: amt,
    total: total(),
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

      // 3. إدخال الطلب في جدول orders (INSERT فقط مسموح للزائر)
      const { error: orderErr } = await supabaseClient
        .from('orders')
        .insert([{
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
          status: 'pending'
        }]);

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

  // 2. تفعيل زر كلّم خدمة العملاء على واتساب
  const waBtn = $('#waOrderBtn');
  if (waBtn) {
    const waMsg = encodeURIComponent(
      `مرحباً بوستيرا، قمت بطلب جديد عبر المتجر:\n\n` +
      `📌 رقم الطلب: ${order.no}\n` +
      `👤 الاسم: ${order.name}\n` +
      `📱 الموبايل: ${order.phone}\n` +
      `📍 المحافظة: ${order.gov}\n` +
      `🏠 العنوان: ${order.addr}\n` +
      `💳 طريقة الدفع: ${order.pay === 'instapay' ? 'إنستا باي' : 'محفظة كاش'}\n` +
      `💵 المبلغ المحوّل: ${egp(order.amount)}\n` +
      `💰 إجمالي الطلب: ${egp(order.total)}\n\n` +
      `🖼️ البنود:\n${order.items.map(it => `• ${it.title} (${it.sub}) × ${it.qty}`).join('\n')}\n\n` +
      `✅ تم رفع إيصال التحويل بنجاح في الموقع للمراجعة.`
    );
    waBtn.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}?text=${waMsg}`;
    waBtn.textContent = 'كلّم خدمة العملاء على واتساب 💬';
    waBtn.style.display = 'inline-flex';
  }

  try {
    sessionStorage.setItem('postera_last_order', String(Date.now()));
  } catch (e) {}
  cart = [];
  renderCart();
  $('#ordNo').textContent = order.no;
  setStep('done');
}

/* ---------- إرسال تنبيه بريد إلكتروني للإدارة عند طلب جديد ---------- */
async function sendAdminNotification(order) {
  const adminUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'admin.html';
  const targetEmail = SHOP.notification_email || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.notificationEmail) || 'admin@postera.com';
  const apiKey = SHOP.resend_api_key || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.resendApiKey);
  const webhookUrl = SHOP.email_webhook_url || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.emailWebhookUrl);

  const subject = `🔔 طلب جديد في بوستيرا: [${order.no}] - ${order.name} (${egp(order.total)})`;
  const htmlBody = `
    <div dir="rtl" style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1c1a17;max-width:620px;margin:20px auto;padding:26px;border:1px solid #e2ddd1;border-radius:14px;background:#faf8f5;">
      <div style="border-bottom:2px solid #c9a45c;padding-bottom:12px;margin-bottom:18px;">
        <h2 style="color:#a47e32;margin:0 0 6px 0;font-size:22px;">وصلك طلب جديد في بوستيرا! 🎉</h2>
        <span style="color:#5f5a52;font-size:14px;">تم تسجيل الطلب في المتجر وهو بانتظار مراجعتك وتأكيده للطباعة.</span>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:15px;">
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;width:140px;">رقم الطلب:</td><td style="padding:10px 0;font-weight:bold;color:#a47e32;font-size:17px;">${order.no}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">اسم العميل:</td><td style="padding:10px 0;font-weight:bold;">${order.name}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">رقم الموبايل:</td><td style="padding:10px 0;"><a href="tel:${order.phone}" style="color:#a47e32;text-decoration:none;font-weight:bold;">${order.phone}</a></td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">المحافظة:</td><td style="padding:10px 0;">${order.gov}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">العنوان:</td><td style="padding:10px 0;">${order.addr}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">طريقة الدفع:</td><td style="padding:10px 0;">${order.pay === 'instapay' ? 'إنستا باي (InstaPay)' : 'محفظة كاش إلكترونية'}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">المبلغ المحوّل:</td><td style="padding:10px 0;font-weight:bold;">${egp(order.amount)}</td></tr>
        <tr style="border-bottom:1px solid #e2ddd1;"><td style="padding:10px 0;color:#5f5a52;">الإجمالي المطلوب:</td><td style="padding:10px 0;font-weight:bold;color:#1f7a48;font-size:18px;">${egp(order.total)}</td></tr>
      </table>

      <div style="background:#f1ece1;border-radius:10px;padding:14px;margin:18px 0;">
        <strong style="display:block;margin-bottom:6px;color:#7a5a1a;">📦 بنود الطلب:</strong>
        <ul style="margin:0;padding-inline-start:20px;font-size:14px;color:#333;">
          ${order.items.map(it => `<li><strong>${it.title}</strong> (${it.sub}) × ${it.qty} = ${egp(it.price * it.qty)}</li>`).join('')}
        </ul>
      </div>

      <div style="margin:26px 0;text-align:center;">
        <a href="${adminUrl}" style="background:linear-gradient(135deg,#e2c88a,#c9a45c);color:#1a1408;padding:12px 32px;text-decoration:none;border-radius:999px;font-weight:bold;font-size:16px;display:inline-block;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          🔍 فتح وفحص الطلب في لوحة الإدارة
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
      if ($('#footWa')) $('#footWa').textContent = SHOP.whatsapp;
      const revBtn = $('#reviewShareWa');
      if (revBtn && SHOP.whatsapp) {
        revBtn.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent('مرحباً بوستيرا، حابب أشارك رأيي وصورة اللوحة بعد التركيب 🖼️')}`;
      }
      const navWa = $('#navWhatsappLink');
      if (navWa && SHOP.whatsapp) {
        navWa.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}`;
      }
      renderPay();
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
      if (!sizeOf(C.size)) C.size = SHOP.sizes[0].id;
      $('#cSize').innerHTML = segHTML(SHOP.sizes.map(s => ({ id: s.id, html: `<bdi>${s.label}</bdi>` })), C.size, 'data-v');
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
      POSTERS = pData.map(p => ({
        id: p.id,
        kind: p.kind,
        title: p.title,
        cat: p.category,
        image_url: p.image_url
      }));
      CATS = ['الكل', ...new Set(POSTERS.map(p => p.cat))];
      if (!CATS.includes(st.filter)) st.filter = 'الكل';
      renderFilters();
      renderGrid();
    }
  } catch (e) {
    console.warn('تنبيه المزامنة مع Supabase (سيتم استخدام البيانات المحلية):', e);
  }
}

/* ---------- بدء التشغيل (Init) ---------- */
if ($('#footWa')) $('#footWa').textContent = SHOP.whatsapp;
const initRevBtn = $('#reviewShareWa');
if (initRevBtn && SHOP.whatsapp) {
  initRevBtn.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent('مرحباً بوستيرا، حابب أشارك رأيي وصورة اللوحة بعد التركيب 🖼️')}`;
}
const initNavWa = $('#navWhatsappLink');
if (initNavWa && SHOP.whatsapp) {
  initNavWa.href = `https://wa.me/20${SHOP.whatsapp.replace(/^0/, '')}`;
}
renderFilters();
renderGrid();
renderCustom();
renderCart();
setStep('cart');
syncWithSupabase();
