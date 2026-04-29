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
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(193,0,90,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
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
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(201,146,10,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
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
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(28,28,28,0.5)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
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
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(123,47,190,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
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
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(74,159,255,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
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
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(0,255,65,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── Report Card ───────────────────────────────────────────────────────────────
// Aged cream, navy double-line border, ruled lines, A+ stamp per photo.

function drawReportCard(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#F7F2E8'
  ctx.fillRect(0, 0, W, h)

  // Notebook ruled lines
  ctx.strokeStyle = 'rgba(100,120,180,0.11)'
  ctx.lineWidth = 1
  for (let y = 16; y < h; y += 14) {
    ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(W - 8, y); ctx.stroke()
  }

  // Red margin line(s)
  ctx.strokeStyle = 'rgba(200,60,60,0.18)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD_X - 5, 8); ctx.lineTo(PAD_X - 5, h - 8); ctx.stroke()
  if (cols > 1) {
    ctx.beginPath(); ctx.moveTo(W - PAD_X + 5, 8); ctx.lineTo(W - PAD_X + 5, h - 8); ctx.stroke()
  }

  // Double-line navy border
  ctx.strokeStyle = '#1C2B5E'
  ctx.lineWidth = 6
  ctx.strokeRect(4, 4, W - 8, h - 8)
  ctx.strokeStyle = '#1C2B5E'
  ctx.lineWidth = 1.5
  ctx.strokeRect(13, 13, W - 26, h - 26)

  // Between-row divider
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row + 1) * PHOTO_H + row * GAP_ROW + GAP_ROW / 2
    ctx.strokeStyle = 'rgba(28,43,94,0.22)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD_X + 4, gy); ctx.lineTo(W - PAD_X - 4, gy); ctx.stroke()
  }

  drawQuote(ctx, 'Results speak for themselves.', 'rgba(28,43,94,0.75)', W, false)
  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 1 })

  // A+ rubber-stamp impression on the first photo only
  if (images.length > 0) {
    const px = PAD_X
    const py = PAD_TOP
    const r  = Math.min(PHOTO_W, PHOTO_H) * 0.16
    ctx.save()
    ctx.translate(px + PHOTO_W * 0.76, py + PHOTO_H * 0.26)
    ctx.rotate(-0.28)
    ctx.globalAlpha = 0.26
    ctx.strokeStyle = '#BE0055'
    ctx.lineWidth   = 1.8
    ctx.beginPath(); ctx.arc(0, 0, r,        0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle   = '#BE0055'
    ctx.font        = `bold ${Math.round(r * 0.92)}px "DM Sans",Arial,sans-serif`
    ctx.textAlign   = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('A+', 0, 0)
    ctx.globalAlpha = 1
    ctx.restore()
  }

  // Photo borders
  ctx.strokeStyle = 'rgba(28,43,94,0.18)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X + col * (PHOTO_W + GAP_COL), PAD_TOP + row * (PHOTO_H + GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(28,43,94,0.6)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── Library Card ──────────────────────────────────────────────────────────────
// Buff parchment, typewriter header, checkout grid, date-stamp impression.

function drawLibraryCard(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#EDE0C0'
  ctx.fillRect(0, 0, W, h)

  // Card-stock texture
  ctx.strokeStyle = 'rgba(150,120,60,0.09)'
  ctx.lineWidth = 1
  for (let y = 10; y < h; y += 8) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Dark-brown border
  ctx.strokeStyle = '#5C3D1E'
  ctx.lineWidth = 5
  ctx.strokeRect(4, 4, W - 8, h - 8)
  ctx.strokeStyle = 'rgba(92,61,30,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(11, 11, W - 22, h - 22)

  // Typewriter header "MEEOPP LIBRARY"
  ctx.fillStyle = 'rgba(92,61,30,0.88)'
  ctx.font = '700 10px "Courier New",Courier,monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('MEEOPP LIBRARY', W / 2, 18)

  // Thin rule below header
  ctx.strokeStyle = 'rgba(92,61,30,0.28)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD_X + 4, 27); ctx.lineTo(W - PAD_X - 4, 27); ctx.stroke()

  // Quote
  ctx.fillStyle = 'rgba(92,61,30,0.65)'
  ctx.font = 'italic 600 11px "DM Sans",Arial,sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('A lesson worth keeping.', W / 2, 42)
  ctx.textBaseline = 'alphabetic'

  // Checkout-card grid between photo rows
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row + 1) * PHOTO_H + row * GAP_ROW + GAP_ROW / 2
    const x0 = PAD_X + 4, x1 = W - PAD_X - 4
    ctx.strokeStyle = 'rgba(92,61,30,0.22)'
    ctx.lineWidth = 1
    for (const off of [-5, 0, 5]) {
      ctx.beginPath(); ctx.moveTo(x0, gy + off); ctx.lineTo(x1, gy + off); ctx.stroke()
    }
    // Vertical column lines (3-column checkout look)
    const segW = (x1 - x0) / 3
    for (let c = 1; c < 3; c++) {
      ctx.beginPath(); ctx.moveTo(x0 + c * segW, gy - 7); ctx.lineTo(x0 + c * segW, gy + 7); ctx.stroke()
    }
  }

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 1 })

  // Photo borders
  ctx.strokeStyle = 'rgba(92,61,30,0.22)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X + col * (PHOTO_W + GAP_COL), PAD_TOP + row * (PHOTO_H + GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)

  if (label) {
    ctx.fillStyle = 'rgba(92,61,30,0.6)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── Film Negative ─────────────────────────────────────────────────────────────
// Near-black strip, film-border side strips with sprocket holes, yellow frame marks.

function drawFilmNegative(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#0A0A0A'
  ctx.fillRect(0, 0, W, h)

  const fb = 18 // film border width
  ctx.fillStyle = '#141414'
  ctx.fillRect(0, 0, fb, h)
  ctx.fillRect(W - fb, 0, fb, h)

  // Sprocket holes
  ctx.fillStyle = '#252525'
  const hW = 9, hH = 12, hR = 2
  for (let y = 16; y + hH < h - 10; y += 25) {
    ctx.beginPath(); ctx.roundRect(fb / 2 - hW / 2, y, hW, hH, hR); ctx.fill()
    ctx.beginPath(); ctx.roundRect(W - fb / 2 - hW / 2, y, hW, hH, hR); ctx.fill()
  }

  // Film edge text
  ctx.fillStyle = 'rgba(255,215,80,0.5)'
  ctx.font = '600 8px "Courier New",Courier,monospace'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('MEEOPP · 400TX · DEVELOPED', W / 2, PAD_TOP * 0.48)

  // Frame numbers beside each photo
  ctx.font = '700 7px "Courier New",Courier,monospace'
  images.forEach((_, i) => {
    const row = Math.floor(i / cols)
    const py  = PAD_TOP + row * (PHOTO_H + GAP_ROW) + PHOTO_H / 2
    ctx.fillText(`${String(i + 1).padStart(2, '0')}A`, fb / 2, py)
    ctx.fillText(`${String(i + 1).padStart(2, '0')}A`, W - fb / 2, py)
  })
  ctx.textBaseline = 'alphabetic'

  drawPhotos(ctx, images, m, { clipRadius: 0 })

  // Film grain (seeded so it doesn't flicker on re-render)
  for (let i = 0; i < 280; i++) {
    ctx.globalAlpha = seededRand(i * 3 + 2) * 0.07
    ctx.fillStyle = '#fff'
    ctx.fillRect(seededRand(i * 3) * W, seededRand(i * 3 + 1) * h, 1.5, 1.5)
  }
  ctx.globalAlpha = 1

  const fy = h - FOOTER_H
  ctx.fillStyle = '#141414'
  ctx.fillRect(fb, fy, W - fb * 2, FOOTER_H)
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    ctx.fillStyle = 'rgba(255,215,80,0.65)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── VHS ────────────────────────────────────────────────────────────────────────
// Dark charcoal, cyan/magenta accents, scan lines, ● REC indicator.

function drawVHS(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#111116'
  ctx.fillRect(0, 0, W, h)

  // VHS interference bands (seeded)
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,240,255,0.07)' : 'rgba(255,0,200,0.06)'
    ctx.fillRect(0, seededRand(i * 11) * h, W, seededRand(i * 11 + 1) * 3 + 1)
  }

  // Outer cyan border
  ctx.strokeStyle = 'rgba(0,240,255,0.65)'
  ctx.lineWidth = 2
  ctx.strokeRect(5, 5, W - 10, h - 10)
  ctx.strokeStyle = 'rgba(255,0,200,0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(9, 9, W - 18, h - 18)

  // Header: ● REC | 00:00:01 | CH 01
  const hY = PAD_TOP * 0.45
  ctx.fillStyle = '#FF2525'
  ctx.beginPath(); ctx.arc(PAD_X + 6, hY, 4, 0, Math.PI * 2); ctx.fill()
  ctx.font = '700 8px "Courier New",Courier,monospace'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left';   ctx.fillText('REC', PAD_X + 13, hY)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.textAlign = 'center'; ctx.fillText('00:00:01', W / 2, hY)
  ctx.fillStyle = 'rgba(0,240,255,0.7)'
  ctx.textAlign = 'right';  ctx.fillText('CH 01', W - PAD_X, hY)
  ctx.textBaseline = 'alphabetic'

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 0 })

  // Cyan tint + scan lines over photos
  ctx.fillStyle = 'rgba(0,240,255,0.04)'
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    ctx.fillRect(PAD_X + col*(PHOTO_W+GAP_COL), PAD_TOP + row*(PHOTO_H+GAP_ROW), PHOTO_W, PHOTO_H)
  })
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, W, 1)

  // Between-row glitch bars
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row+1)*PHOTO_H + row*GAP_ROW + GAP_ROW/2
    ctx.fillStyle = 'rgba(0,240,255,0.15)'
    ctx.fillRect(PAD_X, gy - 1, PHOTO_W*cols + GAP_COL*(cols-1), 2)
  }

  // Photo borders
  ctx.strokeStyle = 'rgba(0,240,255,0.22)'
  ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X+col*(PHOTO_W+GAP_COL), PAD_TOP+row*(PHOTO_H+GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    ctx.fillStyle = 'rgba(0,240,255,0.75)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── Retro Diner ───────────────────────────────────────────────────────────────
// Cream background, red-and-cream checkerboard border, 12-point starburst header.

function drawRetroDiner(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#FFF3DC'
  ctx.fillRect(0, 0, W, h)

  // Checkerboard top + bottom
  const ck = 8, ckR = 2, RED = '#CC1020', CREAM = '#FFF3DC'
  for (let cx = 0; cx < W; cx += ck) {
    for (let cr = 0; cr < ckR; cr++) {
      ctx.fillStyle = ((Math.floor(cx / ck) + cr) % 2 === 0) ? RED : CREAM
      ctx.fillRect(cx, cr * ck, ck, ck)
      ctx.fillRect(cx, h - ckR * ck + cr * ck, ck, ck)
    }
  }

  // Red border just inside checkerboard
  ctx.strokeStyle = RED
  ctx.lineWidth = 1.5
  ctx.strokeRect(ck * 0.5, ckR * ck + 2, W - ck, h - ckR * ck * 2 - 4)

  // 12-point starburst in header
  const hY = PAD_TOP * 0.5
  ctx.save()
  ctx.translate(W / 2, hY)
  ctx.fillStyle = RED
  ctx.beginPath()
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI) / 12 - Math.PI / 2
    const r = i % 2 === 0 ? 16 : 8
    if (i === 0) ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle))
    else ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle))
  }
  ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#FFF3DC'
  ctx.font = '800 7px "DM Sans",Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('DINER', 0, 0)
  ctx.restore()

  // Small starbursts in corners
  ;[[ck*2, ckR*ck+12], [W-ck*2, ckR*ck+12], [ck*2, h-ckR*ck-12], [W-ck*2, h-ckR*ck-12]].forEach(([cx, cy]) => {
    ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = RED
    ctx.beginPath()
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8 - Math.PI / 2
      const r = i % 2 === 0 ? 7 : 3.5
      if (i === 0) ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle))
      else ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle))
    }
    ctx.closePath(); ctx.fill(); ctx.restore()
  })

  // Between-row double-line dividers
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row+1)*PHOTO_H + row*GAP_ROW + GAP_ROW/2
    ctx.strokeStyle = RED; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD_X+12, gy-2); ctx.lineTo(W-PAD_X-12, gy-2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PAD_X+12, gy+2); ctx.lineTo(W-PAD_X-12, gy+2); ctx.stroke()
  }

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 2 })

  ctx.strokeStyle = 'rgba(204,16,32,0.25)'; ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X+col*(PHOTO_W+GAP_COL), PAD_TOP+row*(PHOTO_H+GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 2, 26)
  if (label) {
    ctx.fillStyle = 'rgba(204,16,32,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 34)
  }
}

