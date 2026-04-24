// Canvas draw functions for each photo strip theme.
// Each draw() receives (ctx, images[], label) and renders to ctx.canvas.
import logoUrl from '../assets/meeopp-logo.png'

const _logo = new Image()
_logo.src = logoUrl

const W        = 360
const PHOTO_W  = 318
const PHOTO_H  = 238
const PAD_X    = (W - PHOTO_W) / 2   // 21
const PAD_TOP  = 20
const GAP      = 10
const FOOTER_H = 62

export function stripTotalHeight(numPhotos) {
  return PAD_TOP + numPhotos * PHOTO_H + (numPhotos - 1) * GAP + PAD_TOP + FOOTER_H
}

function seededRand(seed) {
  return ((Math.sin(seed) * 9301 + 49297) % 233280) / 233280
}

function drawPhotos(ctx, images, { clipRadius = 2 } = {}) {
  images.forEach((img, i) => {
    const x = PAD_X
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(x, y, PHOTO_W, PHOTO_H, clipRadius)
    ctx.clip()
    ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H)
    ctx.restore()
  })
}

// Draw the real MeeOpp logo PNG in the footer, centered horizontally.
// white=true applies brightness(0) invert(1) to make it white.
// dark=true applies brightness(0) to make it solid dark.
function drawLogo(ctx, centerX, y, h, { white = false, dark = false } = {}) {
  if (!_logo.complete || !_logo.naturalWidth) return
  const w = h * (_logo.naturalWidth / _logo.naturalHeight)
  ctx.save()
  if (white) ctx.filter = 'brightness(0) invert(1)'
  else if (dark) ctx.filter = 'brightness(0)'
  ctx.drawImage(_logo, centerX - w / 2, y, w, h)
  ctx.restore()
}

// Faint watermark logo behind each photo
function drawWatermarks(ctx, images, alpha = 0.06, { white = false } = {}) {
  if (!_logo.complete || !_logo.naturalWidth) return
  const wh = 30
  const ww = wh * (_logo.naturalWidth / _logo.naturalHeight)
  ctx.save()
  ctx.globalAlpha = alpha
  if (white) ctx.filter = 'brightness(0) invert(1)'
  images.forEach((_, i) => {
    const wy = PAD_TOP + i * (PHOTO_H + GAP) + PHOTO_H / 2 - wh / 2
    ctx.drawImage(_logo, (W - ww) / 2, wy, ww, wh)
  })
  ctx.restore()
}

function drawEightPointStar(ctx, cx, cy, r1, r2) {
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2
    const r = i % 2 === 0 ? r1 : r2
    if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
    else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
  }
  ctx.closePath()
  ctx.fill()
}

function drawHeart(ctx, hx, hy, s) {
  ctx.beginPath()
  ctx.moveTo(hx, hy + s * 0.3)
  ctx.bezierCurveTo(hx, hy, hx - s, hy, hx - s, hy - s * 0.5)
  ctx.bezierCurveTo(hx - s, hy - s * 1.2, hx, hy - s, hx, hy - s * 0.5)
  ctx.bezierCurveTo(hx, hy - s, hx + s, hy - s * 1.2, hx + s, hy - s * 0.5)
  ctx.bezierCurveTo(hx + s, hy, hx, hy, hx, hy + s * 0.3)
  ctx.fill()
}

