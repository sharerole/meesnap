// Canvas draw functions for each photo strip theme.
// Each draw() receives (ctx, images[], label) and renders to ctx.canvas.
import logoUrl from '../assets/meeopp-logo.png'

const _logo = new Image()
_logo.src = logoUrl

const W        = 360
const PHOTO_W  = 278
const PHOTO_H  = 208
const PAD_X    = (W - PHOTO_W) / 2   // 41
const PAD_TOP  = 40
const GAP      = 14
const FOOTER_H = 64

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

function drawLogo(ctx, centerX, y, h) {
  if (!_logo.complete || !_logo.naturalWidth) return
  const w = h * (_logo.naturalWidth / _logo.naturalHeight)
  ctx.drawImage(_logo, centerX - w / 2, y, w, h)
}

function drawWatermarks(ctx, images, alpha = 0.06) {
  if (!_logo.complete || !_logo.naturalWidth) return
  const wh = 30
  const ww = wh * (_logo.naturalWidth / _logo.naturalHeight)
  const prev = ctx.globalAlpha
  ctx.globalAlpha = alpha
  images.forEach((_, i) => {
    const wy = PAD_TOP + i * (PHOTO_H + GAP) + PHOTO_H / 2 - wh / 2
    ctx.drawImage(_logo, (W - ww) / 2, wy, ww, wh)
  })
  ctx.globalAlpha = prev
}