// ── Arcade Cabinet ────────────────────────────────────────────────────────────
// Near-black with stars, yellow/red pixel-block border, PLAYER 1 header.

function drawArcade(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#080818'
  ctx.fillRect(0, 0, W, h)

  // Stars (seeded)
  for (let i = 0; i < 60; i++) {
    ctx.globalAlpha = 0.3 + seededRand(i) * 0.7
    const ss = seededRand(i * 3 + 2) > 0.8 ? 2 : 1
    ctx.fillStyle = '#fff'
    ctx.fillRect(seededRand(i * 3) * W, seededRand(i * 3 + 1) * h, ss, ss)
  }
  ctx.globalAlpha = 1

  // Pixel-block border: alternating yellow / red 6-px squares
  const pix = 6
  for (let x = 0; x < W; x += pix) {
    ctx.fillStyle = (Math.floor(x / pix) % 2 === 0) ? '#FFD700' : '#FF2020'
    ctx.fillRect(x, 0, pix, pix)
    ctx.fillRect(x, h - pix, pix, pix)
  }
  for (let y = pix; y < h - pix; y += pix) {
    ctx.fillStyle = (Math.floor(y / pix) % 2 === 0) ? '#FFD700' : '#FF2020'
    ctx.fillRect(0, y, pix, pix)
    ctx.fillRect(W - pix, y, pix, pix)
  }

  // Header
  ctx.fillStyle = '#FFD700'
  ctx.font = '700 10px "Courier New",Courier,monospace'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('— PLAYER 1 —', W / 2, PAD_TOP * 0.35)
  ctx.fillStyle = '#FF2020'
  ctx.font = '700 9px "Courier New",Courier,monospace'
  ctx.fillText('♥  ♥  ♥', W / 2, PAD_TOP * 0.7)
  ctx.textBaseline = 'alphabetic'

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 0 })

  // Between-row dashed dividers
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row+1)*PHOTO_H + row*GAP_ROW + GAP_ROW/2
    ctx.strokeStyle = 'rgba(255,215,0,0.4)'; ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(PAD_X+pix, gy); ctx.lineTo(W-PAD_X-pix, gy); ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.strokeStyle = 'rgba(255,215,0,0.28)'; ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X+col*(PHOTO_W+GAP_COL), PAD_TOP+row*(PHOTO_H+GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    ctx.fillStyle = 'rgba(255,215,0,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── K-Pop Photocard ───────────────────────────────────────────────────────────
// Soft pastel gradient, "MEEOPP ENT · LIMITED EDITION" header, sparkle stars.

function drawKpop(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  // Soft lavender-pink gradient background
  const bg = ctx.createLinearGradient(0, 0, W, h)
  bg.addColorStop(0, '#F9E8FF')
  bg.addColorStop(0.5, '#FFE8F5')
  bg.addColorStop(1, '#E8F0FF')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, h)

  // Thin pastel outer border
  ctx.strokeStyle = 'rgba(200,120,220,0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, W - 8, h - 8)
  ctx.strokeStyle = 'rgba(200,120,220,0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(7, 7, W - 14, h - 14)

  // Rainbow accent bar at top
  const rainbowBar = ctx.createLinearGradient(0, 0, W, 0)
  rainbowBar.addColorStop(0,    '#FF9ECD')
  rainbowBar.addColorStop(0.25, '#B8A4FF')
  rainbowBar.addColorStop(0.5,  '#9BE8FF')
  rainbowBar.addColorStop(0.75, '#A8F0C0')
  rainbowBar.addColorStop(1,    '#FFD9A0')
  ctx.fillStyle = rainbowBar
  ctx.fillRect(0, 0, W, 4)

  // Header text
  ctx.fillStyle = 'rgba(160,80,200,0.85)'
  ctx.font = '800 8px "DM Sans",Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('MEEOPP ENT.  ·  LIMITED EDITION', W / 2, PAD_TOP * 0.35)
  ctx.fillStyle = 'rgba(200,120,220,0.6)'
  ctx.font = '600 7px "DM Sans",Arial,sans-serif'
  ctx.fillText('✦  ✦  ✦', W / 2, PAD_TOP * 0.72)
  ctx.textBaseline = 'alphabetic'

  // Sparkle decorations (seeded)
  const sparkleChars = ['✦', '✧', '⭑', '★']
  for (let i = 0; i < 14; i++) {
    const sx = seededRand(i * 5)     * W
    const sy = PAD_TOP + seededRand(i * 5 + 1) * (h - PAD_TOP - FOOTER_H)
    // Keep out of photo areas
    let inPhoto = false
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = PAD_X + c * (PHOTO_W + GAP_COL)
        const py = PAD_TOP + r * (PHOTO_H + GAP_ROW)
        if (sx > px - 6 && sx < px + PHOTO_W + 6 && sy > py - 6 && sy < py + PHOTO_H + 6) inPhoto = true
      }
    }
    if (!inPhoto) {
      ctx.globalAlpha = 0.2 + seededRand(i * 5 + 2) * 0.3
      ctx.fillStyle = seededRand(i * 5 + 3) > 0.5 ? '#C87DC8' : '#A08AE0'
      ctx.font = `${6 + seededRand(i * 5 + 4) * 6}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(sparkleChars[Math.floor(seededRand(i * 5 + 4) * 4)], sx, sy)
    }
  }
  ctx.globalAlpha = 1
  ctx.textBaseline = 'alphabetic'

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 3 })

  // Soft photo border
  ctx.strokeStyle = 'rgba(180,100,210,0.3)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X+col*(PHOTO_W+GAP_COL), PAD_TOP+row*(PHOTO_H+GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    ctx.fillStyle = 'rgba(160,80,200,0.75)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── Holographic / Y2K ─────────────────────────────────────────────────────────
// White/silver base, diagonal iridescent overlay, rainbow gradient border.

function drawHolographic(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  // White base
  ctx.fillStyle = '#FAFCFF'
  ctx.fillRect(0, 0, W, h)

  // Diagonal iridescent overlay bands
  ctx.save()
  for (let band = 0; band < 8; band++) {
    const offset = (band / 8) * (W + h)
    const holo = ctx.createLinearGradient(offset, 0, offset - 60, h)
    holo.addColorStop(0,   'rgba(255,120,200,0.06)')
    holo.addColorStop(0.2, 'rgba(120,200,255,0.06)')
    holo.addColorStop(0.4, 'rgba(200,255,120,0.06)')
    holo.addColorStop(0.6, 'rgba(255,200,120,0.06)')
    holo.addColorStop(0.8, 'rgba(180,120,255,0.06)')
    holo.addColorStop(1,   'rgba(255,120,200,0.06)')
    ctx.fillStyle = holo
    ctx.fillRect(0, 0, W, h)
  }
  ctx.restore()

  // Rainbow border
  const rainbowBorder = ctx.createLinearGradient(0, 0, W, h)
  rainbowBorder.addColorStop(0,    '#FF6EC7')
  rainbowBorder.addColorStop(0.2,  '#A78BFA')
  rainbowBorder.addColorStop(0.4,  '#38BDF8')
  rainbowBorder.addColorStop(0.6,  '#34D399')
  rainbowBorder.addColorStop(0.8,  '#FBBF24')
  rainbowBorder.addColorStop(1,    '#FF6EC7')
  ctx.strokeStyle = rainbowBorder
  ctx.lineWidth = 4
  ctx.strokeRect(3, 3, W - 6, h - 6)
  ctx.lineWidth = 1
  ctx.strokeRect(8, 8, W - 16, h - 16)

  // Gradient header text
  const headerGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0)
  headerGrad.addColorStop(0,   '#FF6EC7')
  headerGrad.addColorStop(0.5, '#A78BFA')
  headerGrad.addColorStop(1,   '#38BDF8')
  ctx.fillStyle = headerGrad
  ctx.font = '900 9px "DM Sans",Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('✧ IRIDESCENT ✧', W / 2, PAD_TOP * 0.5)
  ctx.textBaseline = 'alphabetic'

  // Sparkle chars (seeded)
  const sparks = ['✦', '✧', '◆', '◇']
  for (let i = 0; i < 18; i++) {
    const sx = seededRand(i * 7)     * W
    const sy = PAD_TOP + seededRand(i * 7 + 1) * (h - PAD_TOP - FOOTER_H)
    let inPhoto = false
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = PAD_X + c * (PHOTO_W + GAP_COL)
        const py = PAD_TOP + r * (PHOTO_H + GAP_ROW)
        if (sx > px - 4 && sx < px + PHOTO_W + 4 && sy > py - 4 && sy < py + PHOTO_H + 4) inPhoto = true
      }
    }
    if (!inPhoto) {
      ctx.globalAlpha = 0.15 + seededRand(i * 7 + 2) * 0.3
      const hues = ['#FF6EC7', '#A78BFA', '#38BDF8', '#34D399', '#FBBF24']
      ctx.fillStyle = hues[Math.floor(seededRand(i * 7 + 3) * 5)]
      ctx.font = `${7 + seededRand(i * 7 + 4) * 7}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(sparks[Math.floor(seededRand(i * 7 + 5) * 4)], sx, sy)
    }
  }
  ctx.globalAlpha = 1
  ctx.textBaseline = 'alphabetic'

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 2 })

  // Iridescent photo borders
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    const pb = ctx.createLinearGradient(px, py, px + PHOTO_W, py + PHOTO_H)
    pb.addColorStop(0,   '#FF6EC7'); pb.addColorStop(0.5, '#38BDF8'); pb.addColorStop(1, '#A78BFA')
    ctx.strokeStyle = pb; ctx.lineWidth = 1.5
    ctx.strokeRect(px, py, PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    const lblGrad = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0)
    lblGrad.addColorStop(0, '#FF6EC7'); lblGrad.addColorStop(1, '#A78BFA')
    ctx.fillStyle = lblGrad
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }
}

