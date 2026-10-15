import api from '../api/client.js';
import { formatCurrency } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { renderCardGridSkeleton } from '../components/system-states.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';
import { i18n } from '../utils/i18n.js';

export async function renderCatalogView() {
  const container = document.getElementById('app-content');
  if (!container) return;

  const isEn = i18n.getLang() === 'EN';

  // Read search & filter parameters from URL
  const hash = window.location.hash || '';
  const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  const initialSearchParam = searchParams.get('q') || '';
  const initialCategoryParam = searchParams.get('category') || 'cat-all';
  const initialProviderParam = searchParams.get('provider') || '';

  // Local state
  let selectedCategory = initialCategoryParam;
  let selectedStatus = 'ALL'; // ALL, AVAILABLE, RENTED
  let selectedProvider = initialProviderParam;
  let searchQuery = initialSearchParam;
  let minPrice = 0;
  let maxPrice = 10000000;
  let sortBy = 'relevant';
  let selectedBrand = 'ALL';

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

  // Extract unique brands for filter
  const brands = Array.from(new Set(allTools.map(t => t.brand).filter(Boolean)));

  // Filter computation
  function getFilteredTools() {
    let filtered = [...allTools];

    if (selectedProvider) {
      filtered = filtered.filter(t => 
        String(t.providerId) === String(selectedProvider) || 
        String(t.provider?.id) === String(selectedProvider) ||
        (t.providerCompanyName && t.providerCompanyName.toLowerCase().includes(selectedProvider.toLowerCase())) ||
        (t.provider?.name && t.provider.name.toLowerCase().includes(selectedProvider.toLowerCase()))
      );
    }

    if (selectedCategory && selectedCategory !== 'cat-all') {
      filtered = filtered.filter(t => String(t.categoryId) === String(selectedCategory));
    }

    if (selectedStatus === 'AVAILABLE') {
      filtered = filtered.filter(t => t.status === 'AVAILABLE');
    } else if (selectedStatus === 'RENTED') {
      filtered = filtered.filter(t => t.status === 'RENTED');
    }

    if (selectedBrand !== 'ALL') {
      filtered = filtered.filter(t => t.brand === selectedBrand);
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

  // Render E-Commerce 2-Column Layout (Mercado Libre / Amazon standard)
  container.innerHTML = `
    <div class="bg-[#f5f5f5] dark:bg-slate-950 min-h-screen pb-16 text-slate-800 dark:text-slate-100 font-sans">
      
      <!-- Top Breadcrumb & Active Filter Bar -->
      <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 shadow-2xs">
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <nav class="flex items-center gap-2 text-slate-500">
            <a href="#/home" class="hover:text-blue-600 transition-colors">Inicio</a>
            <span>/</span>
            <span class="text-slate-900 dark:text-white font-bold">Catálogo de Maquinaria</span>
            ${selectedProvider ? `<span>/</span><span class="text-blue-600 font-bold">${selectedProvider}</span>` : ''}
          </nav>
          <span id="top-results-counter" class="text-slate-500 font-mono">
            ${allTools.length} equipos en total
          </span>
        </div>
      </div>

      <!-- Main Layout: 2 Columns (Left: Filters | Right: Results) -->
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- ========================================================================= -->
          <!-- LEFT SIDEBAR: FILTERS (Mercado Libre style) -->
          <!-- ========================================================================= -->
          <aside class="lg:col-span-3 space-y-6">
            
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-6">
              
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Filtros de Búsqueda
                </h3>
                <button id="btn-reset-filters" class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer">
                  Limpiar
                </button>
              </div>

              <!-- Filter 1: Categories -->
              <div class="space-y-2.5">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white">Categoría</h4>
                <div class="space-y-1 max-h-56 overflow-y-auto no-scrollbar pr-1 text-xs">
                  <button 
                    class="filter-cat-btn w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${selectedCategory === 'cat-all' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}"
                    data-cat-id="cat-all"
                  >
                    <span>Todas las categorías</span>
                    <span class="text-slate-400 font-mono">${allTools.length}</span>
                  </button>
                  ${categories.map(cat => {
                    const count = allTools.filter(t => t.categoryId === cat.id).length;
                    const isSelected = String(selectedCategory) === String(cat.id);
                    return `
                      <button 
                        class="filter-cat-btn w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}"
                        data-cat-id="${cat.id}"
                      >
                        <span class="truncate">${cat.name}</span>
                        <span class="text-slate-400 font-mono text-[11px]">${count}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Filter 2: Availability (Disponible / En Obra) -->
              <div class="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white">Disponibilidad en Patio</h4>
                <div class="space-y-1.5 text-xs">
                  <label class="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input type="radio" name="filter-status" value="ALL" ${selectedStatus === 'ALL' ? 'checked' : ''} class="status-radio text-blue-600" />
                    <span>Todos los equipos</span>
                  </label>
                  <label class="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input type="radio" name="filter-status" value="AVAILABLE" ${selectedStatus === 'AVAILABLE' ? 'checked' : ''} class="status-radio text-blue-600" />
                    <span class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Disponibles hoy</span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Filter 3: Marcas -->
              ${brands.length > 0 ? `
                <div class="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Marca de Fabricante</h4>
                  <div class="space-y-1 max-h-40 overflow-y-auto no-scrollbar text-xs">
                    <button 
                      class="filter-brand-btn w-full text-left px-2 py-1 rounded flex items-center justify-between ${selectedBrand === 'ALL' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}"
                      data-brand="ALL"
                    >
                      <span>Todas las marcas</span>
                    </button>
                    ${brands.map(b => `
                      <button 
                        class="filter-brand-btn w-full text-left px-2 py-1 rounded flex items-center justify-between ${selectedBrand === b ? 'text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}"
                        data-brand="${b}"
                      >
                        <span>${b}</span>
                        <span class="text-slate-400 font-mono text-[10px]">${allTools.filter(t => t.brand === b).length}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Filter 4: Price Range -->
              <div class="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white">Precio por Día (COP)</h4>
                <div class="flex items-center gap-2">
                  <input 
                    type="number" 
                    id="filter-min-price" 
                    placeholder="Mín" 
                    value="${minPrice > 0 ? minPrice : ''}"
                    class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                  />
                  <span class="text-slate-400">-</span>
                  <input 
                    type="number" 
                    id="filter-max-price" 
                    placeholder="Máx" 
                    value="${maxPrice < 10000000 ? maxPrice : ''}"
                    class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                  />
                  <button id="btn-apply-price" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer">
                    ${renderIcon('ChevronRight', 'w-3.5 h-3.5')}
                  </button>
                </div>
              </div>

            </div>

          </aside>

          <!-- ========================================================================= -->
          <!-- RIGHT COLUMN: RESULTS & SORTING (Mercado Libre / Amazon standard) -->
          <!-- ========================================================================= -->
          <main class="lg:col-span-9 space-y-4">
            
            <!-- Controls Bar: Title, Count & Sort -->
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  ${selectedCategory !== 'cat-all' 
                    ? (categories.find(c => String(c.id) === String(selectedCategory))?.name || 'Maquinaria')
                    : 'Catálogo de Maquinaria y Equipos'}
                </h1>
                <p id="results-count-label" class="text-xs text-slate-500 font-mono mt-0.5">
                  Cargando resultados...
                </p>
              </div>

              <!-- Sort Dropdown -->
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-500 font-medium whitespace-nowrap">Ordenar por:</span>
                <div class="relative">
                  <select id="sort-select" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer">
                    <option value="relevant" ${sortBy === 'relevant' ? 'selected' : ''}>Más Relevantes</option>
                    <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Menor Precio</option>
                    <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Mayor Precio</option>
                  </select>
                  <div class="absolute right-2.5 top-2.5 pointer-events-none text-slate-400">
                    ${renderIcon('ChevronDown', 'w-3.5 h-3.5')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Cards Grid -->
            <div id="catalog-products-container" class="min-h-[450px]">
              ${renderCardGridSkeleton(6)}
            </div>

          </main>

        </div>
      </div>

    </div>
  `;

  const productsContainer = container.querySelector('#catalog-products-container');
  const resultsCountLabel = container.querySelector('#results-count-label');
  const topResultsCounter = container.querySelector('#top-results-counter');
  const sortSelect = container.querySelector('#sort-select');

  // Render Cards
  function renderCards() {
    const filtered = getFilteredTools();

    if (resultsCountLabel) {
      resultsCountLabel.textContent = `${filtered.length} equipos disponibles para alquiler`;
    }
    if (topResultsCounter) {
      topResultsCounter.textContent = `${filtered.length} equipos listados`;
    }

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            ${renderIcon('Search', 'w-8 h-8')}
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">No encontramos maquinaria con esos filtros</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">Revisa los términos de búsqueda o restablece los filtros para ver toda la flota disponible.</p>
          <button id="btn-empty-reset" class="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer">
            Restablecer todos los filtros
          </button>
        </div>
      `;
      productsContainer.querySelector('#btn-empty-reset')?.addEventListener('click', resetFilters);
      return;
    }

    productsContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        ${filtered.map(tool => {
          const isAvailable = tool.status === 'AVAILABLE';
          const primaryImg = resolveToolImageUrl(tool);

          return `
            <div 
              class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
              onclick="window.location.hash='#/product/${tool.id}'"
            >
              <div>
                <!-- Image Container with clean frame -->
                <div class="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                  <img 
                    src="${primaryImg}" 
                    alt="${tool.name}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none" 
                    loading="lazy"
                    onerror="window.ToolRentCacheShield?.handleImageError(this, '${primaryImg}', '${tool.categoryName || ''}', '${tool.name.replace(/'/g, "\\'")}')"
                  />
                  
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                  }">
                    ${isAvailable ? 'Disponible Hoy' : 'En Obra'}
                  </span>

                  <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/95 text-slate-700 border border-slate-200 shadow-2xs">
                    ${tool.brand || 'CAT'}
                  </span>
                </div>

                <!-- Product Information -->
                <div class="p-4 space-y-1.5">
                  <div class="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    ${tool.categoryName || 'Construcción'}
                  </div>

                  <h3 class="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    ${tool.name}
                  </h3>

                  <p class="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                    ${tool.description || 'Equipo especializado con mantenimiento certificado y póliza todo riesgo.'}
                  </p>
                </div>
              </div>

              <!-- Footer: Price & Rent Action -->
              <div class="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">Tarifa por día</div>
                  <div class="text-base font-black text-slate-900 dark:text-white font-mono">
                    ${formatCurrency(tool.dailyPrice)}
                  </div>
                </div>

                <button class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs">
                  ${isAvailable ? 'Alquilar' : 'Ver Ficha'}
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function resetFilters() {
    selectedCategory = 'cat-all';
    selectedStatus = 'ALL';
    selectedProvider = '';
    selectedBrand = 'ALL';
    searchQuery = '';
    minPrice = 0;
    maxPrice = 10000000;
    sortBy = 'relevant';
    renderCatalogView();
  }

  // Event Listeners for Filters
  container.querySelectorAll('.filter-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.catId;
      container.querySelectorAll('.filter-cat-btn').forEach(b => {
        b.classList.remove('bg-blue-50', 'text-blue-600', 'font-bold');
      });
      btn.classList.add('bg-blue-50', 'text-blue-600', 'font-bold');
      renderCards();
    });
  });

  container.querySelectorAll('.status-radio').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      renderCards();
    });
  });

  container.querySelectorAll('.filter-brand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedBrand = btn.dataset.brand;
      container.querySelectorAll('.filter-brand-btn').forEach(b => {
        b.classList.remove('text-blue-600', 'font-bold');
      });
      btn.classList.add('text-blue-600', 'font-bold');
      renderCards();
    });
  });

  container.querySelector('#btn-apply-price')?.addEventListener('click', () => {
    const min = parseFloat(container.querySelector('#filter-min-price')?.value) || 0;
    const max = parseFloat(container.querySelector('#filter-max-price')?.value) || 10000000;
    minPrice = min;
    maxPrice = max;
    renderCards();
  });

  sortSelect?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderCards();
  });

  container.querySelector('#btn-reset-filters')?.addEventListener('click', resetFilters);

  // Initial render of cards
  renderCards();
}

export default renderCatalogView;