// Footer helper: fills background, draws logo, optionally draws label
function drawFooter(ctx, h, { bg, logoCfg = {}, label, labelColor = 'rgba(255,255,255,0.8)', topLine = null } = {}) {
  const fy = h - FOOTER_H

  if (typeof bg === 'function') {
    bg(ctx, fy)
  } else {
    ctx.fillStyle = bg
    ctx.fillRect(0, fy, W, FOOTER_H)
  }

  if (topLine) {
    ctx.strokeStyle = topLine
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke()
  }

  const logoH  = 26
  const logoY  = fy + (FOOTER_H - logoH) / 2 - (label ? 7 : 0)
  drawLogo(ctx, W / 2, logoY, logoH, logoCfg)

  if (label) {
    ctx.fillStyle = labelColor
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── MeeOpp Classic ────────────────────────────────────────────────────────────

function drawClassic(ctx, images, label) {
  const h = stripTotalHeight(images.length)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 10
  ctx.strokeRect(5, 5, W - 10, h - 10)

  ctx.strokeStyle = 'rgba(193,0,90,0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(13, 13, W - 26, h - 26)

  drawWatermarks(ctx, images, 0.05)
  drawPhotos(ctx, images, { clipRadius: 2 })

  drawFooter(ctx, h, {
    bg: '#C1005A',
    logoCfg: { white: true },
    label,
    labelColor: 'rgba(255,255,255,0.82)',
  })
}

// ── Milestone ─────────────────────────────────────────────────────────────────
// Navy background, gold border, achievement stars in corners, gold footer.

function drawMilestone(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  ctx.fillStyle = '#1A1A2E'
  ctx.fillRect(0, 0, W, h)

  // Gold outer border
  ctx.strokeStyle = '#F5C518'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  // Hairline inner border
  ctx.strokeStyle = 'rgba(245,197,24,0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, W - 28, h - 28)

  // Gold dot rows in photo gaps
  ctx.fillStyle = 'rgba(245,197,24,0.45)'
  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    for (let x = 24; x < W - 24; x += 16) {
      ctx.beginPath(); ctx.arc(x, gy, 1.5, 0, Math.PI * 2); ctx.fill()
    }
  })

  // Eight-point gold stars at corners
  ctx.fillStyle = '#F5C518'
  ;[[26, 26], [W - 26, 26], [26, h - 26], [W - 26, h - 26]].forEach(([cx, cy]) =>
    drawEightPointStar(ctx, cx, cy, 9, 4)
  )

  drawWatermarks(ctx, images, 0.05)
  drawPhotos(ctx, images, { clipRadius: 2 })

  // Thin gold outline on each photo
  ctx.strokeStyle = 'rgba(245,197,24,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.strokeRect(PAD_X, y, PHOTO_W, PHOTO_H)
  })

  drawFooter(ctx, h, {
    bg: '#F5C518',
    logoCfg: { dark: true },
    label,
    labelColor: 'rgba(26,26,46,0.75)',
  })
}

// ── Graduation Day ────────────────────────────────────────────────────────────
// Deep navy background, confetti, mortarboard corners, magenta border.

function drawMortarboard(ctx, cx, cy, size) {
  const s = size
  ctx.fillStyle = '#C1005A'
  // Diamond-shaped board top
  ctx.save()
  ctx.translate(cx, cy - s * 0.3)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-s * 0.65, -s * 0.65, s * 1.3, s * 1.3)
  ctx.restore()
  // Brim ellipse
  ctx.beginPath()
  ctx.ellipse(cx, cy, s * 0.85, s * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()
  // Tassel
  ctx.strokeStyle = '#F5C518'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx + s * 0.9, cy - s * 0.3)
  ctx.lineTo(cx + s * 0.9, cy + s * 0.7)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + s * 0.9, cy + s * 0.85, s * 0.14, 0, Math.PI * 2)
  ctx.fillStyle = '#F5C518'
  ctx.fill()
}

const CONFETTI_COLORS = ['#C1005A', '#F5C518', '#FFFFFF', '#4A9FFF', '#FF6BAD', '#A8E6CF']