// ── Cyberpunk ─────────────────────────────────────────────────────────────────
// Near-black with circuit traces, cyan/purple glow borders, glitch scanlines.

function drawCyberpunk(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#080A14'
  ctx.fillRect(0, 0, W, h)

  // Fine grid
  ctx.strokeStyle = 'rgba(0,245,255,0.05)'
  ctx.lineWidth = 0.5
  for (let gx = 0; gx < W; gx += 16) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke()
  }
  for (let gy = 0; gy < h; gy += 16) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
  }

  // Circuit traces (seeded H/V runs with junction nodes)
  const traceColor = 'rgba(0,245,255,0.18)'
  const nodeColor  = 'rgba(0,245,255,0.35)'
  const traces = [
    { x: 14,     y1: 0,         y2: h * 0.38, horiz: false },
    { x: W - 14, y1: h * 0.55,  y2: h,        horiz: false },
    { x: 22,     y1: 0,         y2: h * 0.22, horiz: false },
    { y: 14,     x1: 0,         x2: W * 0.42, horiz: true  },
    { y: h - 14, x1: W * 0.55,  x2: W,        horiz: true  },
    { y: 22,     x1: W * 0.65,  x2: W,        horiz: true  },
  ]
  ctx.lineWidth = 1
  traces.forEach(t => {
    ctx.strokeStyle = traceColor
    ctx.beginPath()
    if (t.horiz) { ctx.moveTo(t.x1, t.y); ctx.lineTo(t.x2, t.y) }
    else          { ctx.moveTo(t.x, t.y1); ctx.lineTo(t.x, t.y2) }
    ctx.stroke()
    // node at end
    ctx.fillStyle = nodeColor
    const nx = t.horiz ? t.x2 : t.x
    const ny = t.horiz ? t.y  : t.y2
    ctx.fillRect(nx - 2, ny - 2, 4, 4)
  })

  // Outer cyan glow border
  ctx.save()
  ctx.shadowColor = '#00F5FF'; ctx.shadowBlur = 12
  ctx.strokeStyle = '#00F5FF'; ctx.lineWidth = 1.5
  ctx.strokeRect(3, 3, W - 6, h - 6)
  ctx.restore()
  ctx.strokeStyle = 'rgba(191,0,255,0.4)'; ctx.lineWidth = 1
  ctx.strokeRect(7, 7, W - 14, h - 14)

  // Header
  ctx.save()
  ctx.shadowColor = '#00F5FF'; ctx.shadowBlur = 8
  ctx.fillStyle = '#00F5FF'
  ctx.font = '700 9px "Courier New",Courier,monospace'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('01 OVERRIDE 10', W / 2, PAD_TOP * 0.35)
  ctx.restore()
  ctx.fillStyle = 'rgba(191,0,255,0.7)'
  ctx.font = '600 7px "Courier New",Courier,monospace'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('SYS_ONLINE  ■■■■■', W / 2, PAD_TOP * 0.72)
  ctx.textBaseline = 'alphabetic'

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 0 })

  // Glitch scanlines over photos
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    for (let ly = py; ly < py + PHOTO_H; ly += 4) {
      ctx.fillRect(px, ly, PHOTO_W, 1)
    }
  })

  // Per-photo alternating cyan/purple glow borders
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    const clr = i % 2 === 0 ? '#00F5FF' : '#BF00FF'
    ctx.save()
    ctx.shadowColor = clr; ctx.shadowBlur = 7
    ctx.strokeStyle = clr; ctx.lineWidth = 1.5
    ctx.strokeRect(px, py, PHOTO_W, PHOTO_H)
    ctx.restore()
  })

  // Between-row circuit dividers
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row+1)*PHOTO_H + row*GAP_ROW + GAP_ROW/2
    ctx.save()
    ctx.shadowColor = '#00F5FF'; ctx.shadowBlur = 4
    ctx.strokeStyle = 'rgba(0,245,255,0.4)'; ctx.lineWidth = 1
    ctx.setLineDash([6, 3])
    ctx.beginPath(); ctx.moveTo(PAD_X, gy); ctx.lineTo(W - PAD_X, gy); ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
    // Junction node in centre
    ctx.fillStyle = 'rgba(0,245,255,0.5)'
    ctx.fillRect(W / 2 - 2, gy - 2, 4, 4)
  }

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    ctx.save()
    ctx.shadowColor = '#00F5FF'; ctx.shadowBlur = 5
    ctx.fillStyle = '#00F5FF'
    ctx.font = '11px "Courier New",Courier,monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
    ctx.restore()
  }
}

