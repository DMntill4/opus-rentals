import api from '../api/client.js';
import bannerOpusImg from '../assets/bannerOpus.png';
import { formatCurrency } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { renderCardGridSkeleton } from '../components/system-states.js';
import { i18n } from '../utils/i18n.js';

export async function renderCatalogView() {
  const container = document.getElementById('app-content');
  if (!container) return;

  const isEn = i18n.getLang() === 'EN';

  // Read search query parameter from URL hash if present
  const hash = window.location.hash || '';
  const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  const initialSearchParam = searchParams.get('q') || '';

  // Local state
  let selectedCategory = 'cat-all';
  let selectedStatus = 'ALL'; // ALL, AVAILABLE, RENTED, MAINTENANCE
  let searchQuery = initialSearchParam;
  let minPrice = 0;
  let maxPrice = 10000000;
  let sortBy = 'relevant';

  let allTools = [];
  let categories = [];

  try {
    const [toolsData, catsData] = await Promise.all([
      api.get('/tools'),
      api.get('/categories')
    ]);
    allTools = toolsData || [];
    categories = catsData || [];
  } catch (e) {
    console.error('Error loading catalog data', e);
  }

  // Filter computation
  function getFilteredTools() {
    let filtered = [...allTools];

    if (selectedCategory && selectedCategory !== 'cat-all') {
      filtered = filtered.filter(t => String(t.categoryId) === String(selectedCategory));
    }

    if (selectedStatus === 'AVAILABLE') {
      filtered = filtered.filter(t => t.status === 'AVAILABLE');
    } else if (selectedStatus === 'RENTED') {
      filtered = filtered.filter(t => t.status === 'RENTED');
    } else if (selectedStatus === 'MAINTENANCE') {
      filtered = filtered.filter(t => t.status === 'MAINTENANCE');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.categoryName?.toLowerCase().includes(q) ||
        t.brand?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    filtered = filtered.filter(t => (t.dailyPrice || 0) >= minPrice && (t.dailyPrice || 0) <= maxPrice);

    if (sortBy === 'price-asc') filtered.sort((a, b) => a.dailyPrice - b.dailyPrice);
    if (sortBy === 'price-desc') filtered.sort((a, b) => b.dailyPrice - a.dailyPrice);

    return filtered;
  }

  // Initial full shell render: Clean, Elegant, Industrial
  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        <!-- Opus Rentals Hero Banner: Azul Oscuro + Gris Acero + Blanco -->
        <div class="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[290px] md:min-h-[300px] flex items-center shadow-lg bg-gradient-to-br from-[#0c1e33] via-[#132e4f] to-[#1c3f68] select-none border border-slate-700/60">
          
          <!-- Subtle Architectural Blueprint Grid Overlay (echoes bannerOpus drafting lines) -->
          <div class="absolute inset-0 opacity-15 pointer-events-none" style="background-image: linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px); background-size: 32px 32px;"></div>
          
          <!-- Diagonal geometric accent glow -->
          <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

          <div class="relative z-10 w-full p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <!-- Left: Hero Text & Quick Search -->
            <div class="max-w-2xl space-y-3.5 flex-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e2238] border border-blue-900/60 text-slate-100 text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="tracking-wide uppercase text-[10px] font-mono font-bold">${isEn ? 'Certified Fleet in Colombia' : 'Flota Certificada · B2B Colombia'}</span>
              </div>

              <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-display leading-[1.15] text-white">
                <span>${isEn ? 'Heavy Machinery & Equipment Rental.' : 'Alquila la maquinaria pesada que necesitas.'}</span><br />
                <span class="text-blue-200 font-black">${isEn ? 'Zero friction. Enterprise grade.' : 'Sin comprarla. Para grandes obras en Colombia.'}</span>
              </h1>
              
              <p class="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-lg">
                ${isEn 
                  ? 'Excavators, compactors, telehandlers and generators with guaranteed maintenance, insurance and verified telematics.'
                  : 'Excavadoras, rodillos, minicargadores y plantas eléctricas con póliza todo riesgo SURA, mantenimiento preventivo al día y acta de entrega digital.'}
              </p>

              <!-- Quick Search Input inside Banner -->
              <div class="pt-1 flex flex-col sm:flex-row items-center gap-2 max-w-md">
                <div class="relative flex-1 w-full">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    ${renderIcon('Search', 'w-4 h-4')}
                  </span>
                  <input 
                    type="text" 
                    id="hero-quick-search"
                    value="${searchQuery}"
                    placeholder="${isEn ? 'Search CAT 320, Bobcat, 150 kVA...' : 'Buscar excavadora, rodillo, Bobcat, generador...'}" 
                    class="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 focus:border-[#132e4f] rounded-xl text-xs placeholder-slate-400 focus:outline-none shadow-md font-medium" 
                  />
                </div>
                <button id="btn-hero-search" class="w-full sm:w-auto py-2.5 px-5 text-xs font-bold rounded-xl text-white bg-[#0a1c33] hover:bg-black border border-white/20 transition-all cursor-pointer whitespace-nowrap shadow-sm">
                  ${isEn ? 'Search' : 'Buscar'}
                </button>
              </div>

              <!-- Trust Metrics Micro-Pills -->
              <div class="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-300 font-medium">
                <span class="inline-flex items-center gap-1 bg-[#0a1c33] border border-blue-900/60 px-2.5 py-1 rounded-lg">
                  <span class="text-emerald-400">✓</span> Póliza Todo Riesgo SURA
                </span>
                <span class="inline-flex items-center gap-1 bg-[#0a1c33] border border-blue-900/60 px-2.5 py-1 rounded-lg">
                  <span class="text-blue-300">✓</span> Telemetría GPS en Vivo
                </span>
                <span class="inline-flex items-center gap-1 bg-[#0a1c33] border border-blue-900/60 px-2.5 py-1 rounded-lg">
                  <span class="text-slate-300">✓</span> Despacho Inmediato en Patio
                </span>
              </div>
            </div>

            <!-- Right: Official Opus Rentals Banner Showcase Card -->
            <div class="hidden lg:flex flex-col items-center justify-center flex-shrink-0 w-80">
              <div class="w-full bg-white rounded-2xl shadow-2xl p-4 border border-slate-200/80 hover:scale-[1.02] transition-transform duration-300">
                <img 
                  src="${bannerOpusImg}" 
                  alt="Opus Rentals" 
                  class="w-full h-auto object-contain select-none" 
                />
                <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span class="flex items-center gap-1 font-semibold text-[#132e4f]">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Operaciones 24/7
                  </span>
                  <span>NIT 901.884.219-5</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Horizontal Category Pills Bar with Smooth Navigation Arrows -->
        <div class="relative flex items-center group/pills mb-2">
          <!-- Left Arrow Button -->
          <button 
            id="cat-scroll-left" 
            class="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#132e4f] dark:hover:text-white hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all z-10 flex-shrink-0 mr-1.5 sm:mr-2 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed active:scale-90"
            aria-label="Desplazar categorías hacia la izquierda"
            title="Anterior"
          >
            ${renderIcon('ChevronLeft', 'w-4 h-4')}
          </button>

          <!-- Scrollable Track with no scrollbar -->
          <div 
            class="flex-1 flex items-center gap-2 overflow-x-auto scroll-smooth py-1 no-scrollbar select-none" 
            id="category-pills-row"
          >
            ${categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return `
                <button 
                  class="cat-pill-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-[#132e4f] dark:bg-blue-600 border-[#132e4f] dark:border-blue-500 text-white shadow-xs' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }"
                  data-cat-id="${cat.id}"
                >
                  ${renderIcon(cat.icon || 'Truck', `w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`)}
                  <span>${cat.name}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Right Arrow Button -->
          <button 
            id="cat-scroll-right" 
            class="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#132e4f] dark:hover:text-white hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all z-10 flex-shrink-0 ml-1.5 sm:ml-2 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed active:scale-90"
            aria-label="Desplazar categorías hacia la derecha"
            title="Siguiente"
          >
            ${renderIcon('ChevronRight', 'w-4 h-4')}
          </button>
        </div>

        <!-- Filter Bar & Sort Controls -->
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors duration-200">
          
          <!-- Status Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span class="text-xs font-bold text-slate-500 mr-1.5 hidden sm:inline">${i18n.t('filterStatusLabel')}</span>
            <button 
              type="button" 
              class="status-quick-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === 'ALL' 
                  ? 'bg-[#132e4f] text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
              data-status="ALL"
            >
              ${i18n.t('filterAll')}
            </button>
            <button 
              type="button" 
              class="status-quick-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === 'AVAILABLE' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
              data-status="AVAILABLE"
            >
              ${i18n.t('filterAvailable')}
            </button>
            <button 
              type="button" 
              class="status-quick-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === 'RENTED' 
                  ? 'bg-slate-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
              data-status="RENTED"
            >
              ${i18n.t('filterRented')}
            </button>
            <button 
              type="button" 
              class="status-quick-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === 'MAINTENANCE' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }"
              data-status="MAINTENANCE"
            >
              ${i18n.t('filterMaintenance')}
            </button>
          </div>

          <!-- Right: Search in Catalog & Sort -->
          <div class="flex items-center gap-3">
            <div class="relative flex-1 sm:w-56">
              <input 
                type="text" 
                id="search-in-results" 
                value="${searchQuery}" 
                placeholder="${i18n.t('searchInCatalogPlaceholder')}" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#132e4f] transition-all font-medium" 
              />
              <div class="absolute left-3 top-2 text-slate-400 pointer-events-none">
                ${renderIcon('Search', 'w-3.5 h-3.5')}
              </div>
            </div>

            <!-- Sort dropdown -->
            <div class="relative">
              <select id="sort-select" class="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#132e4f] transition-colors appearance-none cursor-pointer">
                <option value="relevant" ${sortBy === 'relevant' ? 'selected' : ''}>${i18n.t('sortRelevant')}</option>
                <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>${i18n.t('sortPriceAsc')}</option>
                <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>${i18n.t('sortPriceDesc')}</option>
              </select>
              <div class="absolute right-2.5 top-2 pointer-events-none text-slate-400">
                ${renderIcon('ChevronDown', 'w-3.5 h-3.5')}
              </div>
            </div>
          </div>

        </div>

        <!-- Counter & Results Status -->
        <div class="flex items-center justify-between text-xs text-slate-500 px-1">
          <span id="results-counter" class="font-bold text-slate-800">
            ${isEn ? 'Loading fleet...' : 'Cargando unidades...'}
          </span>
          <button id="btn-reset-filters" class="text-[#132e4f] hover:underline font-semibold cursor-pointer">
            ${i18n.t('btnResetFilters')}
          </button>
        </div>

        <!-- Product Cards Grid Container -->
        <div id="catalog-products-container" class="min-h-[450px]">
          ${renderCardGridSkeleton(6)}
        </div>

      </div>
    </div>
  `;

  const productsContainer = container.querySelector('#catalog-products-container');
  const resultsCounter = container.querySelector('#results-counter');
  const catRow = container.querySelector('#category-pills-row');
  const btnLeft = container.querySelector('#cat-scroll-left');
  const btnRight = container.querySelector('#cat-scroll-right');
  const searchInput = container.querySelector('#search-in-results');
  const heroSearchInput = container.querySelector('#hero-quick-search');
  const btnHeroSearch = container.querySelector('#btn-hero-search');
  const sortSelect = container.querySelector('#sort-select');
  const btnReset = container.querySelector('#btn-reset-filters');

  // Carousel navigation
  const updateArrowStates = () => {
    if (!catRow || !btnLeft || !btnRight) return;
    btnLeft.disabled = catRow.scrollLeft <= 5;
    btnRight.disabled = Math.ceil(catRow.scrollLeft + catRow.clientWidth) >= catRow.scrollWidth - 5;
  };

  if (btnLeft && catRow) {
    btnLeft.addEventListener('click', () => {
      catRow.scrollBy({ left: -260, behavior: 'smooth' });
      setTimeout(updateArrowStates, 300);
    });
  }

  if (btnRight && catRow) {
    btnRight.addEventListener('click', () => {
      catRow.scrollBy({ left: 260, behavior: 'smooth' });
      setTimeout(updateArrowStates, 300);
    });
  }

  if (catRow) {
    catRow.addEventListener('scroll', updateArrowStates, { passive: true });
    setTimeout(updateArrowStates, 50);
  }

  // Reactive Card Renderer
  function renderProductsGrid() {
    const filtered = getFilteredTools();
    if (resultsCounter) {
      resultsCounter.textContent = `${filtered.length} ${filtered.length === 1 ? i18n.t('unitFound') : i18n.t('unitsFound')}`;
    }

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs animate-in fade-in duration-200">
          <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
            ${renderIcon('Search', 'w-6 h-6')}
          </div>
          <h3 class="text-base font-bold text-slate-900 font-display">
            ${i18n.t('emptyTitle')}
          </h3>
          <p class="text-xs text-slate-500">
            ${i18n.t('emptySubtitle')}
          </p>
          <button id="btn-clear-empty-filters" class="btn-primary !py-2 !px-4 text-xs font-semibold">
            ${i18n.t('btnEmptyReset')}
          </button>
        </div>
      `;

      productsContainer.querySelector('#btn-clear-empty-filters')?.addEventListener('click', () => {
        resetAllFilters();
      });
      return;
    }

    // Render Cards Grid
    productsContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in" id="tools-cards-grid">
        ${filtered.map(tool => {
          const isAvailable = tool.status === 'AVAILABLE';
          const isRented = tool.status === 'RENTED';
          const primaryImg = tool.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800';

          const statusBadge = isAvailable
            ? `<span class="badge-disponible">${i18n.t('filterAvailable')}</span>`
            : isRented
            ? `<span class="badge-alquilada">${i18n.t('filterRented')}</span>`
            : `<span class="badge-mantenimiento">${i18n.t('filterMaintenance')}</span>`;

          return `
            <div class="tr-card flex flex-col justify-between overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-200">
              
              <div>
                <!-- Image Container with Aspect Ratio -->
                <div class="relative h-48 bg-slate-100 overflow-hidden cursor-pointer tool-card-trigger border-b border-slate-100" data-id="${tool.id}">
                  <img 
                    src="${primaryImg}" 
                    alt="${tool.name}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none" 
                    loading="lazy"
                    data-original-url="${primaryImg}"
                    onerror="window.ToolRentCacheShield?.handleImageError(this, '${primaryImg}', '${tool.categoryName || ''}', '${tool.name.replace(/'/g, "\\'")}')"
                  />
                  
                  <!-- Top Status Badge -->
                  <div class="absolute top-2.5 right-2.5 z-10 shadow-xs">
                    ${statusBadge}
                  </div>
                </div>

                <!-- Tool Content -->
                <div class="p-4 space-y-2">
                  <div class="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>${tool.categoryName || 'Construcción'}</span>
                    <span class="font-normal text-slate-400">${tool.brand || ''}</span>
                  </div>

                  <h3 class="font-bold text-slate-900 text-sm leading-snug cursor-pointer hover:text-[#132e4f] transition-colors tool-card-trigger line-clamp-2" data-id="${tool.id}">
                    ${tool.name}
                  </h3>

                  <p class="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                    ${tool.description || 'Equipo especializado para frentes de obra y proyectos de infraestructura.'}
                  </p>
                </div>
              </div>

              <!-- Card Footer: Daily Price & Action Button -->
              <div class="p-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">${i18n.t('cardDailyRate')}</div>
                  <div class="text-sm font-bold text-slate-900">
                    ${formatCurrency(tool.dailyPrice)}
                  </div>
                </div>

                <div>
                  <button class="btn-tool-details btn-primary !py-2 !px-3 text-xs" data-id="${tool.id}">
                    ${isAvailable ? i18n.t('cardRent') : i18n.t('cardDetails')}
                  </button>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;

    // Click events to open product detail view
    productsContainer.querySelectorAll('.btn-tool-details, .tool-card-trigger').forEach(el => {
      el.addEventListener('click', () => {
        window.location.hash = `#/product/${el.dataset.id}`;
      });
    });
  }

  // Filter Reset Function
  function resetAllFilters() {
    selectedCategory = 'cat-all';
    selectedStatus = 'ALL';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (heroSearchInput) heroSearchInput.value = '';
    updateCategoryButtonsUI();
    updateStatusButtonsUI();
    renderProductsGrid();
  }

  function updateCategoryButtonsUI() {
    container.querySelectorAll('.cat-pill-btn').forEach(btn => {
      const catId = btn.dataset.catId;
      const isActive = catId === selectedCategory;
      if (isActive) {
        btn.className = 'cat-pill-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 cursor-pointer bg-[#132e4f] dark:bg-blue-600 border-[#132e4f] dark:border-blue-500 text-white shadow-xs';
      } else {
        btn.className = 'cat-pill-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800';
      }
    });
  }

  function updateStatusButtonsUI() {
    container.querySelectorAll('.status-quick-btn').forEach(btn => {
      const st = btn.dataset.status;
      const isActive = st === selectedStatus;
      if (isActive) {
        btn.className = 'status-quick-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[#132e4f] dark:bg-blue-600 text-white shadow-xs';
      } else {
        btn.className = 'status-quick-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700';
      }
    });
  }

  // Event Listeners
  container.querySelectorAll('.cat-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.catId;
      updateCategoryButtonsUI();
      renderProductsGrid();
    });
  });

  container.querySelectorAll('.status-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedStatus = btn.dataset.status;
      updateStatusButtonsUI();
      renderProductsGrid();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (heroSearchInput) heroSearchInput.value = searchQuery;
    renderProductsGrid();
  });

  const performHeroSearch = () => {
    if (heroSearchInput) {
      searchQuery = heroSearchInput.value;
      if (searchInput) searchInput.value = searchQuery;
      renderProductsGrid();
      // Smooth scroll down to results
      const resultsEl = container.querySelector('#tools-cards-grid') || container.querySelector('#catalog-products-container');
      resultsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  btnHeroSearch?.addEventListener('click', performHeroSearch);
  heroSearchInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performHeroSearch();
  });

  sortSelect?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderProductsGrid();
  });

  btnReset?.addEventListener('click', resetAllFilters);

  // Initial render of cards
  renderProductsGrid();
}
