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
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(28,43,94,0.6)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
  drawLogo(ctx, W / 2, fy + 10, 26)

  if (label) {
    ctx.fillStyle = 'rgba(92,61,30,0.6)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
  drawLogo(ctx, W / 2, fy + 10, 26)
  if (label) {
    ctx.fillStyle = 'rgba(255,215,80,0.65)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
  drawLogo(ctx, W / 2, fy + 10, 26)
  if (label) {
    ctx.fillStyle = 'rgba(0,240,255,0.75)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
  }
}

// ── Polaroid ──────────────────────────────────────────────────────────────────
// Warm cream, white polaroid frames (thick bottom caption border) under each photo.

function drawPolaroid(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  ctx.fillStyle = '#F8F3EB'
  ctx.fillRect(0, 0, W, h)

  // Subtle linen texture
  ctx.strokeStyle = 'rgba(160,130,90,0.055)'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 14) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(120,100,70,0.22)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(5, 5, W - 10, h - 10)

  drawQuote(ctx, 'Just like the old days.', 'rgba(100,75,45,0.65)', W, true)

  // White polaroid frames (drawn before photos so photos sit on top)
  const bS = 3, bT = 2, bB = 10
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 6; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2
    ctx.fillStyle = '#FEFEFE'
    ctx.fillRect(px - bS, py - bT, PHOTO_W + bS * 2, PHOTO_H + bT + bB)
    ctx.restore()
  })

  drawPhotos(ctx, images, m, { clipRadius: 0 })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)
  if (label) {
    ctx.fillStyle = 'rgba(100,75,45,0.6)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
  drawLogo(ctx, W / 2, fy + 10, 26)
  if (label) {
    ctx.fillStyle = 'rgba(204,16,32,0.7)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
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
  drawLogo(ctx, W / 2, fy + 10, 26)
  if (label) {
    ctx.fillStyle = 'rgba(255,215,0,0.8)'
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
  }
}

// ── Game Boy ──────────────────────────────────────────────────────────────────
// Four-shade green palette, chunky bezel, dot-matrix LCD lines over photos.

function drawGameBoy(ctx, images, label, layout = DEFAULT_LAYOUT) {
  const m = getMetrics(layout)
  const { W, h, PAD_X, PHOTO_W, PHOTO_H, GAP_ROW, GAP_COL, cols, rows } = m

  const GB = { light: '#9BBC0F', mid1: '#8BAC0F', mid2: '#306230', dark: '#0F380F' }

  ctx.fillStyle = GB.light
  ctx.fillRect(0, 0, W, h)

  // Dot-matrix background texture
  ctx.fillStyle = 'rgba(15,56,15,0.04)'
  for (let gx = 0; gx < W; gx += 3)
    for (let gy = 0; gy < h; gy += 3)
      ctx.fillRect(gx, gy, 1, 1)

  // Chunky bezel
  ctx.fillStyle = GB.mid1
  ctx.fillRect(0, 0, W, 7); ctx.fillRect(0, h-7, W, 7)
  ctx.fillRect(0, 0, 7, h); ctx.fillRect(W-7, 0, 7, h)
  ctx.strokeStyle = GB.mid2; ctx.lineWidth = 3
  ctx.strokeRect(9, 9, W - 18, h - 18)

  // Header
  ctx.fillStyle = GB.dark
  ctx.font = '700 9px "Courier New",Courier,monospace'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('GAME BOY  ◆  PHOTO', W / 2, PAD_TOP * 0.45)
  ctx.textBaseline = 'alphabetic'

  drawPhotos(ctx, images, m, { clipRadius: 0 })

  // LCD pixel-row lines over photos
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    const px = PAD_X + col * (PHOTO_W + GAP_COL)
    const py = PAD_TOP + row * (PHOTO_H + GAP_ROW)
    ctx.fillStyle = GB.light
    for (let ly = py; ly < py + PHOTO_H; ly += 3) {
      ctx.globalAlpha = 0.15
      ctx.fillRect(px, ly, PHOTO_W, 1)
    }
    ctx.globalAlpha = 1
  })

  // Between-row separators
  for (let row = 0; row < rows - 1; row++) {
    const gy = PAD_TOP + (row+1)*PHOTO_H + row*GAP_ROW + GAP_ROW/2
    ctx.strokeStyle = GB.mid2; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(PAD_X+4, gy); ctx.lineTo(W-PAD_X-4, gy); ctx.stroke()
  }

  ctx.strokeStyle = GB.mid2; ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const col = i % cols; const row = Math.floor(i / cols)
    ctx.strokeRect(PAD_X+col*(PHOTO_W+GAP_COL), PAD_TOP+row*(PHOTO_H+GAP_ROW), PHOTO_W, PHOTO_H)
  })

  const fy = h - FOOTER_H
  drawLogo(ctx, W / 2, fy + 10, 26)
  if (label) {
    ctx.fillStyle = GB.dark
    ctx.font = '11px "DM Sans",Arial,sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, fy + FOOTER_H * 0.74)
  }
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
  { id: 'filmnegative', label: 'Film Negative',  colors: ['#0A0A0A', '#FFD750'],  draw: drawFilmNegative  },
  { id: 'vhs',          label: 'VHS',            colors: ['#111116', '#00F0FF'],  draw: drawVHS           },
  { id: 'polaroid',     label: 'Polaroid',       colors: ['#F8F3EB', '#FEFEFE'],  draw: drawPolaroid      },
  { id: 'retrodiner',   label: 'Retro Diner',    colors: ['#FFF3DC', '#CC1020'],  draw: drawRetroDiner    },
  { id: 'arcade',       label: 'Arcade Cabinet', colors: ['#080818', '#FFD700'],  draw: drawArcade        },
  { id: 'gameboy',      label: 'Game Boy',       colors: ['#9BBC0F', '#0F380F'],  draw: drawGameBoy       },
]

export { _logo as logoImg }
export { getMetrics }
