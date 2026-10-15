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
  const iconNode = LucideIcons[name] || LucideIcons['HelpCircle'];
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
 * Render the official Opus Rentals brand icon using iconWebPageNoBg.png (helmet + O)
 * @param {string} classes - Tailwind CSS size and styling classes
 */
export function renderToolRentMark(classes = 'w-9 h-9') {
  return `<img src="/iconWebPageNoBg.png" alt="Opus Rentals Logo" class="${classes} object-contain flex-shrink-0 select-none" />`;
}

export const renderOpusMark = renderToolRentMark;

/**
 * Render the official Opus Rentals horizontal banner (bannerOpus.png)
 * @param {string} classes - Tailwind CSS size and styling classes
 */
export function renderOpusBanner(classes = 'h-9 w-auto') {
  return `<img src="/bannerOpus.png" alt="Opus Rentals" class="${classes} object-contain flex-shrink-0 select-none" />`;
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
      <img src="/iconWebPageNoBg.png" alt="Opus Rentals" class="${markClass} object-contain flex-shrink-0 select-none" />
      <div>
        <div class="${titleClass} font-black font-display tracking-tight text-[#132e4f] leading-none">
          Opus Rentals
        </div>
        ${showSubtitle ? `<p class="text-[10px] text-slate-500 mt-1 leading-tight">${subtitleText}</p>` : ''}
      </div>
    </div>
  `;
}

export const renderToolRentBrand = renderOpusBrand;

export default renderIcon;
