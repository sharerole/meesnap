// Canvas draw functions for each photo strip theme.
// Each draw() receives (ctx, images[], label, layout) and renders to ctx.canvas.
import logoUrl from '../assets/meeopp-logo.png'
import { getMetrics, DEFAULT_LAYOUT } from './layouts'

const _logo = new Image()
export const logoReady = new Promise(resolve => {
  if (_logo.complete && _logo.naturalWidth) resolve()
  else { _logo.onload = resolve; _logo.onerror = resolve }
})
_logo.src = logoUrl

const PAD_TOP  = 56
const FOOTER_H = 72

export function stripTotalHeight(layout) {
  return getMetrics(layout).h
}

function seededRand(seed) {
  return ((Math.sin(seed) * 9301 + 49297) % 233280) / 233280
}

function drawPhotos(ctx, images, metrics, { clipRadius = 2 } = {}) {
  const { PHOTO_W, PHOTO_H, PAD_X, GAP_ROW, GAP_COL, cols } = metrics
  images.forEach((img, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = PAD_X + col * (PHOTO_W + GAP_COL)
    const y = PAD_TOP + row * (PHOTO_H + GAP_ROW)

    const srcAspect = img.width / img.height
    const dstAspect = PHOTO_W / PHOTO_H
    let sx, sy, sw, sh
    if (srcAspect > dstAspect) {
      sh = img.height; sw = sh * dstAspect; sx = (img.width - sw) / 2; sy = 0
    } else {
      sw = img.width; sh = sw / dstAspect; sx = 0; sy = (img.height - sh) / 2
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

function drawWatermarks(ctx, images, metrics, alpha = 0.06) {
  if (!_logo.complete || !_logo.naturalWidth) return
  const { PHOTO_W, PHOTO_H, PAD_X, GAP_ROW, GAP_COL, cols } = metrics
  const wh = 30
  const ww = wh * (_logo.naturalWidth / _logo.naturalHeight)
  const prev = ctx.globalAlpha
  ctx.globalAlpha = alpha
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    ctx.drawImage(_logo, px + PHOTO_W / 2 - ww / 2, py + PHOTO_H / 2 - wh / 2, ww, wh)
  })
  ctx.globalAlpha = prev
}

function drawQuote(ctx, text, color, W, italic = true) {
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
  const r = s * 0.75   // narrower lobes give a 1:1 width-to-height ratio
  ctx.beginPath()
  ctx.moveTo(hx, hy + s * 0.3)
  ctx.bezierCurveTo(hx, hy, hx - r, hy, hx - r, hy - s * 0.5)
  ctx.bezierCurveTo(hx - r, hy - s * 1.2, hx, hy - s, hx, hy - s * 0.5)
  ctx.bezierCurveTo(hx, hy - s, hx + r, hy - s * 1.2, hx + r, hy - s * 0.5)
  ctx.bezierCurveTo(hx + r, hy, hx, hy, hx, hy + s * 0.3)
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

function drawSprocketHoles(ctx, W, h, fillColor) {
  const holeW = 8, holeH = 14, holeR = 2, cx_L = 7, cx_R = W - 7
  ctx.fillStyle = fillColor
  for (let y = 20; y + holeH < h - 12; y += 30) {
    ctx.beginPath(); ctx.roundRect(cx_L - holeW / 2, y, holeW, holeH, holeR); ctx.fill()
    ctx.beginPath(); ctx.roundRect(cx_R - holeW / 2, y, holeW, holeH, holeR); ctx.fill()
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
// White strip, magenta border.

function drawClassic(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols } = m

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#C1005A'
  ctx.lineWidth = 10
  ctx.strokeRect(5, 5, W - 10, h - 10)

  ctx.strokeStyle = 'rgba(193,0,90,0.18)'
  ctx.lineWidth = 1
  ctx.strokeRect(13, 13, W - 26, h - 26)

  drawQuote(ctx, 'Learning looks good on you.', 'rgba(193,0,90,0.85)', W)
  drawWatermarks(ctx, images, m, 0.05)
  drawPhotos(ctx, images, m, { clipRadius: 2 })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(193,0,90,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Distinction ───────────────────────────────────────────────────────────────
// Navy background, amber-gold border, achievement stars.

function drawDistinction(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#1A1A2E'
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#C9920A'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  ctx.strokeStyle = 'rgba(201,146,10,0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, W - 28, h - 28)

  ctx.fillStyle = 'rgba(201,146,10,0.45)'
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row + 1) * PHOTO_H + row * GAP_ROW + GAP_ROW / 2
    for (let x = 24; x < W - 24; x += 16) {
      ctx.beginPath(); ctx.arc(x, gy, 1.5, 0, Math.PI * 2); ctx.fill()
    }
  }

  ctx.fillStyle = '#C9920A'
  ;[[28, 28], [W - 28, 28], [28, h - 28], [W - 28, h - 28]].forEach(([cx, cy]) =>
    drawEightPointStar(ctx, cx, cy, 9, 4)
  )

  drawQuote(ctx, 'Small steps. Big moments.', 'rgba(201,146,10,0.9)', W)
  drawWatermarks(ctx, images, m, 0.05)

  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    const grad = ctx.createRadialGradient(
      px + PHOTO_W / 2, py + PHOTO_H / 2, 0,
      px + PHOTO_W / 2, py + PHOTO_H / 2, Math.max(PHOTO_W, PHOTO_H) * 0.65
    )
    grad.addColorStop(0, 'rgba(201,146,10,0.1)')
    grad.addColorStop(1, 'rgba(201,146,10,0)')
    ctx.fillStyle = grad
    ctx.fillRect(px - 20, py - 20, PHOTO_W + 40, PHOTO_H + 40)
  })

  drawPhotos(ctx, images, m, { clipRadius: 2 })

  ctx.strokeStyle = 'rgba(201,146,10,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X + col * (PHOTO_W + GAP_COL), PAD_TOP + row * (PHOTO_H + GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(201,146,10,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Year Book ─────────────────────────────────────────────────────────────────
// Cream background, thick black border, corner brackets, ruled lines.

function drawYearBook(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

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

  const armLen = 18, ci = 19
  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 2.5
  drawCornerBracket(ctx, ci,     ci,     armLen, false, false)
  drawCornerBracket(ctx, W - ci, ci,     armLen, true,  false)
  drawCornerBracket(ctx, ci,     h - ci, armLen, false, true)
  drawCornerBracket(ctx, W - ci, h - ci, armLen, true,  true)

  ctx.strokeStyle = 'rgba(28,28,28,0.25)'
  ctx.lineWidth = 1
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row + 1) * PHOTO_H + row * GAP_ROW + GAP_ROW / 2
    ctx.beginPath(); ctx.moveTo(PAD_X + 8, gy); ctx.lineTo(W - PAD_X - 8, gy); ctx.stroke()
  }

  drawQuote(ctx, 'Every lesson led here.', 'rgba(28,28,28,0.75)', W)
  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 0 })

  ctx.strokeStyle = 'rgba(28,28,28,0.3)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X + col * (PHOTO_W + GAP_COL), PAD_TOP + row * (PHOTO_H + GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(28,28,28,0.5)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }

  drawSprocketHoles(ctx, W, h, '#F4EFE4')
}

