import * as LucideIcons from 'lucide';

/**
 * Universal Icon Renderer for Opus Rentals
 * Converts Lucide icon names into clean inline SVGs
 * @param {string} name - PascalCase Lucide icon name (e.g., 'Search', 'Wrench', 'Building2')
 * @param {string} classes - Tailwind CSS classes for sizing and coloring (e.g., 'w-5 h-5 text-slate-700')
 * @param {object} attrs - Extra HTML attributes
 * @returns {string} - SVG string markup
 */
export function renderIcon(name, classes = 'w-5 h-5', attrs = {}) {
  if (!name) return `<span class="inline-block ${classes}"></span>`;
  
  // Normalize kebab-case or snake_case to PascalCase if needed
  let normalizedName = name;
  if (name.includes('-') || name.includes('_')) {
    normalizedName = name
      .split(/[-_]/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  } else if (name.charAt(0) === name.charAt(0).toLowerCase()) {
    normalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  }

  const iconNode = LucideIcons[normalizedName] || LucideIcons.icons?.[normalizedName] || LucideIcons[name] || LucideIcons['HelpCircle'];
  if (!iconNode) {
    return `<span class="inline-block ${classes}"></span>`;
  }

  let svg = null;
  try {
    if (typeof iconNode === 'function') {
      svg = iconNode();
    } else if (LucideIcons.createElement) {
      svg = LucideIcons.createElement(iconNode);
    }
  } catch (e) {
    // fallback
  }

  if (!svg) {
    return `<span class="inline-block ${classes}"></span>`;
  }

  if (classes) {
    classes.split(' ').filter(Boolean).forEach(cls => {
      svg.classList.add(cls);
    });
  }

  // Assign any optional attributes
  if (attrs && typeof attrs === 'object') {
    Object.entries(attrs).forEach(([key, val]) => {
      svg.setAttribute(key, val);
    });
  }

  return svg.outerHTML;
}

/**
 * Render the official Opus Rentals brand icon in Construction Safety Orange
 * @param {string} classes - Tailwind CSS size and styling classes
 */
export function renderToolRentMark(classes = 'w-9 h-9') {
  return `<img src="/assets/brand/logo.png" alt="Opus Rentals Logo" class="${classes} object-contain flex-shrink-0 select-none" onerror="this.onerror=null; this.src='/assets/brand/opus-logo-orange.svg'" />`;
}

export const renderOpusMark = renderToolRentMark;

/**
 * Render the official Opus Rentals horizontal banner in Construction Orange
 * @param {string} classes - Tailwind CSS size and styling classes
 */
export function renderOpusBanner(classes = 'h-9 w-auto') {
  return `<img src="/assets/brand/banner.png" alt="Opus Rentals" class="${classes} object-contain flex-shrink-0 select-none" onerror="this.onerror=null; this.src='/assets/brand/opus-banner-orange.svg'" />`;
}

/**
 * Render the full Opus Rentals brand mark + wordmark
 */
export function renderOpusBrand({
  markClass = 'w-9 h-9',
  titleClass = 'text-xl',
  showSubtitle = false,
  subtitleText = 'Maquinaria y Equipos para la Construcción'
} = {}) {
  return `
    <div class="flex items-center gap-2.5">
      <img src="/assets/brand/opus-logo-orange.svg" alt="Opus Rentals" class="${markClass} object-contain flex-shrink-0 select-none" />
      <div>
        <div class="${titleClass} font-black font-display tracking-tight text-[#1A1A1A] dark:text-white leading-none">
          OPUS <span class="text-[#FF7A00]">RENTALS</span>
        </div>
        ${showSubtitle ? `<p class="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-1 leading-tight">${subtitleText}</p>` : ''}
      </div>
    </div>
  `;
}

export const renderToolRentBrand = renderOpusBrand;

export default renderIcon;