// ── Neon Club ─────────────────────────────────────────────────────────────────
// Near-black bg, hot-pink glow border, per-photo neon-colored frames.

function drawNeonClub(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#080808'
  ctx.fillRect(0, 0, W, h)

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'
  ctx.lineWidth = 0.5
  for (let gx = 0; gx < W; gx += 20) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke()
  }
  for (let gy = 0; gy < h; gy += 20) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
  }

  // Outer hot-pink glow border
  ctx.save()
  ctx.shadowColor = '#FF2D78'
  ctx.shadowBlur = 14
  ctx.strokeStyle = '#FF2D78'
  ctx.lineWidth = 2
  ctx.strokeRect(3, 3, W - 6, h - 6)
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,45,120,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(7, 7, W - 14, h - 14)

  // Header
  ctx.save()
  ctx.shadowColor = '#FF2D78'; ctx.shadowBlur = 10
  ctx.fillStyle = '#FF2D78'
  ctx.font = '900 9px "DM Sans",Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('[ VIP ACCESS ]', W / 2, PAD_TOP * 0.35)
  ctx.restore()
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '600 7px "DM Sans",Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('★  ★  ★', W / 2, PAD_TOP * 0.7)
  ctx.textBaseline = 'alphabetic'

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 1 })

  // Per-photo neon colored borders
  const neonColors = ['#FF2D78', '#00F5FF', '#B8FF3C', '#FF9900', '#C084FC']
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    const clr = neonColors[i % neonColors.length]
    ctx.save()
    ctx.shadowColor = clr; ctx.shadowBlur = 8
    ctx.strokeStyle = clr; ctx.lineWidth = 1.5
    ctx.strokeRect(px, py, PHOTO_W, PHOTO_H)
    ctx.restore()
  })

  // Between-row neon dividers
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row+1)*PHOTO_H + row*GAP_ROW + GAP_ROW/2
    ctx.save()
    ctx.shadowColor = '#FF2D78'; ctx.shadowBlur = 6
    ctx.strokeStyle = 'rgba(255,45,120,0.5)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD_X, gy); ctx.lineTo(W - PAD_X, gy); ctx.stroke()
    ctx.restore()
  }

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    ctx.save()
    ctx.shadowColor = '#FF2D78'; ctx.shadowBlur = 6
    ctx.fillStyle = '#FF2D78'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
    ctx.restore()
  }
}