// ── Squad Goals ───────────────────────────────────────────────────────────────
// Pastel pink-to-purple gradient, scattered hearts, rounded border.

function drawSquadGoals(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, W, h, 16)
  ctx.clip()

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#E8D5FF')
  grad.addColorStop(1, '#FFD0EC')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#7B2FBE'
  ctx.lineWidth = 10
  ctx.beginPath(); ctx.roundRect(5, 5, W - 10, h - 10, 16); ctx.stroke()

  ctx.strokeStyle = 'rgba(123,47,190,0.25)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])
  ctx.beginPath(); ctx.roundRect(16, 16, W - 32, h - 32, 10); ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#EC4899'
  ;[[28, 28], [W - 28, 28], [28, h - 28], [W - 28, h - 28]].forEach(([cx, cy]) =>
    drawHeart(ctx, cx, cy, 9)
  )

  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row + 1) * PHOTO_H + row * GAP_ROW + GAP_ROW / 2
    ctx.fillStyle = '#EC4899'
    ;[-18, 0, 18].forEach(offset => drawHeart(ctx, W / 2 + offset, gy + 4 * 0.45, 4))
  }

  drawQuote(ctx, 'Study hard, squad harder.', 'rgba(123,47,190,0.85)', W)
  drawWatermarks(ctx, images, m, 0.06)
  drawPhotos(ctx, images, m, { clipRadius: 6 })

  ctx.strokeStyle = 'rgba(123,47,190,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = PAD_X + col * (PHOTO_W + GAP_COL)
    const y = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    ctx.beginPath(); ctx.roundRect(x, y, PHOTO_W, PHOTO_H, 6); ctx.stroke()
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(123,47,190,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }

  ctx.restore()
}

