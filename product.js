/**
 * ==========================================================================
 * بوستيرا | POSTERA - منطق صفحة المنتج المخصصة (Product Details Page - PDP)
 * مستوحاة بالكامل من صفحات منتجات ديسبليت (Displate Product Page)
 * ==========================================================================
 */

// مزامنة المقاسات فوراً من التخزين المحلي لتفادي أي وميض بالأسعار
try {
  const localSizesInit = localStorage.getItem('postera_sizes');
  if (localSizesInit && window.SHOP) {
    const parsedSizes = JSON.parse(localSizesInit);
    if (Array.isArray(parsedSizes) && parsedSizes.length) window.SHOP.sizes = parsedSizes;
  }
} catch (e) {}

let pdpProduct = null;
let pdpSize = 'm';
let pdpFinish = 'مطفي';
let pdpQty = 1;

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const idFromParam = params.get('id');
  if (idFromParam) return idFromParam;

  // دعم الروابط النظيفة /product/123 أو /displate/123
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && (pathParts[0] === 'product' || pathParts[0] === 'displate')) {
    return pathParts[1];
  }
  return null;
}

function initPDP() {
  const prodId = getProductIdFromUrl();
  
  // البحث عن المنتج في POSTERS
  pdpProduct = POSTERS.find(p => String(p.id) === String(prodId));
  if (!pdpProduct && POSTERS.length > 0) {
    pdpProduct = POSTERS[0]; // منتج افتراضي إذا لم يتم العثور على المعرف
  }

  if (!pdpProduct) return;

  pdpSize = (SHOP.sizes[0] && SHOP.sizes[0].id) || 'm';
  pdpFinish = 'مطفي';
  pdpQty = 1;

  // 1. تحديث عنوان الصفحة وفتات الخبز (Breadcrumbs)
  document.title = `${pdpProduct.title} | بوستيرا POSTERA`;
  const bTitle = document.getElementById('pdpBreadTitle');
  if (bTitle) bTitle.textContent = pdpProduct.title;
  const bCat = document.getElementById('pdpBreadCat');
  if (bCat) {
    bCat.textContent = pdpProduct.cat || 'مجموعة خاصة';
    bCat.href = `index.html?cat=${encodeURIComponent(pdpProduct.cat || 'الكل')}#gallery`;
  }

  // 2. تحديث بيانات المنتج الرئيسية
  const pTitle = document.getElementById('pdpTitle');
  if (pTitle) pTitle.textContent = pdpProduct.title;
  const pCat = document.getElementById('pdpCategory');
  if (pCat) pCat.textContent = pdpProduct.cat || 'مجموعة بوستيرا';
  const pTag = document.getElementById('pdpTag');
  if (pTag) pTag.textContent = pdpProduct.tag || 'إصدار أصلي 2026';
  const pDesc = document.getElementById('pdpDesc');
  if (pDesc) pDesc.textContent = pdpProduct.desc || '';

  // 3. تحديث الصور المصغرة والصورة الكبيرة
  const mainImg = document.getElementById('pdpMainImg');
  const tFront = document.getElementById('thumbFront');
  const tAngle = document.getElementById('thumbAngle');
  const defaultFallback = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80';
  const imgSrc = pdpProduct.image_url || defaultFallback;

  if (mainImg) {
    mainImg.src = imgSrc;
    mainImg.alt = pdpProduct.title;
  }
  if (tFront) tFront.src = imgSrc;
  if (tAngle) tAngle.src = imgSrc;

  // 4. توليد أزرار المقاسات
  renderPDPSizes();

  // 5. تطبيق اللمسة والسعر
  setPdpFinish(pdpFinish);
  updatePdpPrice();

  // 6. عرض اللوحات المقترحة في الأسفل
  renderPDPRelated();

  // 7. ربط أحداث الصفحة
  bindPDPEvents();
}

function renderPDPSizes() {
  const container = document.getElementById('pdpSizesContainer');
  if (!container) return;

  container.innerHTML = SHOP.sizes.map(s => {
    const isSel = s.id === pdpSize;
    return `
      <button type="button" class="p-3 rounded-xl border text-center transition-all cursor-pointer ${
        isSel 
          ? 'border-2 border-brandBlue bg-blue-50/60 shadow-xs text-brandBlue font-bold' 
          : 'border-warm-gray bg-surface-container-lowest text-primary hover:border-primary font-medium'
      }" data-size="${s.id}">
        <span class="block text-xs uppercase tracking-wider font-mono">${s.id.toUpperCase()}</span>
        <span class="block text-sm font-bold mt-0.5"><bdi>${s.label}</bdi> سم</span>
        <span class="block text-[11px] mt-1 ${isSel ? 'text-brandBlue font-bold' : 'text-outline'}">${egp(s.price)}</span>
      </button>
    `;
  }).join('');
}