// ── Festival / Ticket Stub ────────────────────────────────────────────────────
// Aged cream paper, torn-edge perforations, ADMIT ONE header, barcode footer.

function drawFestival(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  // Aged paper background
  ctx.fillStyle = '#FBF6EC'
  ctx.fillRect(0, 0, W, h)

  // Subtle paper grain (seeded noise)
  for (let i = 0; i < 200; i++) {
    ctx.globalAlpha = 0.03 + seededRand(i * 3) * 0.04
    ctx.fillStyle = seededRand(i * 3 + 1) > 0.5 ? '#8B6914' : '#3A2A10'
    const gx = seededRand(i * 3 + 2) * W
    const gy = seededRand(i * 3 + 3) * h
    ctx.fillRect(gx, gy, 1 + seededRand(i * 3 + 4) * 2, 1)
  }
  ctx.globalAlpha = 1

  // Outer border
  ctx.strokeStyle = '#2A1A08'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, W - 8, h - 8)

  // Perforation dots down both sides
  const perfY0 = 20, perfDotR = 2.5, perfGap = 10
  for (let py = perfY0; py < h - 20; py += perfGap) {
    ctx.fillStyle = '#FBF6EC'
    ctx.beginPath(); ctx.arc(4, py, perfDotR, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(W - 4, py, perfDotR, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#2A1A08'; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.arc(4, py, perfDotR, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(W - 4, py, perfDotR, 0, Math.PI * 2); ctx.stroke()
  }

  // Header band
  const hBandH = PAD_TOP - 8
  ctx.fillStyle = '#1C0F04'
  ctx.fillRect(4, 4, W - 8, hBandH)

  // ADMIT ONE
  ctx.fillStyle = '#F5C842'
  ctx.font = '900 13px "DM Sans",Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('ADMIT ONE', W / 2, 4 + hBandH * 0.38)

  ctx.fillStyle = 'rgba(245,200,66,0.5)'
  ctx.font = '600 7px "DM Sans",Arial,sans-serif'
  ctx.fillText('ROW A  ·  SEAT 1  ·  VALID THIS SESSION', W / 2, 4 + hBandH * 0.76)
  ctx.textBaseline = 'alphabetic'

  // Horizontal rule below header
  ctx.strokeStyle = '#2A1A08'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(12, PAD_TOP); ctx.lineTo(W - 12, PAD_TOP); ctx.stroke()
  ctx.strokeStyle = 'rgba(42,26,8,0.3)'; ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.moveTo(12, PAD_TOP + 2); ctx.lineTo(W - 12, PAD_TOP + 2); ctx.stroke()

  // Between-row ticket dividers
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row+1)*PHOTO_H + row*GAP_ROW + GAP_ROW/2
    ctx.strokeStyle = 'rgba(42,26,8,0.35)'; ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(14, gy); ctx.lineTo(W - 14, gy); ctx.stroke()
    ctx.setLineDash([])
    // Scissor icon in centre
    ctx.fillStyle = 'rgba(42,26,8,0.4)'
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('✂', W / 2, gy)
  }

  drawWatermarks(ctx, images, m, 0.04)
  drawPhotos(ctx, images, m, { clipRadius: 1 })

  ctx.strokeStyle = 'rgba(42,26,8,0.3)'; ctx.lineWidth = 1
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X+col*(PHOTO_W+GAP_COL), PAD_TOP+row*(PHOTO_H+GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 4, 26)
  if (label) {
    ctx.fillStyle = 'rgba(42,26,8,0.65)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + 47)
  }

  // Barcode below label
  const bcX = W * 0.18, bcW = W * 0.64, bcH = 7, bcY = fy + 56
  const barWidths = [1,2,1,3,1,1,2,1,2,1,1,3,2,1,1,2,1,3,1,2,1,1,2,1]
  const bcUnit = bcW / barWidths.reduce((a, b) => a + b, 0)
  let bx = bcX
  barWidths.forEach((bw, bi) => {
    if (bi % 2 === 0) {
      ctx.fillStyle = 'rgba(42,26,8,0.45)'
      ctx.fillRect(bx, bcY, bw * bcUnit, bcH)
    }
    bx += bw * bcUnit
  })
}