function drawGraduation(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  ctx.fillStyle = '#08061A'
  ctx.fillRect(0, 0, W, h)

  // Confetti specs (seeded so preview matches final)
  for (let s = 0; s < 90; s++) {
    const x  = seededRand(s * 3) * W
    const y  = seededRand(s * 7) * h
    const cw = 3 + seededRand(s * 11) * 5
    const ch = 2 + seededRand(s * 13) * 3
    ctx.fillStyle = CONFETTI_COLORS[Math.floor(seededRand(s * 17) * CONFETTI_COLORS.length)]
    ctx.save()
    ctx.globalAlpha = 0.2 + seededRand(s * 19) * 0.35
    ctx.translate(x, y)
    ctx.rotate(seededRand(s * 23) * Math.PI)
    ctx.fillRect(-cw / 2, -ch / 2, cw, ch)
    ctx.restore()
  }

  // Magenta border
  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  // Hairline inner
  ctx.strokeStyle = 'rgba(193,0,90,0.3)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, W - 28, h - 28)

  // Mortarboard corners
  ;[[26, 26], [W - 26, 26], [26, h - 26], [W - 26, h - 26]].forEach(([cx, cy]) =>
    drawMortarboard(ctx, cx, cy, 10)
  )

  drawWatermarks(ctx, images, 0.05, { white: true })
  drawPhotos(ctx, images, { clipRadius: 2 })

  // Photo outlines
  ctx.strokeStyle = 'rgba(193,0,90,0.35)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    ctx.strokeRect(PAD_X, PAD_TOP + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H)
  })

  drawFooter(ctx, h, {
    bg: (c, fy) => {
      const grad = c.createLinearGradient(0, fy, W, fy + FOOTER_H)
      grad.addColorStop(0, '#0D0420')
      grad.addColorStop(1, '#1A0630')
      c.fillStyle = grad
      c.fillRect(0, fy, W, FOOTER_H)
    },
    logoCfg: { white: true },
    label,
    labelColor: 'rgba(245,197,24,0.85)',
    topLine: '#C1005A',
  })
}

// ── Squad Goals ───────────────────────────────────────────────────────────────
// Pastel pink-to-purple gradient, heart motifs, MeeOpp magenta accents.

function drawSquadGoals(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#FFF0F8')
  grad.addColorStop(1, '#EEE0FF')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, h)

  // Rounded magenta border
  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 10
  ctx.beginPath(); ctx.roundRect(5, 5, W - 10, h - 10, 16); ctx.stroke()

  // Dashed inner border
  ctx.strokeStyle = 'rgba(193,0,90,0.25)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])
  ctx.beginPath(); ctx.roundRect(16, 16, W - 32, h - 32, 10); ctx.stroke()
  ctx.setLineDash([])

  // Corner hearts
  ctx.fillStyle = '#C1005A'
  ;[[26, 26], [W - 26, 26], [26, h - 26], [W - 26, h - 26]].forEach(([cx, cy]) =>
    drawHeart(ctx, cx, cy, 9)
  )

  // Heart dividers between photos
  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    ctx.fillStyle = '#C1005A'
    ;[-18, 0, 18].forEach(offset => drawHeart(ctx, W / 2 + offset, gy, 4))
  })

  drawWatermarks(ctx, images, 0.06)
  drawPhotos(ctx, images, { clipRadius: 6 })

  // Photo borders
  ctx.strokeStyle = 'rgba(193,0,90,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.beginPath(); ctx.roundRect(PAD_X, y, PHOTO_W, PHOTO_H, 6); ctx.stroke()
  })

  drawFooter(ctx, h, {
    bg: (c, fy) => {
      c.fillStyle = 'rgba(255,107,173,0.12)'
      c.fillRect(0, fy, W, FOOTER_H)
    },
    logoCfg: {},         // red logo as-is on light pink
    label,
    labelColor: 'rgba(193,0,90,0.7)',
    topLine: 'rgba(193,0,90,0.25)',
  })
}

// ── Public API ────────────────────────────────────────────────────────────────

export const THEMES = [
  { id: 'classic',    label: 'MeeOpp Classic',  colors: ['#C1005A', '#FFFFFF'],  draw: drawClassic    },
  { id: 'milestone',  label: 'Milestone',        colors: ['#1A1A2E', '#F5C518'],  draw: drawMilestone  },
  { id: 'graduation', label: 'Graduation Day',   colors: ['#08061A', '#C1005A'],  draw: drawGraduation },
  { id: 'squad',      label: 'Squad Goals',      colors: ['#FFF0F8', '#C1005A'],  draw: drawSquadGoals },
]

export const STRIP_W    = W
export const PHOTO_DIMS = { w: PHOTO_W, h: PHOTO_H }
