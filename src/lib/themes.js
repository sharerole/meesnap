// Canvas draw functions for each photo strip theme.
// Each draw() receives (ctx, images[], label) and renders to ctx.canvas.
import logoUrl from '../assets/meeopp-logo.png'

const _logo = new Image()
export const logoReady = new Promise(resolve => {
  if (_logo.complete && _logo.naturalWidth) resolve()
  else { _logo.onload = resolve; _logo.onerror = resolve }
})
_logo.src = logoUrl

const W        = 360
const PHOTO_W  = 278
const PHOTO_H  = 208
const PAD_X    = (W - PHOTO_W) / 2   // 41
const PAD_TOP  = 56   // top — quote breathing room
const PAD_BOT  = 22   // bottom — gap between last frame and logo
const GAP      = 14
const FOOTER_H = 72

export function stripTotalHeight(numPhotos) {
  return PAD_TOP + numPhotos * PHOTO_H + (numPhotos - 1) * GAP + PAD_BOT + FOOTER_H
}

function seededRand(seed) {
  return ((Math.sin(seed) * 9301 + 49297) % 233280) / 233280
}

function drawPhotos(ctx, images, { clipRadius = 2 } = {}) {
  images.forEach((img, i) => {
    const x = PAD_X
    const y = PAD_TOP + i * (PHOTO_H + GAP)

    // Crop source to fill destination while preserving aspect ratio (object-fit: cover).
    // Without this, portrait-orientation camera frames (e.g. iPhone front camera) are
    // stretched horizontally when squished into the landscape photo slot.
    const srcAspect = img.width / img.height
    const dstAspect = PHOTO_W / PHOTO_H
    let sx, sy, sw, sh
    if (srcAspect > dstAspect) {
      sh = img.height
      sw = sh * dstAspect
      sx = (img.width - sw) / 2
      sy = 0
    } else {
      sw = img.width
      sh = sw / dstAspect
      sx = 0
      sy = (img.height - sh) / 2
    }

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(x, y, PHOTO_W, PHOTO_H, clipRadius)
    ctx.clip()
    ctx.drawImage(img, sx, sy, sw, sh, x, y, PHOTO_W, PHOTO_H)
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

// Centered quote in the top padding area — 60% down so it sits between edge and first frame
function drawQuote(ctx, text, color, italic = true) {
  ctx.fillStyle = color
  ctx.font = `${italic ? 'italic ' : ''}600 12px "DM Sans",Arial,sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, W / 2, PAD_TOP * 0.6)
  ctx.textBaseline = 'alphabetic'
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

function drawDiamond(ctx, cx, cy, size) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - size)
  ctx.lineTo(cx + size, cy)
  ctx.lineTo(cx, cy + size)
  ctx.lineTo(cx - size, cy)
  ctx.closePath()
  ctx.fill()
}

// Film strip sprocket holes — drawn on top of the border so they appear punched through
function drawSprocketHoles(ctx, h, fillColor) {
  const holeW  = 8
  const holeH  = 14
  const holeR  = 2
  const cx_L   = 7
  const cx_R   = W - 7
  const firstY = 20
  const step   = 30

  ctx.fillStyle = fillColor
  for (let y = firstY; y + holeH < h - 12; y += step) {
    ctx.beginPath()
    ctx.roundRect(cx_L - holeW / 2, y, holeW, holeH, holeR)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(cx_R - holeW / 2, y, holeW, holeH, holeR)
    ctx.fill()
  }
}

// Gold confetti + star scatter for Milestone
function drawGoldConfetti(ctx, h) {
  for (let i = 0; i < 50; i++) {
    const x     = seededRand(i * 3 + 1) * W
    const y     = seededRand(i * 3 + 1 + 10000) * h
    const r     = 1.5 + seededRand(i * 3 + 2 + 20000) * 3
    const alpha = 0.35 + seededRand(i * 5 + 30000) * 0.35
    ctx.fillStyle = `rgba(201,146,10,${alpha.toFixed(2)})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 18; i++) {
    const x     = seededRand(i * 7 + 4) * W
    const y     = seededRand(i * 7 + 4 + 10000) * h
    const alpha = 0.3 + seededRand(i * 7 + 4 + 20000) * 0.3
    ctx.fillStyle = `rgba(201,146,10,${alpha.toFixed(2)})`
    drawEightPointStar(ctx, x, y, 4, 2)
  }
}

// Scattered hearts + sparkle dots for Squad Goals
function drawBackgroundHearts(ctx, h) {
  for (let i = 0; i < 28; i++) {
    const x     = seededRand(i * 11 + 1) * W
    const y     = seededRand(i * 11 + 1 + 10000) * h
    const s     = 3 + seededRand(i * 11 + 1 + 20000) * 6
    const alpha = 0.2 + seededRand(i * 11 + 1 + 30000) * 0.25
    ctx.fillStyle = `rgba(193,0,90,${alpha.toFixed(2)})`
    drawHeart(ctx, x, y, s)
  }
  for (let i = 0; i < 35; i++) {
    const x     = seededRand(i * 13 + 1) * W
    const y     = seededRand(i * 13 + 1 + 10000) * h
    const r     = 1 + seededRand(i * 13 + 1 + 20000) * 2.5
    const alpha = 0.25 + seededRand(i * 13 + 1 + 30000) * 0.3
    ctx.fillStyle = `rgba(193,0,90,${alpha.toFixed(2)})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Dot grid overlay for The Crew
function drawDotGrid(ctx, h) {
  const spacing = 22
  const dotR    = 1.5
  ctx.fillStyle = 'rgba(26,110,245,0.18)'
  for (let gx = spacing; gx < W - spacing / 2; gx += spacing) {
    for (let gy = spacing; gy < h - spacing / 2; gy += spacing) {
      ctx.beginPath()
      ctx.arc(gx, gy, dotR, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawCornerBracket(ctx, x, y, armLen, flipX, flipY) {
  const dx = flipX ? -1 : 1
  const dy = flipY ? -1 : 1
  ctx.beginPath()
  ctx.moveTo(x, y + dy * armLen)
  ctx.lineTo(x, y)
  ctx.lineTo(x + dx * armLen, y)
  ctx.stroke()
}

// ── MeeOpp Classic ────────────────────────────────────────────────────────────
// White strip, magenta border, film strip sprocket holes.
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

  drawQuote(ctx, 'Learning looks good on you.', 'rgba(193,0,90,0.85)')
  drawWatermarks(ctx, images, 0.05)
  drawPhotos(ctx, images, { clipRadius: 2 })

  const fy    = h - FOOTER_H
  const logoH = 26
  const logoY = fy + 10
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(193,0,90,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Milestone ─────────────────────────────────────────────────────────────────
// Navy background, amber-gold border, achievement stars, gold confetti.
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

  drawQuote(ctx, 'Small steps. Big moments.', 'rgba(201,146,10,0.9)')
  drawWatermarks(ctx, images, 0.05)

  // Subtle amber glow behind each photo
  images.forEach((_, i) => {
    const px   = PAD_X
    const py   = PAD_TOP + i * (PHOTO_H + GAP)
    const grad = ctx.createRadialGradient(
      px + PHOTO_W / 2, py + PHOTO_H / 2, 0,
      px + PHOTO_W / 2, py + PHOTO_H / 2, Math.max(PHOTO_W, PHOTO_H) * 0.65
    )
    grad.addColorStop(0, 'rgba(201,146,10,0.1)')
    grad.addColorStop(1, 'rgba(201,146,10,0)')
    ctx.fillStyle = grad
    ctx.fillRect(px - 20, py - 20, PHOTO_W + 40, PHOTO_H + 40)
  })

  drawPhotos(ctx, images, { clipRadius: 2 })

  ctx.strokeStyle = 'rgba(201,146,10,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    ctx.strokeRect(PAD_X, PAD_TOP + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H)
  })

  const fy    = h - FOOTER_H
  const logoH = 26
  const logoY = fy + 10
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
// ruled dividers, film strip sprocket holes.
// Quote: "These are the days."

function drawYearBook(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  ctx.fillStyle = '#F4EFE4'
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = 'rgba(180,165,140,0.18)'
  ctx.lineWidth = 1
  for (let y = PAD_TOP; y < h - FOOTER_H; y += 12) {
    ctx.beginPath(); ctx.moveTo(PAD_X, y); ctx.lineTo(W - PAD_X, y); ctx.stroke()
  }

  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 1
  ctx.strokeRect(14, 14, W - 28, h - 28)

  const armLen = 18
  const ci = 19
  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 2.5
  drawCornerBracket(ctx, ci, ci, armLen, false, false)
  drawCornerBracket(ctx, W - ci, ci, armLen, true, false)
  drawCornerBracket(ctx, ci, h - ci, armLen, false, true)
  drawCornerBracket(ctx, W - ci, h - ci, armLen, true, true)

  ctx.strokeStyle = 'rgba(28,28,28,0.25)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    ctx.beginPath(); ctx.moveTo(PAD_X + 8, gy); ctx.lineTo(W - PAD_X - 8, gy); ctx.stroke()
  })

  drawQuote(ctx, 'These are the days.', 'rgba(28,28,28,0.75)')
  drawWatermarks(ctx, images, 0.04)
  drawPhotos(ctx, images, { clipRadius: 0 })

  ctx.strokeStyle = 'rgba(28,28,28,0.3)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    ctx.strokeRect(PAD_X, PAD_TOP + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H)
  })

  const fy    = h - FOOTER_H
  const logoH = 26
  const logoY = fy + 10
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(28,28,28,0.5)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }

  // Sprocket holes punched through the black border
  drawSprocketHoles(ctx, h, '#F4EFE4')
}

// ── Squad Goals ───────────────────────────────────────────────────────────────
// Pastel pink-to-purple gradient, scattered hearts + sparkles, rounded border.
// Quote: "We learn better together."

function drawSquadGoals(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, W, h, 16)
  ctx.clip()

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

  drawQuote(ctx, 'We learn better together.', 'rgba(193,0,90,0.85)')
  drawWatermarks(ctx, images, 0.06)
  drawPhotos(ctx, images, { clipRadius: 6 })

  ctx.strokeStyle = 'rgba(193,0,90,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.beginPath(); ctx.roundRect(PAD_X, y, PHOTO_W, PHOTO_H, 6); ctx.stroke()
  })

  const fy    = h - FOOTER_H
  const logoH = 26
  const logoY = fy + 10
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(193,0,90,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }

  ctx.restore()
}

// ── The Crew ──────────────────────────────────────────────────────────────────
// Dark navy gradient, electric-blue border, dot grid, diamond accents.
// Quote: "Learn. Grow. Repeat."

function drawCrew(ctx, images, label) {
  const h = stripTotalHeight(images.length)

  const grad = ctx.createLinearGradient(0, 0, W, h)
  grad.addColorStop(0, '#0F1E30')
  grad.addColorStop(1, '#060E1A')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#1A6EF5'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  ctx.strokeStyle = 'rgba(26,110,245,0.3)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, W - 28, h - 28)

  ctx.fillStyle = '#1A6EF5'
  ;[[28, 28], [W - 28, 28], [28, h - 28], [W - 28, h - 28]].forEach(([cx, cy]) =>
    drawDiamond(ctx, cx, cy, 9)
  )

  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    ctx.strokeStyle = 'rgba(26,110,245,0.35)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(PAD_X + 16, gy)
    ctx.lineTo(W - PAD_X - 16, gy)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#1A6EF5'
    drawDiamond(ctx, W / 2, gy, 4)
  })

  drawQuote(ctx, 'Learn. Grow. Repeat.', 'rgba(26,110,245,0.95)')
  drawWatermarks(ctx, images, 0.04)
  drawPhotos(ctx, images, { clipRadius: 2 })

  ctx.strokeStyle = 'rgba(26,110,245,0.3)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    ctx.strokeRect(PAD_X, PAD_TOP + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H)
  })

  const fy    = h - FOOTER_H
  const logoH = 26
  const logoY = fy + 10
  drawLogo(ctx, W / 2, logoY, logoH)

  if (label) {
    ctx.fillStyle = 'rgba(74,159,255,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const THEMES = [
  { id: 'classic',   label: 'MeeOpp Classic', colors: ['#C1005A', '#FFFFFF'],  draw: drawClassic   },
  { id: 'milestone', label: 'Milestone',       colors: ['#1A1A2E', '#C9920A'],  draw: drawMilestone },
  { id: 'yearbook',  label: 'Year Book',       colors: ['#F4EFE4', '#1C1C1C'],  draw: drawYearBook  },
  { id: 'squad',     label: 'Squad Goals',     colors: ['#FFF0F8', '#C1005A'],  draw: drawSquadGoals },
  { id: 'crew',      label: 'The Crew',        colors: ['#0F1E30', '#1A6EF5'],  draw: drawCrew      },
]

export const STRIP_W    = W
export const PHOTO_DIMS = { w: PHOTO_W, h: PHOTO_H }
export { _logo as logoImg }
