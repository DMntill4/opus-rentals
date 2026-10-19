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

  // Resolve category object by ID or name/slug
  let activeCategoryObj = null;
  if (selectedCategory && selectedCategory !== 'cat-all') {
    const sCatLower = String(selectedCategory).toLowerCase().trim();
    activeCategoryObj = categories.find(c => 
      String(c.id) === sCatLower ||
      c.name.toLowerCase() === sCatLower ||
      c.name.toLowerCase().includes(sCatLower) ||
      sCatLower.includes(c.name.toLowerCase()) ||
      (c.name.toLowerCase().includes('demolicion') && sCatLower.includes('demol')) ||
      (c.name.toLowerCase().includes('excavac') && (sCatLower.includes('excav') || sCatLower.includes('retro'))) ||
      (c.name.toLowerCase().includes('concreto') && sCatLower.includes('concre')) ||
      (c.name.toLowerCase().includes('generac') && sCatLower.includes('generad')) ||
      (c.name.toLowerCase().includes('compres') && sCatLower.includes('compres')) ||
      (c.name.toLowerCase().includes('elevac') && sCatLower.includes('plataform')) ||
      (c.name.toLowerCase().includes('compactac') && sCatLower.includes('compact'))
    );
    if (activeCategoryObj) {
      selectedCategory = String(activeCategoryObj.id);
    }
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

  const initialFiltered = getFilteredTools();

  container.innerHTML = `
    <div class="bg-[#F4F5F7] min-h-screen pb-16 text-[#1A1A1A] font-sans">
      
      <!-- Top Breadcrumb & Status Bar -->
      <div class="bg-white border-b border-slate-200 py-3 shadow-2xs">
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <nav class="flex items-center gap-2 text-slate-500 font-medium flex-wrap">
            <a href="#/home" class="hover:text-[#FF7A00] transition-colors">Inicio</a>
            <span>/</span>
            <a href="#/catalog" class="hover:text-[#FF7A00] transition-colors font-bold ${selectedCategory === 'cat-all' ? 'text-slate-900' : 'text-slate-600'}">Catálogo de Maquinaria Pesada</a>
            ${selectedCategory !== 'cat-all' && activeCategoryObj ? `
              <span>/</span>
              <span class="anim-tag-enter inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100/90 text-[#FF7A00] font-black font-mono text-[11px] border border-orange-200 shadow-2xs">
                ${renderIcon(activeCategoryObj.icon || 'Hammer', 'w-3.5 h-3.5 text-[#FF7A00]')}
                <span>${activeCategoryObj.name}</span>
              </span>
            ` : ''}
            ${selectedProvider ? `<span>/</span><span class="text-amber-700 font-bold">${selectedProvider}</span>` : ''}
          </nav>
          <span id="top-results-counter" class="text-slate-500 font-mono font-bold whitespace-nowrap">
            ${initialFiltered.length} unidades listadas
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

            <!-- Active Category Filter Banner with clear button -->
            ${selectedCategory !== 'cat-all' && activeCategoryObj ? `
              <div class="anim-tag-enter bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white border-l-4 border-[#FF7A00] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    ${renderIcon(activeCategoryObj.icon || 'Hammer', 'w-5 h-5 text-white')}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-black uppercase tracking-wider font-mono text-[#FF7A00]">Rubro de Trabajo Activo</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-[#FF7A00]"></span>
                      <span class="text-xs font-mono font-bold text-slate-500">${initialFiltered.length} equipos certificados</span>
                    </div>
                    <h2 class="text-sm sm:text-base font-black text-slate-900">${activeCategoryObj.name}</h2>
                    ${activeCategoryObj.description ? `<p class="text-xs text-slate-600 line-clamp-1">${activeCategoryObj.description}</p>` : ''}
                  </div>
                </div>
                <button 
                  id="btn-banner-clear-cat" 
                  class="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#FF7A00] text-slate-700 hover:text-[#FF7A00] text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                >
                  <span>Ver toda la flota</span>
                  <span class="text-slate-400 group-hover:text-[#FF7A00] transition-colors font-mono font-black">&times;</span>
                </button>
              </div>
            ` : ''}

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
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        ${filtered.map((tool, idx) => {
          const isAvailable = tool.status === 'AVAILABLE';
          const primaryImg = resolveToolImageUrl(tool);
          const delayMs = Math.min(idx * 40, 320);

          return `
            <div 
              class="anim-card-enter bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-[#FF7A00]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              style="animation-delay: ${delayMs}ms;"
              onclick="window.location.hash='#/product/${tool.id}'"
            >
              <div>
                <!-- Image Container with solid background -->
                <div class="relative h-48 bg-slate-900 overflow-hidden border-b border-slate-100">
                  <img 
                    src="${primaryImg}" 
                    alt="${tool.name}" 
                    class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 select-none" 
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800';"
                  />
                  
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono shadow-sm ${
                    isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                  }">
                    ${isAvailable ? 'Disponible Hoy' : 'En Obra'}
                  </span>

                  <span class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#FF7A00] text-white shadow-xs">
                    ${tool.brand || 'CAT'}
                  </span>
                </div>

                <div class="p-4 space-y-1.5">
                  <div class="text-[10px] uppercase font-black text-slate-400 font-mono tracking-wider">
                    ${tool.categoryName || 'Construcción'}
                  </div>

                  <h3 class="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-[#FF7A00] transition-colors">
                    ${tool.name}
                  </h3>

                  <p class="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                    ${tool.description || 'Equipo pesado certificado con seguro SURA y telemetría activa.'}
                  </p>
                </div>
              </div>

              <!-- Footer: Price & Rent Action -->
              <div class="p-4 pt-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div class="text-[9px] text-slate-400 font-bold uppercase font-mono">Tarifa por día</div>
                  <div class="text-base font-black text-slate-900 font-mono">
                    ${formatCurrency(tool.dailyPrice)}
                  </div>
                </div>

                <button class="btn-primary !px-4 !py-2 text-xs font-black shadow-sm group-hover:bg-[#E56E00] transition-colors">
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
    window.location.hash = '#/catalog';
  }

  container.querySelectorAll('.filter-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.catId;
      if (catId === 'cat-all') {
        window.location.hash = '#/catalog';
      } else {
        window.location.hash = `#/catalog?category=${catId}`;
      }
    });
  });

  container.querySelector('#btn-banner-clear-cat')?.addEventListener('click', () => {
    window.location.hash = '#/catalog';
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
