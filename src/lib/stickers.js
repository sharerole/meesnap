// MeeOpp-branded SVG sticker definitions.
// Each sticker has an inline SVG body (no outer <svg> tag) and a viewBox.
// We wrap it at render time for both React preview and canvas drawing.

export const STICKER_DEFS = [
  {
    id: 'meeopp-mark',
    label: 'MeeOpp',
    category: 'brand',
    viewBox: '0 0 100 100',
    body: `
      <circle cx="50" cy="50" r="48" fill="#BE0055"/>
      <circle cx="34" cy="45" r="11" fill="white"/>
      <circle cx="66" cy="45" r="11" fill="white"/>
      <circle cx="36" cy="47" r="5.5" fill="#BE0055"/>
      <circle cx="68" cy="47" r="5.5" fill="#BE0055"/>
      <circle cx="32" cy="42" r="2.5" fill="white"/>
      <circle cx="64" cy="42" r="2.5" fill="white"/>
      <path d="M33 63 Q50 76 67 63" stroke="white" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    `,
  },
  {
    id: 'bubble-meeopp',
    label: '"MeeOpp!"',
    category: 'brand',
    viewBox: '0 0 140 90',
    body: `
      <rect x="4" y="4" width="132" height="62" rx="18" fill="#BE0055"/>
      <rect x="4" y="4" width="132" height="62" rx="18" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.25"/>
      <polygon points="28,66 16,88 52,66" fill="#BE0055"/>
      <text x="70" y="40" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial Rounded MT Bold,Arial,sans-serif"
        font-weight="900" font-size="26" fill="white">MeeOpp!</text>
    `,
  },
  {
    id: 'bubble-snap',
    label: '"Snap!"',
    category: 'brand',
    viewBox: '0 0 110 88',
    body: `
      <rect x="4" y="4" width="102" height="56" rx="16" fill="#E8621A"/>
      <polygon points="82,60 96,84 64,60" fill="#E8621A"/>
      <text x="55" y="32" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial Rounded MT Bold,Arial,sans-serif"
        font-weight="900" font-size="28" fill="white">Snap!</text>
    `,
  },
  {
    id: 'bubble-bestie',
    label: '"Bestie"',
    category: 'brand',
    viewBox: '0 0 120 88',
    body: `
      <rect x="4" y="4" width="112" height="56" rx="16" fill="#1B6FD4"/>
      <polygon points="28,60 16,84 50,60" fill="#1B6FD4"/>
      <text x="60" y="32" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial Rounded MT Bold,Arial,sans-serif"
        font-weight="900" font-size="24" fill="white">Bestie ♡</text>
    `,
  },
  {
    id: 'banner-classof',
    label: "Class of '26",
    category: 'brand',
    viewBox: '0 0 160 56',
    body: `
      <path d="M0 10 L14 28 L0 46 L160 46 L146 28 L160 10 Z" fill="#F5C518"/>
      <path d="M0 10 L14 28 L0 46 L160 46 L146 28 L160 10 Z" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
      <text x="80" y="28" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial Rounded MT Bold,Arial,sans-serif"
        font-weight="900" font-size="18" fill="#1A1A2E">Class of &#39;26</text>
    `,
  },
  {
    id: 'star-magenta',
    label: 'Star',
    category: 'sparkle',
    viewBox: '0 0 100 100',
    body: `
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#BE0055"/>
    `,
  },
  {
    id: 'sparkle-gold',
    label: 'Sparkle',
    category: 'sparkle',
    viewBox: '0 0 100 100',
    body: `
      <path d="M50,4 L55,45 L96,50 L55,55 L50,96 L45,55 L4,50 L45,45 Z" fill="#F5C518"/>
      <path d="M22,22 L24.5,37 L39.5,39.5 L24.5,42 L22,57 L19.5,42 L4.5,39.5 L19.5,37 Z" fill="#F5C518" opacity="0.65"/>
      <path d="M74,16 L76,28 L88,30 L76,32 L74,44 L72,32 L60,30 L72,28 Z" fill="#F5C518" opacity="0.55"/>
    `,
  },
  {
    id: 'heart-magenta',
    label: 'Heart',
    category: 'sparkle',
    viewBox: '0 0 100 95',
    body: `
      <path d="M50,88 C8,62 4,28 24,14 C35,6 47,9 50,18 C53,9 65,6 76,14 C96,28 92,62 50,88Z" fill="#BE0055"/>
    `,
  },
  {
    id: 'starburst-orange',
    label: 'Burst',
    category: 'sparkle',
    viewBox: '0 0 100 100',
    body: `
      <polygon points="50,2 54,34 70,12 64,42 88,26 74,52 98,52 76,66 90,88 62,74 60,98 50,74 40,98 38,74 10,88 24,66 2,52 26,52 12,26 36,42 30,12 46,34" fill="#E8621A"/>
    `,
  },
]

export const CATEGORIES = [
  { id: 'brand', label: 'MeeOpp' },
  { id: 'sparkle', label: 'Sparkle' },
]

export function makeSvgDataUrl(def) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}">${def.body}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