// ── The Crew ──────────────────────────────────────────────────────────────────
// Dark navy gradient, electric-blue border, diamond accents.

function drawCrew(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

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

  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row + 1) * PHOTO_H + row * GAP_ROW + GAP_ROW / 2
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
  }

  drawQuote(ctx, 'Learn. Grow. Repeat.', 'rgba(26,110,245,0.95)', W)
  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 2 })

  ctx.strokeStyle = 'rgba(26,110,245,0.3)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X + col * (PHOTO_W + GAP_COL), PAD_TOP + row * (PHOTO_H + GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(74,159,255,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Progress Saved ─────────────────────────────────────────────────────────────
// Black terminal background, bright green CRT aesthetic, scanlines.

function drawProgressSaved(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#050D05'
  ctx.fillRect(0, 0, W, h)

  ctx.strokeStyle = '#00FF41'
  ctx.lineWidth = 2
  ctx.strokeRect(5, 5, W - 10, h - 10)

  ctx.strokeStyle = 'rgba(0,255,65,0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(11, 11, W - 22, h - 22)

  ctx.strokeStyle = '#00FF41'
  ctx.fillStyle = '#00FF41'
  ctx.lineWidth = 1.5
  ;[[16, 16], [W - 16, 16], [16, h - 16], [W - 16, h - 16]].forEach(([cx, cy]) => {
    const arm = 7
    ctx.beginPath()
    ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy)
    ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy + arm)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, 2, 0, Math.PI * 2)
    ctx.fill()
  })

  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row + 1) * PHOTO_H + row * GAP_ROW + GAP_ROW / 2
    ctx.strokeStyle = 'rgba(0,255,65,0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(PAD_X + 16, gy)
    ctx.lineTo(W - PAD_X - 16, gy)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#00FF41'
    ctx.beginPath()
    ctx.arc(W / 2, gy, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(0,255,65,0.85)'
  ctx.font = '600 11px "Courier New",Courier,monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('> Your progress has been saved.', W / 2, PAD_TOP * 0.6)
  ctx.textBaseline = 'alphabetic'

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 0 })

  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, W, 1)
  }

  ctx.strokeStyle = 'rgba(0,255,65,0.35)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X + col * (PHOTO_W + GAP_COL), PAD_TOP + row * (PHOTO_H + GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(0,255,65,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H - 10)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const THEMES = [
  { id: 'classic',     label: 'MeeOpp Classic', colors: ['#C1005A', '#FFFFFF'],  draw: drawClassic      },
  { id: 'distinction', label: 'Distinction',    colors: ['#1A1A2E', '#C9920A'],  draw: drawDistinction  },
  { id: 'yearbook',    label: 'Year Book',      colors: ['#F4EFE4', '#1C1C1C'],  draw: drawYearBook     },
  { id: 'squad',       label: 'Squad Goals',    colors: ['#E8D5FF', '#7B2FBE'],  draw: drawSquadGoals   },
  { id: 'crew',        label: 'The Crew',       colors: ['#0F1E30', '#1A6EF5'],  draw: drawCrew         },
  { id: 'progress',    label: 'Progress Saved', colors: ['#050D05', '#00FF41'],  draw: drawProgressSaved },
]

export { _logo as logoImg }
export { getMetrics }