function updatePdpPrice() {
  const sz = sizeOf(pdpSize) || SHOP.sizes[0] || { price: 750, label: '30×45', w: 30, h: 45 };
  const unitPrice = sz.price;
  const totalPrice = unitPrice * pdpQty;

  const priceEl = document.getElementById('pdpPrice');
  if (priceEl) priceEl.textContent = egp(totalPrice);

  const btnTotalEl = document.getElementById('pdpBtnTotal');
  if (btnTotalEl) btnTotalEl.textContent = `(${egp(totalPrice)})`;

  const cornerSize = document.getElementById('pdpCornerSize');
  if (cornerSize) cornerSize.textContent = `${sz.label} سم • صلب 1.2 مم`;

  const sizeDetail = document.getElementById('pdpSizeDetailLabel');
  if (sizeDetail) sizeDetail.textContent = `${sz.w || 30} × ${sz.h || 45} سم`;

  const qtyVal = document.getElementById('pdpQtyVal');
  if (qtyVal) qtyVal.textContent = pdpQty;

  // تجهيز رابط واتساب المباشر
  const waBtn = document.getElementById('pdpWhatsAppBtn');
  if (waBtn && pdpProduct) {
    const msg = `مرحباً بوستيرا، أود طلب بوستر "${pdpProduct.title}" معدني مصفح:\n- المقاس: ${sz.label} سم (${pdpSize.toUpperCase()})\n- اللمسة: ${pdpFinish}\n- الكمية: ${pdpQty}\n- الإجمالي: ${egp(totalPrice)}\n- الرابط: ${window.location.href}`;
    const phone = SHOP.whatsapp || '01000000000';
    const waNum = phone.startsWith('0') ? '2' + phone : phone;
    waBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
  }
}

function setPdpFinish(finish) {
  pdpFinish = finish;
  const isGloss = finish === 'لامع';
  const glossOverlay = document.getElementById('pdpGlossOverlay');
  const matteOverlay = document.getElementById('pdpMatteOverlay');
  const btnMatte = document.getElementById('btnFinishMatte');
  const btnGloss = document.getElementById('btnFinishGloss');

  if (glossOverlay) glossOverlay.style.opacity = isGloss ? '0.85' : '0';
  if (matteOverlay) matteOverlay.style.opacity = isGloss ? '0' : '1';

  if (btnMatte && btnGloss) {
    if (isGloss) {
      btnGloss.className = 'p-3.5 rounded-xl border-2 text-right transition-all cursor-pointer finish-btn border-brandBlue bg-blue-50/60 text-brandBlue shadow-xs font-bold';
      btnMatte.className = 'p-3.5 rounded-xl border-2 text-right transition-all cursor-pointer finish-btn border-warm-gray bg-surface-container-lowest text-primary hover:border-primary';
    } else {
      btnMatte.className = 'p-3.5 rounded-xl border-2 text-right transition-all cursor-pointer finish-btn border-brandBlue bg-blue-50/60 text-brandBlue shadow-xs font-bold';
      btnGloss.className = 'p-3.5 rounded-xl border-2 text-right transition-all cursor-pointer finish-btn border-warm-gray bg-surface-container-lowest text-primary hover:border-primary';
    }
  }

  updatePdpPrice();
}

function renderPDPRelated() {
  const container = document.getElementById('pdpRelatedGrid');
  if (!container || !pdpProduct) return;

  const related = POSTERS.filter(p => String(p.id) !== String(pdpProduct.id)).slice(0, 4);
  
  container.innerHTML = related.map(p => {
    const artContent = p.image_url 
      ? `<img src="${p.image_url}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none">` 
      : (p.kind ? artSvg(p.kind, p.title) : artSvg('moon', p.title));
    
    return `
      <a href="product?id=${p.id}" class="poster-card group relative aspect-[2/3] w-full rounded-lg overflow-hidden poster-shadow cursor-pointer select-none transition-all duration-300 bg-surface-container block" title="${esc(p.title)}">
        <div class="w-full h-full">${artContent}</div>
        <div class="absolute inset-0 pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(0,0,0,0.5)] rounded-lg"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-pure-black/35 via-transparent to-canvas-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 bg-pure-black/20 backdrop-blur-[2px]">
          <span class="px-4 py-2 bg-pure-black/90 text-canvas-white text-xs font-bold rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
            <span>عرض اللوحة</span>
          </span>
        </div>
      </a>
    `;
  }).join('');
}

