import logoSrc from '../assets/meeopp-logo.png'

// Sticker definitions.
// SVG stickers: inline body + viewBox + w/h dimensions.
// PNG stickers: src URL + w/h dimensions.
// w/h are the natural dimensions used to preserve aspect ratio when drawing.

export const STICKER_DEFS = [
  {
    id: 'meeopp-mark',
    label: 'Mark',
    category: 'brand',
    viewBox: '0 0 100 100',
    w: 100, h: 100,
    defaultSize: 60,
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
    id: 'meeopp-logo',
    label: 'Logo',
    category: 'brand',
    src: logoSrc,
    w: 1104, h: 256,
    defaultSize: 140,
  },
  {
    id: 'bubble-meeopp',
    label: '"MeeOpp!"',
    category: 'brand',
    viewBox: '0 0 140 90',
    w: 140, h: 90,
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
    w: 110, h: 88,
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
    w: 120, h: 88,
    body: `
      <rect x="4" y="4" width="112" height="56" rx="16" fill="#1B6FD4"/>
      <polygon points="28,60 16,84 50,60" fill="#1B6FD4"/>
      <text x="60" y="32" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial Rounded MT Bold,Arial,sans-serif"
        font-weight="900" font-size="24" fill="white">Bestie &#9825;</text>
    `,
  },

  // ── Education ──────────────────────────────────────────────────────────────
  {
    id: 'edu-star',
    label: 'Gold Star',
    category: 'education',
    viewBox: '0 0 100 100',
    w: 100, h: 100,
    defaultSize: 70,
    body: `
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#F5C518"/>
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
        fill="none" stroke="#C9920A" stroke-width="1.5"/>
      <text x="50" y="52" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial Rounded MT Bold,Arial,sans-serif"
        font-weight="900" font-size="22" fill="#1A1A2E">A+</text>
    `,
  },
  {
    id: 'edu-apple',
    label: 'Apple',
    category: 'education',
    viewBox: '0 0 80 90',
    w: 80, h: 90,
    defaultSize: 70,
    body: `
      <ellipse cx="40" cy="58" rx="32" ry="30" fill="#E02020"/>
      <ellipse cx="40" cy="58" rx="22" ry="30" fill="#CC1818"/>
      <rect x="37" y="16" width="5" height="18" rx="2" fill="#7A4A1E"/>
      <ellipse cx="52" cy="19" rx="12" ry="6" fill="#3A8A20" transform="rotate(-20 52 19)"/>
      <ellipse cx="27" cy="47" rx="5" ry="8" fill="rgba(255,255,255,0.3)" transform="rotate(-10 27 47)"/>
    `,
  },
  {
    id: 'edu-book',
    label: 'Book',
    category: 'education',
    viewBox: '0 0 120 90',
    w: 120, h: 90,
    defaultSize: 80,
    body: `
      <path d="M8 20 Q60 10 60 22 L60 76 Q60 74 8 82 Z" fill="#3D6FD0"/>
      <path d="M112 20 Q60 10 60 22 L60 76 Q60 74 112 82 Z" fill="#2A54B0"/>
      <line x1="60" y1="22" x2="60" y2="76" stroke="white" stroke-width="2" stroke-opacity="0.4"/>
      <line x1="16" y1="38" x2="54" y2="35" stroke="white" stroke-width="1.5" stroke-opacity="0.35"/>
      <line x1="16" y1="48" x2="54" y2="46" stroke="white" stroke-width="1.5" stroke-opacity="0.35"/>
      <line x1="16" y1="58" x2="54" y2="56" stroke="white" stroke-width="1.5" stroke-opacity="0.35"/>
      <line x1="66" y1="35" x2="104" y2="38" stroke="white" stroke-width="1.5" stroke-opacity="0.35"/>
      <line x1="66" y1="46" x2="104" y2="48" stroke="white" stroke-width="1.5" stroke-opacity="0.35"/>
      <line x1="66" y1="56" x2="104" y2="58" stroke="white" stroke-width="1.5" stroke-opacity="0.35"/>
    `,
  },
  {
    id: 'edu-pencil',
    label: 'Pencil',
    category: 'education',
    viewBox: '0 0 50 120',
    w: 50, h: 120,
    defaultSize: 80,
    body: `
      <rect x="15" y="4" width="20" height="8" rx="3" fill="#F4A0A0"/>
      <rect x="15" y="12" width="20" height="8" fill="#C0C0C0"/>
      <rect x="15" y="20" width="20" height="74" fill="#F5C518"/>
      <polygon points="15,94 35,94 25,116" fill="#E8A840"/>
      <polygon points="20,94 30,94 25,112" fill="#999"/>
      <rect x="19" y="26" width="4" height="60" fill="rgba(255,255,255,0.25)"/>
    `,
  },

  // ── Sparkle ────────────────────────────────────────────────────────────────
  {
    id: 'star-magenta',
    label: 'Star',
    category: 'sparkle',
    viewBox: '0 0 100 100',
    w: 100, h: 100,
    body: `
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#BE0055"/>
    `,
  },
  {
    id: 'sparkle-gold',
    label: 'Sparkle',
    category: 'sparkle',
    viewBox: '0 0 100 100',
    w: 100, h: 100,
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
    w: 100, h: 95,
    body: `
      <path d="M50,88 C8,62 4,28 24,14 C35,6 47,9 50,18 C53,9 65,6 76,14 C96,28 92,62 50,88Z" fill="#BE0055"/>
    `,
  },
  {
    id: 'starburst-orange',
    label: 'Burst',
    category: 'sparkle',
    viewBox: '0 0 100 100',
    w: 100, h: 100,
    body: `
      <polygon points="50,2 54,34 70,12 64,42 88,26 74,52 98,52 76,66 90,88 62,74 60,98 50,74 40,98 38,74 10,88 24,66 2,52 26,52 12,26 36,42 30,12 46,34" fill="#E8621A"/>
    `,
  },
]

export const CATEGORIES = [
  { id: 'brand',     label: 'MeeOpp'    },
  { id: 'education', label: 'Education' },
  { id: 'sparkle',   label: 'Sparkle'   },
]

export function makeSvgDataUrl(def) {
  if (def.src) return def.src
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}">${def.body}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// Returns the drawn pixel dimensions of a sticker given its size (larger dimension).
export function getStickerDrawSize(def, size) {
  const aspect = def.w / def.h
  return aspect >= 1
    ? { dw: size,          dh: size / aspect  }
    : { dw: size * aspect, dh: size           }
}
