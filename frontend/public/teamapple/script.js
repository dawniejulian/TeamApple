const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

function getTokenPayload() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    mainNav.classList.toggle('is-open');
  });
}


const fallbackData = [
  {
    name: 'iPad Pro M4',
    category: 'ipad',
    badge: 'iPad',
    selling_price: 17000000,
    description: 'Layar Ultra Retina XDR, performa tinggi untuk design, edit, dan multitasking.',
    quantity_available: 5
  },
  {
    name: 'iPad Air M2',
    category: 'ipad',
    badge: 'iPad',
    selling_price: 10000000,
    description: 'Ringan, kencang, dan cocok untuk kuliah, kerja, maupun content planning.',
    quantity_available: 8
  },
  {
    name: 'iPhone 15 Pro Max',
    category: 'iphone',
    badge: 'iPhone',
    selling_price: 21000000,
    description: 'Kamera titanium premium dengan performa gaming kelas atas.',
    quantity_available: 4
  },
  {
    name: 'iPhone 13',
    category: 'iphone',
    badge: 'iPhone',
    selling_price: 10000000,
    description: 'Pilihan iPhone harian dengan baterai awet dan kamera jernih.',
    quantity_available: 6
  },
  {
    name: 'MacBook Air M3',
    category: 'macbook',
    badge: 'MacBook',
    selling_price: 16000000,
    description: 'Laptop tipis untuk kerja harian, tugas kampus, dan produktivitas fleksibel.',
    quantity_available: 6
  },
  {
    name: 'MacBook Pro M3',
    category: 'macbook',
    badge: 'MacBook',
    selling_price: 27000000,
    description: 'Pilihan untuk workflow berat seperti video editing dan coding intensif.',
    quantity_available: 2
  },
  {
    name: 'Apple Pencil & Aksesoris',
    category: 'accessories',
    badge: 'Aksesoris',
    selling_price: 1000000,
    description: 'Aksesoris pelengkap iPad/MacBook untuk setup kerja yang lebih nyaman.',
    quantity_available: 12
  },
];

let catalogData = [...fallbackData];

const catalogGrid = document.querySelector('#catalogGrid');
const catalogCount = document.querySelector('#catalogCount');
const chips = document.querySelectorAll('.chip');