// Centered italic quote in the top padding area
function drawQuote(ctx, text, color, italic = true) {
  ctx.fillStyle = color
  ctx.font = `${italic ? 'italic ' : ''}500 10px "DM Sans",Arial,sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(text, W / 2, PAD_TOP - 10)
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

// ── MeeOpp Classic ────────────────────────────────────────────────────────────
// White strip, magenta border.
// Quote: "Learning looks good on you."

function drawClassic(ctx, images, label) {
  const h = stripTotalHeight(images.length)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 10
  ctx.strokeRect(5, 5, W - 10, h - 10)

  ctx.strokeStyle = 'rgba(193,0,90,0.18)'
  ctx.lineWidth = 1
  ctx.strokeRect(13, 13, W - 26, h - 26)

  drawQuote(ctx, 'Learning looks good on you.', 'rgba(193,0,90,0.55)')
  drawWatermarks(ctx, images, 0.05)
  drawPhotos(ctx, images, { clipRadius: 2 })

  const fy = h - FOOTER_H
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke()

  const logoH = 30
  const logoY  = fy + (FOOTER_H - logoH) / 2 - (label ? 8 : 0)
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(60,60,60,0.75)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Milestone ─────────────────────────────────────────────────────────────────
// Navy background, amber-gold border, achievement stars.
// Quote: "Small steps. Big moments."

function drawMilestone(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  ctx.fillStyle = '#1A1A2E'
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#C9920A'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  ctx.strokeStyle = 'rgba(201,146,10,0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, W - 28, h - 28)

  ctx.fillStyle = 'rgba(201,146,10,0.45)'
  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    for (let x = 24; x < W - 24; x += 16) {
      ctx.beginPath(); ctx.arc(x, gy, 1.5, 0, Math.PI * 2); ctx.fill()
    }
  })

  ctx.fillStyle = '#C9920A'
  ;[[28, 28], [W - 28, 28], [28, h - 28], [W - 28, h - 28]].forEach(([cx, cy]) =>
    drawEightPointStar(ctx, cx, cy, 9, 4)
  )

  drawQuote(ctx, 'Small steps. Big moments.', 'rgba(201,146,10,0.7)')
  drawWatermarks(ctx, images, 0.05)
  drawPhotos(ctx, images, { clipRadius: 2 })

  ctx.strokeStyle = 'rgba(201,146,10,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    ctx.strokeRect(PAD_X, PAD_TOP + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  ctx.fillStyle = '#0E0C1E'
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.strokeStyle = '#C9920A'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke()

  const logoH = 30
  const logoY  = fy + (FOOTER_H - logoH) / 2 - (label ? 8 : 0)
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(201,146,10,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Year Book ─────────────────────────────────────────────────────────────────
// Cream background, thick black border, typographic corner brackets,
// ruled dividers between photos, dark charcoal footer.
// Quote: "These are the days."

function drawCornerBracket(ctx, x, y, armLen, flipX, flipY) {
  const dx = flipX ? -1 : 1
  const dy = flipY ? -1 : 1
  ctx.beginPath()
  ctx.moveTo(x, y + dy * armLen)
  ctx.lineTo(x, y)
  ctx.lineTo(x + dx * armLen, y)
  ctx.stroke()
}

function drawYearBook(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  // Cream page background
  ctx.fillStyle = '#F4EFE4'
  ctx.fillRect(0, 0, W, h)

  // Subtle inner cream texture — faint horizontal lines like ruled paper
  ctx.strokeStyle = 'rgba(180,165,140,0.18)'
  ctx.lineWidth = 1
  for (let y = PAD_TOP; y < h - FOOTER_H; y += 12) {
    ctx.beginPath(); ctx.moveTo(PAD_X, y); ctx.lineTo(W - PAD_X, y); ctx.stroke()
  }

  // Thick black outer border
  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  // Thin inner rule
  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 1
  ctx.strokeRect(14, 14, W - 28, h - 28)

  // Typographic corner brackets
  const armLen = 18
  const ci = 19
  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 2.5
  drawCornerBracket(ctx, ci, ci, armLen, false, false)
  drawCornerBracket(ctx, W - ci, ci, armLen, true, false)
  drawCornerBracket(ctx, ci, h - ci, armLen, false, true)
  drawCornerBracket(ctx, W - ci, h - ci, armLen, true, true)

  // Thin ruled dividers between photos
  ctx.strokeStyle = 'rgba(28,28,28,0.25)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    ctx.beginPath(); ctx.moveTo(PAD_X + 8, gy); ctx.lineTo(W - PAD_X - 8, gy); ctx.stroke()
  })

  drawQuote(ctx, 'These are the days.', 'rgba(28,28,28,0.45)')
  drawWatermarks(ctx, images, 0.04)
  drawPhotos(ctx, images, { clipRadius: 0 })

  // Thin photo outlines
  ctx.strokeStyle = 'rgba(28,28,28,0.3)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    ctx.strokeRect(PAD_X, PAD_TOP + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H)
  })

  // Footer: dark charcoal — red logo pops on near-black
  const fy = h - FOOTER_H
  ctx.fillStyle = '#1C1C1C'
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke()

  const logoH = 30
  const logoY  = fy + (FOOTER_H - logoH) / 2 - (label ? 8 : 0)
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(244,239,228,0.65)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Squad Goals ───────────────────────────────────────────────────────────────
// Pastel pink-to-purple, hearts.
// Quote: "We learn better together."

function drawSquadGoals(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#FFF0F8')
  grad.addColorStop(1, '#EEE0FF')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 10
  ctx.beginPath(); ctx.roundRect(5, 5, W - 10, h - 10, 16); ctx.stroke()

  ctx.strokeStyle = 'rgba(193,0,90,0.25)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])
  ctx.beginPath(); ctx.roundRect(16, 16, W - 32, h - 32, 10); ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#C1005A'
  ;[[28, 28], [W - 28, 28], [28, h - 28], [W - 28, h - 28]].forEach(([cx, cy]) =>
    drawHeart(ctx, cx, cy, 9)
  )

  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    ctx.fillStyle = '#C1005A'
    ;[-18, 0, 18].forEach(offset => drawHeart(ctx, W / 2 + offset, gy, 4))
  })

  drawQuote(ctx, 'We learn better together.', 'rgba(193,0,90,0.6)')
  drawWatermarks(ctx, images, 0.06)
  drawPhotos(ctx, images, { clipRadius: 6 })

  ctx.strokeStyle = 'rgba(193,0,90,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.beginPath(); ctx.roundRect(PAD_X, y, PHOTO_W, PHOTO_H, 6); ctx.stroke()
  })

  const fy = h - FOOTER_H
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke()

  const logoH = 30
  const logoY  = fy + (FOOTER_H - logoH) / 2 - (label ? 8 : 0)
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(193,0,90,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const THEMES = [
  { id: 'classic',  label: 'MeeOpp Classic', colors: ['#C1005A', '#FFFFFF'],  draw: drawClassic  },
  { id: 'milestone', label: 'Milestone',      colors: ['#1A1A2E', '#C9920A'],  draw: drawMilestone },
  { id: 'yearbook',  label: 'Year Book',      colors: ['#F4EFE4', '#1C1C1C'],  draw: drawYearBook  },
  { id: 'squad',     label: 'Squad Goals',    colors: ['#FFF0F8', '#C1005A'],  draw: drawSquadGoals },
]

export const STRIP_W    = W
export const PHOTO_DIMS = { w: PHOTO_W, h: PHOTO_H }
export { _logo as logoImg }