function bindPDPEvents() {
  // اختيار اللمسة
  document.getElementById('btnFinishMatte')?.addEventListener('click', () => setPdpFinish('مطفي'));
  document.getElementById('btnFinishGloss')?.addEventListener('click', () => setPdpFinish('لامع'));

  // اختيار المقاس
  document.getElementById('pdpSizesContainer')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-size]');
    if (!btn) return;
    pdpSize = btn.dataset.size;
    renderPDPSizes();
    updatePdpPrice();
  });

  // التحكم بالكمية
  document.getElementById('pdpQtyMinus')?.addEventListener('click', () => {
    if (pdpQty > 1) {
      pdpQty--;
      updatePdpPrice();
    }
  });

  document.getElementById('pdpQtyPlus')?.addEventListener('click', () => {
    pdpQty++;
    updatePdpPrice();
  });

  // زر الإضافة إلى السلة
  document.getElementById('pdpAddToCartBtn')?.addEventListener('click', () => {
    if (!pdpProduct) return;
    const sz = sizeOf(pdpSize) || SHOP.sizes[0] || { id: 'm', label: '30×45', price: 750 };
    
    for (let i = 0; i < pdpQty; i++) {
      addItem({
        key: `g-${pdpProduct.id}-${sz.id}-${pdpFinish}`,
        title: pdpProduct.title,
        sub: `${sz.label} سم • ${pdpFinish}`,
        price: sz.price,
        kind: pdpProduct.kind,
        img: pdpProduct.image_url,
        custom: false
      });
    }

    toast(`تمت إضافة "${pdpProduct.title}" إلى سلتك بنجاح ✨`);
    openCart();
  });

  // التبديل بين زوايا المعاينة (Thumbnails)
  document.getElementById('pdpThumbs')?.addEventListener('click', e => {
    const btn = e.target.closest('.thumb-btn');
    if (!btn) return;
    
    document.querySelectorAll('.thumb-btn').forEach(b => {
      b.classList.remove('active', 'border-primary');
      b.classList.add('border-transparent');
    });
    btn.classList.add('active', 'border-primary');
    btn.classList.remove('border-transparent');

    const view = btn.dataset.view;
    const wrap = document.getElementById('pdpPlateWrap');
    if (!wrap) return;

    if (view === 'angle') {
      wrap.style.transform = 'perspective(900px) rotateY(-18deg) rotateX(8deg) scale(0.96)';
    } else if (view === 'room1' || view === 'room2') {
      wrap.style.transform = 'perspective(900px) scale(0.92)';
    } else {
      wrap.style.transform = 'none';
    }
  });

  // تكبير الصورة وعرض التفاصيل بدقة عالية (Lightbox)
  document.getElementById('pdpZoomBtn')?.addEventListener('click', () => {
    if (!pdpProduct) return;
    const src = pdpProduct.image_url;
    if (!src) return;
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out';
    lightbox.innerHTML = `
      <div class="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
        <img src="${src}" alt="${esc(pdpProduct.title)}" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl">
        <button class="absolute -top-12 right-0 text-white text-2xl font-bold bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer">✕</button>
      </div>
    `;
    lightbox.addEventListener('click', () => lightbox.remove());
    document.body.appendChild(lightbox);
  });

  // المفضلة في صفحة المنتج (PDP Wishlist)
  const updatePdpWishlistUI = () => {
    if (!pdpProduct) return;
    try {
      const raw = localStorage.getItem('postera_wishlist');
      const list = raw ? JSON.parse(raw) : [];
      const isFav = list.includes(String(pdpProduct.id));
      const icon = document.getElementById('pdpWishlistIcon');
      const btn = document.getElementById('pdpWishlistBtn');
      if (icon) icon.textContent = isFav ? 'favorite' : 'favorite_border';
      if (btn) {
        btn.classList.toggle('text-red-500', isFav);
        btn.classList.toggle('border-red-300', isFav);
        btn.classList.toggle('bg-red-50', isFav);
      }
    } catch (e) {}
  };

  updatePdpWishlistUI();

  document.getElementById('pdpWishlistBtn')?.addEventListener('click', () => {
    if (!pdpProduct) return;
    try {
      const raw = localStorage.getItem('postera_wishlist');
      let list = raw ? JSON.parse(raw) : [];
      const sId = String(pdpProduct.id);
      const idx = list.indexOf(sId);
      if (idx > -1) {
        list.splice(idx, 1);
        toast(`تمت إزالة "${pdpProduct.title}" من المفضلة`);
      } else {
        list.push(sId);
        toast(`تمت إضافة "${pdpProduct.title}" إلى مفضلتك ❤️`);
      }
      localStorage.setItem('postera_wishlist', JSON.stringify(list));
      updatePdpWishlistUI();
    } catch (e) {}
  });
}

// بدء التشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initPDP();
});

// إعادة المزامنة فور اكتمال جلب البيانات المحدثة من Supabase
window.addEventListener('postera:products-synced', () => {
  initPDP();
});