// ── Public API ────────────────────────────────────────────────────────────────

export const THEMES = [
  { id: 'classic',      label: 'MeeOpp Classic', colors: ['#C1005A', '#FFFFFF'],  draw: drawClassic       },
  { id: 'distinction',  label: 'Distinction',    colors: ['#1A1A2E', '#C9920A'],  draw: drawDistinction   },
  { id: 'yearbook',     label: 'Year Book',      colors: ['#F4EFE4', '#1C1C1C'],  draw: drawYearBook      },
  { id: 'squad',        label: 'Squad Goals',    colors: ['#E8D5FF', '#7B2FBE'],  draw: drawSquadGoals    },
  { id: 'crew',         label: 'The Crew',       colors: ['#0F1E30', '#1A6EF5'],  draw: drawCrew          },
  { id: 'progress',     label: 'Progress Saved', colors: ['#050D05', '#00FF41'],  draw: drawProgressSaved },
  { id: 'reportcard',   label: 'Report Card',    colors: ['#F7F2E8', '#1C2B5E'],  draw: drawReportCard    },
  { id: 'librarycard',  label: 'Library Card',   colors: ['#EDE0C0', '#5C3D1E'],  draw: drawLibraryCard   },
  { id: 'filmnegative', label: 'Film Negative',   colors: ['#0A0A0A', '#FFD750'],  draw: drawFilmNegative  },
  { id: 'vhs',          label: 'VHS',             colors: ['#111116', '#00F0FF'],  draw: drawVHS           },
  { id: 'retrodiner',   label: 'Retro Diner',     colors: ['#FFF3DC', '#CC1020'],  draw: drawRetroDiner    },
  { id: 'arcade',       label: 'Arcade Cabinet',  colors: ['#080818', '#FFD700'],  draw: drawArcade        },
  { id: 'kpop',         label: 'K-Pop Photocard', colors: ['#F9E8FF', '#C87DC8'],  draw: drawKpop          },
  { id: 'holographic',  label: 'Holographic',     colors: ['#FAFCFF', '#A78BFA'],  draw: drawHolographic   },
  { id: 'cyberpunk',    label: 'Cyberpunk',       colors: ['#080A14', '#00F5FF'],  draw: drawCyberpunk     },
  { id: 'neonclub',     label: 'Neon Club',       colors: ['#080808', '#FF2D78'],  draw: drawNeonClub      },
  { id: 'festival',     label: 'Festival',        colors: ['#FBF6EC', '#1C0F04'],  draw: drawFestival      },
]

export { _logo as logoImg }
export { getMetrics }
