import api from '../api/client.js';
import { formatCurrency } from '../utils/formatters.js';
import { renderIcon } from '../utils/icons.js';
import { renderCardGridSkeleton } from '../components/system-states.js';
import { resolveToolImageUrl } from '../utils/tool-images.js';

export async function renderCatalogView() {
  const container = document.getElementById('app-content');
  if (!container) return;

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

  const brands = Array.from(new Set(allTools.map(t => t.brand).filter(Boolean)));

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

  container.innerHTML = `
    <div class="bg-[#F4F5F7] min-h-screen pb-16 text-[#1A1A1A] font-sans">
      
      <!-- Top Breadcrumb & Status Bar -->
      <div class="bg-white border-b border-slate-200 py-3 shadow-2xs">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <nav class="flex items-center gap-2 text-slate-500 font-medium">
            <a href="#/home" class="hover:text-amber-700 transition-colors">Inicio</a>
            <span>/</span>
            <span class="text-slate-900 font-bold">Catálogo de Maquinaria Pesada</span>
            ${selectedProvider ? `<span>/</span><span class="text-amber-700 font-bold">${selectedProvider}</span>` : ''}
          </nav>
          <span id="top-results-counter" class="text-slate-500 font-mono font-bold">
            ${allTools.length} unidades registradas
          </span>
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT SIDEBAR: FILTERS -->
          <aside class="lg:col-span-3 space-y-5">
            
            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
              
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  ${renderIcon('Filter', 'w-3.5 h-3.5 text-amber-600')} Filtros de Obra
                </h3>
                <button id="btn-reset-filters" class="text-xs text-amber-700 hover:underline font-bold cursor-pointer">
                  Limpiar
                </button>
              </div>

              <!-- Categories -->
              <div class="space-y-2">
                <h4 class="text-xs font-black text-slate-900 uppercase font-mono">Rubro de Trabajo</h4>
                <div class="space-y-1 max-h-56 overflow-y-auto no-scrollbar pr-1 text-xs">
                  <button 
                    class="filter-cat-btn w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${selectedCategory === 'cat-all' ? 'bg-[#FF7A00] text-white font-black shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
                    data-cat-id="cat-all"
                  >
                    <span>Toda la flota</span>
                    <span class="font-mono text-[11px]">${allTools.length}</span>
                  </button>
                  ${categories.map(cat => {
                    const count = allTools.filter(t => t.categoryId === cat.id).length;
                    const isSelected = String(selectedCategory) === String(cat.id);
                    return `
                      <button 
                        class="filter-cat-btn w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${isSelected ? 'bg-[#FF7A00] text-white font-black shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
                        data-cat-id="${cat.id}"
                      >
                        <span class="truncate">${cat.name}</span>
                        <span class="font-mono text-[11px]">${count}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Status: Disponibilidad Inmediata -->
              <div class="space-y-2 pt-3 border-t border-slate-100">
                <h4 class="text-xs font-black text-slate-900 uppercase font-mono">Disponibilidad en Patio</h4>
                <div class="space-y-1.5 text-xs font-semibold">
                  <label class="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input type="radio" name="filter-status" value="ALL" ${selectedStatus === 'ALL' ? 'checked' : ''} class="status-radio accent-[#FFB800]" />
                    <span>Todas las unidades</span>
                  </label>
                  <label class="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input type="radio" name="filter-status" value="AVAILABLE" ${selectedStatus === 'AVAILABLE' ? 'checked' : ''} class="status-radio accent-[#FFB800]" />
                    <span class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Disponibles hoy en patio</span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Marcas -->
              ${brands.length > 0 ? `
                <div class="space-y-2 pt-3 border-t border-slate-100">
                  <h4 class="text-xs font-black text-slate-900 uppercase font-mono">Fabricante</h4>
                  <div class="space-y-1 max-h-40 overflow-y-auto no-scrollbar text-xs">
                    <button 
                      class="filter-brand-btn w-full text-left px-2 py-1 rounded flex items-center justify-between font-semibold ${selectedBrand === 'ALL' ? 'text-amber-800 font-black' : 'text-slate-600 hover:bg-slate-100'}"
                      data-brand="ALL"
                    >
                      <span>Todas las marcas</span>
                    </button>
                    ${brands.map(b => `
                      <button 
                        class="filter-brand-btn w-full text-left px-2 py-1 rounded flex items-center justify-between font-semibold ${selectedBrand === b ? 'text-amber-800 font-black' : 'text-slate-600 hover:bg-slate-100'}"
                        data-brand="${b}"
                      >
                        <span>${b}</span>
                        <span class="text-slate-400 font-mono text-[10px]">${allTools.filter(t => t.brand === b).length}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Tarifa Diaria -->
              <div class="space-y-2 pt-3 border-t border-slate-100">
                <h4 class="text-xs font-black text-slate-900 uppercase font-mono">Tarifa Diaria (COP)</h4>
                <div class="flex items-center gap-2">
                  <input 
                    type="number" 
                    id="filter-min-price" 
                    placeholder="Mín" 
                    value="${minPrice > 0 ? minPrice : ''}"
                    class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#FFB800] font-mono font-bold"
                  />
                  <span class="text-slate-400">-</span>
                  <input 
                    type="number" 
                    id="filter-max-price" 
                    placeholder="Máx" 
                    value="${maxPrice < 10000000 ? maxPrice : ''}"
                    class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#FFB800] font-mono font-bold"
                  />
                  <button id="btn-apply-price" class="btn-primary !px-3 !py-1.5 text-xs">
                    ${renderIcon('ChevronRight', 'w-3.5 h-3.5')}
                  </button>
                </div>
              </div>

            </div>

          </aside>

          <!-- RIGHT COLUMN: RESULTS -->
          <main class="lg:col-span-9 space-y-4">
            
            <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 class="text-base sm:text-lg font-black text-slate-900">
                  ${selectedCategory !== 'cat-all' 
                    ? (categories.find(c => String(c.id) === String(selectedCategory))?.name || 'Maquinaria')
                    : 'Flota Pesada y Equipos de Construcción'}
                </h1>
                <p id="results-count-label" class="text-xs text-slate-500 font-mono mt-0.5">
                  Cargando inventario...
                </p>
              </div>

              <!-- Sort Dropdown -->
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-500 font-bold whitespace-nowrap">Ordenar por:</span>
                <div class="relative">
                  <select id="sort-select" class="bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FFB800] appearance-none cursor-pointer">
                    <option value="relevant" ${sortBy === 'relevant' ? 'selected' : ''}>Más Relevantes</option>
                    <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Menor Tarifa Diaria</option>
                    <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Mayor Tarifa Diaria</option>
                  </select>
                  <div class="absolute right-2.5 top-2.5 pointer-events-none text-slate-500">
                    ${renderIcon('ChevronDown', 'w-3.5 h-3.5')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Grid -->
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

  function renderCards() {
    const filtered = getFilteredTools();

    if (resultsCountLabel) {
      resultsCountLabel.textContent = `${filtered.length} equipos certificados para despacho`;
    }
    if (topResultsCounter) {
      topResultsCounter.textContent = `${filtered.length} unidades listadas`;
    }

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div class="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            ${renderIcon('Search', 'w-7 h-7')}
          </div>
          <h3 class="text-base font-black text-slate-900">No encontramos equipos con esos filtros</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto font-normal">Intenta ajustar el rango de precios o selecciona otra categoría de obra civil.</p>
          <button id="btn-empty-reset" class="btn-primary !px-5 !py-2.5 text-xs font-black">
            Ver Toda la Flota
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
              class="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-amber-300 transition-all duration-200 cursor-pointer group"
              onclick="window.location.hash='#/product/${tool.id}'"
            >
              <div>
                <!-- Image Container with solid background -->
                <div class="relative h-48 bg-slate-900 overflow-hidden border-b border-slate-100">
                  <img 
                    src="${primaryImg}" 
                    alt="${tool.name}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none" 
                    loading="lazy"
                  />
                  
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono ${
                    isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                  }">
                    ${isAvailable ? 'Disponible Hoy' : 'En Obra'}
                  </span>

                  <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#FFB800] text-slate-950">
                    ${tool.brand || 'CAT'}
                  </span>
                </div>

                <div class="p-4 space-y-1.5">
                  <div class="text-[10px] uppercase font-black text-slate-400 font-mono tracking-wider">
                    ${tool.categoryName || 'Construcción'}
                  </div>

                  <h3 class="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors">
                    ${tool.name}
                  </h3>

                  <p class="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                    ${tool.description || 'Equipo pesado certificado con seguro SURA y telemetría activa.'}
                  </p>
                </div>
              </div>

              <!-- Footer: Price & Rent Action -->
              <div class="p-4 pt-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div class="text-[9px] text-slate-400 font-bold uppercase font-mono">Tarifa por día</div>
                  <div class="text-base font-black text-slate-900 font-mono">
                    ${formatCurrency(tool.dailyPrice)}
                  </div>
                </div>

                <button class="btn-primary !px-3.5 !py-2 text-xs font-black shadow-xs">
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

  container.querySelectorAll('.filter-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.catId;
      container.querySelectorAll('.filter-cat-btn').forEach(b => {
        b.classList.remove('bg-[#FF7A00]', 'text-white', 'font-black', 'shadow-xs');
      });
      btn.classList.add('bg-[#FF7A00]', 'text-white', 'font-black', 'shadow-xs');
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
        b.classList.remove('text-amber-800', 'font-black');
      });
      btn.classList.add('text-amber-800', 'font-black');
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

  renderCards();
}

export default renderCatalogView;