function createCatalogCard(product) {
  let imgHtml = '';
  if (product.image_url) {
    const imgUrl = product.image_url.startsWith('http') 
      ? product.image_url 
      : product.image_url;
    imgHtml = `
      <div class="product-image-container" style="width: 100%; height: 160px; border-radius: 0.75rem; overflow: hidden; background: #071422; border: 1px solid rgba(152, 185, 230, 0.15); display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 0.8rem;">
        <img src="${imgUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='images/default-apple.png';">
      </div>
    `;
  } else {
    // Premium elegant glassmorphic placeholder with custom inline Apple SVG
    imgHtml = `
      <div class="product-image-container" style="width: 100%; height: 160px; border-radius: 0.75rem; overflow: hidden; background: linear-gradient(135deg, #0d2238 0%, #050d18 100%); border: 1px solid rgba(152, 185, 230, 0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; margin-bottom: 0.8rem;">
        <svg viewBox="0 0 170 170" width="50" height="50" style="fill: rgba(255,255,255,0.15);">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.84-14.36-5.9-2.92-2.28-6.74-6.85-11.48-13.68-7.53-11.02-12.95-22.65-16.27-34.89-3.32-12.24-4.98-23.71-4.98-34.41 0-15.66 3.82-28.4 11.45-38.2 7.63-9.8 17.22-14.77 28.77-14.9 6.2.13 12.65 2.1 19.36 5.92 6.7 3.82 11.73 5.73 15.07 5.73 3.12 0 7.82-1.78 14.1-5.35 6.29-3.56 12.1-5.33 17.44-5.33 14.28 0 25.13 5.07 32.55 15.2-11.7 7.07-17.41 16.73-17.15 29 0 9.8 3.56 18.05 10.7 24.77 7.13 6.7 15.72 10.22 25.77 10.54-3.18 9.38-7.7 18.66-13.56 27.84M119.22 19.25c0-7.63 2.7-14.89 8.1-20.77 5.6-6.08 12.23-9.12 20.08-9.12 0 .8.1 1.7.1 2.5-.2 7.4-2.9 14.45-8.2 20.4-5.7 6.4-12.6 9.6-20.08 9.6-.1-.9-.1-1.7-.1-2.61"/>
        </svg>
        <span style="font-size: 0.7rem; color: rgba(255,255,255,0.25); font-weight: 700; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">TeamApple.Hub</span>
      </div>
    `;
  }

  const stockText = product.quantity_available > 0 
    ? `<span style="color: #4ade80; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem;">🟢 Tersedia: ${product.quantity_available} unit</span>`
    : `<span style="color: #f87171; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem;">🔴 Stok Habis</span>`;

  // Display condition badge
  const conditionBadgeHtml = product.condition_name 
    ? `<span class="product-badge" style="border-color: rgba(84, 212, 255, 0.4); color: #8ad6ff; margin-left: 0.4rem;">${product.condition_name}</span>`
    : '';

  // Format price
  let priceDisplay = 'Hubungi Admin';
  if (product.selling_price && !isNaN(product.selling_price)) {
    priceDisplay = 'Rp ' + parseInt(product.selling_price).toLocaleString('id-ID');
  }

  // Social platforms
  let socialLinksHtml = '';
  if (product.social_links && typeof product.social_links === 'object') {
    const activePlatforms = Object.keys(product.social_links).filter(key => product.social_links[key]);
    if (activePlatforms.length > 0) {
      socialLinksHtml = `
        <div style="display: flex; gap: 0.4rem; margin-top: 0.6rem; flex-wrap: wrap;">
          ${activePlatforms.map(key => {
            let platformUrl = product.social_links[key];
            let platformColor = '#60a5fa';
            let platformLabel = key.toUpperCase();
            if (key === 'tokopedia') {
              platformColor = '#2ecc71';
              platformLabel = 'Tokopedia';
            } else if (key === 'instagram') {
              platformColor = '#e1306c';
              platformLabel = 'Instagram';
            } else if (key === 'shopee') {
              platformColor = '#fe5722';
              platformLabel = 'Shopee';
            } else if (key === 'tiktok') {
              platformColor = '#ffffff';
              platformLabel = 'TikTok';
            }
            return `
              <a href="${platformUrl}" target="_blank" rel="noreferrer" style="font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.5rem; border-radius: 6px; color: ${platformColor}; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                <span>${platformLabel}</span>
              </a>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  // Format specifications
  let specsHtml = '';
  if (product.specifications && typeof product.specifications === 'object') {
    const specs = product.specifications;
    const specList = [];
    if (specs.chip) specList.push(`<span>Chip: <strong>${specs.chip}</strong></span>`);
    if (specs.ram) specList.push(`<span>RAM: <strong>${specs.ram}</strong></span>`);
    if (specs.internal) specList.push(`<span>Memori: <strong>${specs.internal}</strong></span>`);
    if (specs.color) specList.push(`<span>Warna: <strong>${specs.color}</strong></span>`);
    if (specs.camera) specList.push(`<span>Kamera: <strong>${specs.camera}</strong></span>`);
    
    if (specList.length > 0) {
      specsHtml = `
        <div class="product-specs" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-top: 0.6rem; margin-bottom: 0.6rem; font-size: 0.75rem; color: #cbd5e1; font-family: 'Space Grotesk', sans-serif;">
          ${specList.map(item => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.3rem 0.5rem; border-radius: 6px; display: flex; align-items: center; justify-content: flex-start; gap: 0.25rem;">
              ${item}
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  return `
    <article class="product-card reveal in-view" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 440px;">
      <div>
        ${imgHtml}
        <div style="display: flex; align-items: center;">
          <span class="product-badge">${product.badge}</span>
          ${conditionBadgeHtml}
        </div>
        <h3 style="margin-top: 0.7rem; font-size: 1.25rem; font-weight: 700; color: #fff;">${product.name}</h3>
        ${specsHtml}
        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #94a3b8; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${product.description || 'Produk Apple berkualitas tinggi.'}</p>
      </div>
      <div style="margin-top: auto; padding-top: 1rem;">
        <p class="product-price" style="font-size: 1.2rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.5rem;">${priceDisplay}</p>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.7rem;">
          <a href="https://wa.me/6281229291435?text=Halo%20TeamApple,%20saya%20ingin%20tanya%20stok%20${encodeURIComponent(product.name)}" target="_blank" rel="noreferrer" style="font-size: 0.85rem; font-weight: 600; color: #60a5fa; text-decoration: none;">Tanya stok produk</a>
          ${stockText}
        </div>
        ${socialLinksHtml}
      </div>
    </article>
  `;
}

let activeCategory = 'all';

function renderCatalog(filter = null) {
  if (filter !== null) {
    activeCategory = filter;
  }
  
  if (!catalogGrid || !catalogCount) {
    return;
  }

  // Get select dropdown values
  const priceVal = document.querySelector('#filterPrice') ? document.querySelector('#filterPrice').value : 'all';
  const memoryVal = document.querySelector('#filterMemory') ? document.querySelector('#filterMemory').value : 'all';
  const chipVal = document.querySelector('#filterChip') ? document.querySelector('#filterChip').value : 'all';
  const condVal = document.querySelector('#filterCondition') ? document.querySelector('#filterCondition').value : 'all';

  const filtered = catalogData.filter((item) => {
    // 1. Category Filter
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }

    // 2. Price Filter
    const price = parseInt(item.selling_price) || 0;
    if (priceVal === '5m' && price >= 5000000) return false;
    if (priceVal === '15m' && (price < 5000000 || price > 15000000)) return false;
    if (priceVal === '25m' && (price < 15000000 || price > 25000000)) return false;
    if (priceVal === 'above' && price <= 25000000) return false;

    // Helper search string
    let specText = '';
    if (item.specifications && typeof item.specifications === 'object') {
      specText = ' ' + Object.values(item.specifications).filter(Boolean).join(' ');
    }
    const textToSearch = ((item.name || '') + ' ' + (item.description || '') + specText).toLowerCase();

    // 3. Memory Filter
    if (memoryVal !== 'all') {
      const match64 = textToSearch.includes('64gb') || textToSearch.includes('64 gb');
      const match128 = textToSearch.includes('128gb') || textToSearch.includes('128 gb');
      const match256 = textToSearch.includes('256gb') || textToSearch.includes('256 gb');
      const match512 = textToSearch.includes('512gb') || textToSearch.includes('512 gb');
      const match1tb = textToSearch.includes('1tb') || textToSearch.includes('1 tb') || textToSearch.includes('2tb') || textToSearch.includes('2 tb');

      if (memoryVal === '64' && !match64) return false;
      if (memoryVal === '128' && !match128) return false;
      if (memoryVal === '256' && !match256) return false;
      if (memoryVal === '512' && !match512) return false;
      if (memoryVal === '1tb' && !match1tb) return false;
    }

    // 4. Chip Filter
    if (chipVal !== 'all') {
      if (chipVal === 'm1' && !textToSearch.includes('m1')) return false;
      if (chipVal === 'm2' && !textToSearch.includes('m2')) return false;
      if (chipVal === 'm3' && !textToSearch.includes('m3')) return false;
      if (chipVal === 'm4' && !textToSearch.includes('m4')) return false;
      if (chipVal === 'a-series') {
        const hasA = textToSearch.includes('a10') || textToSearch.includes('a11') || textToSearch.includes('a12') || textToSearch.includes('a13') || textToSearch.includes('a14') || textToSearch.includes('a15') || textToSearch.includes('a16') || textToSearch.includes('a17') || textToSearch.includes('a18') || textToSearch.includes('17 pro') || textToSearch.includes('17pro') || textToSearch.includes('bionic') || textToSearch.includes('chip a');
        if (!hasA) return false;
      }
    }

    // 5. Condition Filter
    if (condVal !== 'all') {
      const isSecond = (item.condition_name || '').toLowerCase().includes('bekas') || 
                       (item.condition_name || '').toLowerCase().includes('second') || 
                       textToSearch.includes('second') || 
                       textToSearch.includes('bekas') || 
                       textToSearch.includes('ex i');
      
      const isBaru = (item.condition_name || '').toLowerCase().includes('baru') || 
                     (item.condition_name || '').toLowerCase().includes('bnib') || 
                     textToSearch.includes('bnib') || 
                     textToSearch.includes('baru') || 
                     textToSearch.includes('new');
                     
      if (condVal === 'baru' && !isBaru && isSecond) return false;
      if (condVal === 'second' && !isSecond) return false;
    }

    return true;
  });

  catalogGrid.innerHTML = filtered.map(createCatalogCard).join('');
  catalogCount.textContent = String(filtered.length);
}


async function loadProductsFromBackend() {
  try {
    let response;
    // 1. Try Same-Origin Nginx proxy path (safest, most robust)
    try {
      response = await fetch('/api/products/public/list');
    } catch (e) {
      console.warn('Same-Origin fetch failed, trying direct backend fallback...', e);
    }
    
    // 2. Direct backend host fallback if needed
    if (!response || !response.ok) {
      const apiBase = `${window.location.protocol}//${window.location.hostname}:5001`;
      response = await fetch(`${apiBase}/api/products/public/list`);
    }

    const resData = await response.json();
    if (resData.status === 'SUCCESS' && Array.isArray(resData.data) && resData.data.length > 0) {
      catalogData = resData.data.map(p => {
        const nameLower = p.name.toLowerCase();
        const catLower = (p.category_name || '').toLowerCase();
        
        let category = 'accessories';
        let badge = 'Aksesoris';
        
        if (nameLower.includes('ipad') || catLower.includes('ipad')) {
          category = 'ipad';
          badge = 'iPad';
        } else if (nameLower.includes('macbook') || nameLower.includes('mac') || catLower.includes('macbook') || catLower.includes('mac')) {
          category = 'macbook';
          badge = 'MacBook';
        } else if (nameLower.includes('iphone') || catLower.includes('iphone')) {
          category = 'iphone';
          badge = 'iPhone';
        }
        
        return {
          id: p.id,
          name: p.name,
          category: category,
          badge: badge,
          selling_price: p.selling_price,
          description: p.description,
          image_url: p.image_url,
          social_links: p.social_links,
          condition_name: p.condition_name,
          specifications: p.specifications,
          quantity_available: p.quantity_available || 0
        };
      });
      renderCatalog();
    }
  } catch (error) {
    console.error('Failed to load products from API, using fallback data', error);
  }
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const selectedFilter = chip.dataset.filter || 'all';

    chips.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });

    chip.classList.add('is-active');
    chip.setAttribute('aria-selected', 'true');
    renderCatalog(selectedFilter);
  });
});

// Bind Advanced Filter change events
['#filterPrice', '#filterMemory', '#filterChip', '#filterCondition'].forEach(id => {
  const el = document.querySelector(id);
  if (el) {
    el.addEventListener('change', () => {
      renderCatalog();
    });
  }
});

// Bind Reset Filters Button
const resetBtn = document.querySelector('#resetFiltersBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    ['#filterPrice', '#filterMemory', '#filterChip', '#filterCondition'].forEach(id => {
      const el = document.querySelector(id);
      if (el) el.value = 'all';
    });
    
    // Also reset active category tab to "all"
    activeCategory = 'all';
    chips.forEach((item) => {
      if (item.dataset.filter === 'all') {
        item.classList.add('is-active');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      }
    });
    
    renderCatalog();
  });
}

// Load first render from fallback, then fetch from API
renderCatalog();
loadProductsFromBackend();

const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealElements.forEach((element) => observer.observe(element));

const yearEl = document.querySelector('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
