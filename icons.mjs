// Line icons (24×24, stroke = currentColor). Used in pages and placeholder images.
const P = {
  chimney: '<path d="M9 3h6v6"/><path d="M9 9V3"/><path d="M4 15l5-6h6l5 6z"/><path d="M4 15h16v2H4z"/><path d="M8 20h.01M12 20h.01M16 20h.01"/>',
  hob: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="2.5"/><circle cx="15.5" cy="10" r="2.5"/><path d="M7 16h2M11 16h2M15 16h2"/>',
  heater: '<rect x="6" y="2" width="12" height="16" rx="5"/><path d="M9 18v3M15 18v3"/><circle cx="12" cy="8" r="1.6"/><path d="M10 13h4"/>',
  hood: '<path d="M3 2h18"/><path d="M12 2v3"/><rect x="8" y="5" width="8" height="12" rx="4"/><path d="M10 13h4"/><path d="M8 21h.01M12 21h.01M16 21h.01"/>',
  wave: '<path d="M2 12c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"/><path d="M2 17c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"/><path d="M12 3l5 5H7z"/>',
  team: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 14.5c3 0 6 2 6 5.5"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  van: '<path d="M2 7h11v9H2z"/><path d="M13 10h4l4 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  rupee: '<path d="M7 4h10M7 8h10M7 4c5 0 6.5 2 6.5 4S11 12 7 12l8 8"/>',
  spark: '<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3.5 3.5M15.5 15.5L19 19M5 19l3.5-3.5M15.5 8.5L19 5"/>',
  broom: '<path d="M19 3l-7 7"/><path d="M12 10l-6 2-3 9 9-3 2-6z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
};

export const WHATSAPP_PATH =
  'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2-.2-.2-.5-.3z';

export function icon(name, cls = 'ic', size = 24) {
  if (name === 'whatsapp')
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${WHATSAPP_PATH}"/></svg>`;
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

export const ICON_PATHS = P;
