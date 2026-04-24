// Canvas draw functions for each photo strip theme.
// Each draw() receives (ctx, images[], label) and renders to ctx.canvas.

const W = 360
const PHOTO_W = 318
const PHOTO_H = 238
const PAD_X = (W - PHOTO_W) / 2   // 21
const PAD_TOP = 20
const GAP = 10
const FOOTER_H = 62

export function stripTotalHeight(numPhotos) {
  return PAD_TOP + numPhotos * PHOTO_H + (numPhotos - 1) * GAP + PAD_TOP + FOOTER_H
}

// Seeded pseudo-random for deterministic star fields
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

function drawCornerEyes(ctx, cx, cy, r) {
  ctx.fillStyle = '#BE0055'
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'white'
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.08, r * 0.27, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.08, r * 0.27, 0, Math.PI * 2); ctx.fill()
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

// ── Classic ──────────────────────────────────────────────────────────────────

function drawClassic(ctx, images, label) {
  const h = stripTotalHeight(images.length)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, h)

  // Thick magenta border
  ctx.strokeStyle = '#BE0055'
  ctx.lineWidth = 10
  ctx.strokeRect(5, 5, W - 10, h - 10)

  // Hairline inner border
  ctx.strokeStyle = 'rgba(190,0,85,0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(13, 13, W - 26, h - 26)

  // Faint MeeOpp eyes watermark behind each photo
  ctx.globalAlpha = 0.04
  images.forEach((_, i) => {
    const cy = PAD_TOP + i * (PHOTO_H + GAP) + PHOTO_H / 2
    drawCornerEyes(ctx, W / 2, cy, 40)
  })
  ctx.globalAlpha = 1

  // Corner MeeOpp eye stamps
  ;[
    [24, 24], [W - 24, 24], [24, h - 24], [W - 24, h - 24],
  ].forEach(([cx, cy]) => drawCornerEyes(ctx, cx, cy, 9))

  drawPhotos(ctx, images, { clipRadius: 2 })

  // Footer
  const fy = h - FOOTER_H
  ctx.fillStyle = '#BE0055'
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 18px "Arial Rounded MT Bold",Arial,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MeeOpp', W / 2, fy + 26)
  if (label) {
    ctx.font = '12px "Arial Rounded MT Bold",Arial,sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.fillText(label, W / 2, fy + 46)
  }
}

// ── Wizard Quest ──────────────────────────────────────────────────────────────

function drawWizard(ctx, images, label) {
  const h = stripTotalHeight(images.length)
  ctx.fillStyle = '#1A1A2E'
  ctx.fillRect(0, 0, W, h)

  // Gold outer border
  ctx.strokeStyle = '#F5C518'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  // Gold hairline inner border
  ctx.strokeStyle = 'rgba(245,197,24,0.35)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, W - 28, h - 28)

  // Gold dot pattern in photo gaps
  ctx.fillStyle = 'rgba(245,197,24,0.45)'
  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    for (let x = 24; x < W - 24; x += 16) {
      ctx.beginPath(); ctx.arc(x, gy, 1.5, 0, Math.PI * 2); ctx.fill()
    }
  })

  // Eight-point gold stars in corners
  ctx.fillStyle = '#F5C518'
  ;[[26, 26], [W - 26, 26], [26, h - 26], [W - 26, h - 26]].forEach(([cx, cy]) =>
    drawEightPointStar(ctx, cx, cy, 9, 4)
  )

  drawPhotos(ctx, images, { clipRadius: 2 })

  // Thin gold outline on each photo
  ctx.strokeStyle = 'rgba(245,197,24,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.strokeRect(PAD_X, y, PHOTO_W, PHOTO_H)
  })

  // Footer
  const fy = h - FOOTER_H
  ctx.fillStyle = '#F5C518'
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.fillStyle = '#1A1A2E'
  ctx.font = 'bold 18px serif'
  ctx.textAlign = 'center'
  ctx.fillText('MeeOpp', W / 2, fy + 26)
  if (label) {
    ctx.font = '12px serif'
    ctx.fillStyle = 'rgba(26,26,46,0.75)'
    ctx.fillText(label, W / 2, fy + 46)
  }
}

// ── Space Explorer ────────────────────────────────────────────────────────────

function drawSpace(ctx, images, label) {
  const h = stripTotalHeight(images.length)
  ctx.fillStyle = '#060614'
  ctx.fillRect(0, 0, W, h)

  // Deterministic star field
  for (let s = 0; s < 70; s++) {
    ctx.fillStyle = `rgba(255,255,255,${0.25 + seededRand(s * 7) * 0.55})`
    ctx.beginPath()
    ctx.arc(seededRand(s * 3) * W, seededRand(s * 11) * h, seededRand(s * 5) * 1.4 + 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Electric blue border
  ctx.strokeStyle = '#1B6FD4'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, h - 8)

  // Glow inner hairline
  ctx.shadowColor = '#4A9FFF'
  ctx.shadowBlur = 10
  ctx.strokeStyle = '#4A9FFF'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, W - 28, h - 28)
  ctx.shadowBlur = 0

  // Orbit ring corners
  ;[[26, 26], [W - 26, 26], [26, h - 26], [W - 26, h - 26]].forEach(([cx, cy]) => {
    ctx.strokeStyle = '#1B6FD4'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.ellipse(cx, cy, 14, 8, -0.4, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = '#4A9FFF'
    ctx.beginPath(); ctx.arc(cx + 10, cy - 5, 3, 0, Math.PI * 2); ctx.fill()
  })

  drawPhotos(ctx, images, { clipRadius: 2 })

  // Blue tint overlay on photos
  ctx.globalAlpha = 0.07
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.fillStyle = '#1B6FD4'
    ctx.fillRect(PAD_X, y, PHOTO_W, PHOTO_H)
  })
  ctx.globalAlpha = 1

  // Photo outlines
  ctx.strokeStyle = 'rgba(74,159,255,0.4)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    ctx.strokeRect(PAD_X, PAD_TOP + i * (PHOTO_H + GAP), PHOTO_W, PHOTO_H)
  })

  // Footer
  const fy = h - FOOTER_H
  const grad = ctx.createLinearGradient(0, fy, W, fy)
  grad.addColorStop(0, '#090920'); grad.addColorStop(1, '#0F2050')
  ctx.fillStyle = grad
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.shadowColor = '#4A9FFF'; ctx.shadowBlur = 8
  ctx.fillStyle = '#4A9FFF'
  ctx.font = 'bold 18px "Arial Rounded MT Bold",Arial,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MeeOpp', W / 2, fy + 26)
  ctx.shadowBlur = 0
  if (label) {
    ctx.font = '12px "Arial Rounded MT Bold",Arial,sans-serif'
    ctx.fillStyle = 'rgba(74,159,255,0.75)'
    ctx.fillText(label, W / 2, fy + 46)
  }
}

// ── Kawaii Squad ──────────────────────────────────────────────────────────────

function drawKawaii(ctx, images, label) {
  const h = stripTotalHeight(images.length)
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#FFF0F8'); grad.addColorStop(1, '#EEE0FF')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, h)

  // Rounded pink border
  ctx.strokeStyle = '#FF6BAD'
  ctx.lineWidth = 10
  ctx.beginPath(); ctx.roundRect(5, 5, W - 10, h - 10, 16); ctx.stroke()

  // Dashed inner border
  ctx.strokeStyle = 'rgba(190,0,85,0.25)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])
  ctx.beginPath(); ctx.roundRect(16, 16, W - 32, h - 32, 10); ctx.stroke()
  ctx.setLineDash([])

  // Corner MeeOpp eye stamps
  ;[[26, 26], [W - 26, 26], [26, h - 26], [W - 26, h - 26]].forEach(([cx, cy]) =>
    drawCornerEyes(ctx, cx, cy, 11)
  )

  // Heart dividers between photos
  images.forEach((_, i) => {
    if (i === images.length - 1) return
    const gy = PAD_TOP + (i + 1) * PHOTO_H + i * GAP + GAP / 2
    ctx.fillStyle = '#BE0055'
    ;[-18, 0, 18].forEach(offset => {
      const hx = W / 2 + offset, hy = gy, s = 4
      ctx.beginPath()
      ctx.moveTo(hx, hy + s * 0.3)
      ctx.bezierCurveTo(hx, hy, hx - s, hy, hx - s, hy - s * 0.5)
      ctx.bezierCurveTo(hx - s, hy - s * 1.2, hx, hy - s, hx, hy - s * 0.5)
      ctx.bezierCurveTo(hx, hy - s, hx + s, hy - s * 1.2, hx + s, hy - s * 0.5)
      ctx.bezierCurveTo(hx + s, hy, hx, hy, hx, hy + s * 0.3)
      ctx.fill()
    })
  })

  drawPhotos(ctx, images, { clipRadius: 6 })

  // Pink tint + rounded border on photos
  ctx.globalAlpha = 0.05
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.fillStyle = '#FF6BAD'
    ctx.beginPath(); ctx.roundRect(PAD_X, y, PHOTO_W, PHOTO_H, 6); ctx.fill()
  })
  ctx.globalAlpha = 1
  ctx.strokeStyle = 'rgba(255,107,173,0.5)'
  ctx.lineWidth = 1.5
  images.forEach((_, i) => {
    const y = PAD_TOP + i * (PHOTO_H + GAP)
    ctx.beginPath(); ctx.roundRect(PAD_X, y, PHOTO_W, PHOTO_H, 6); ctx.stroke()
  })

  // Footer
  const fy = h - FOOTER_H
  ctx.fillStyle = 'rgba(255,107,173,0.12)'
  ctx.fillRect(0, fy, W, FOOTER_H)
  ctx.strokeStyle = 'rgba(255,107,173,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke()
  ctx.fillStyle = '#BE0055'
  ctx.font = 'bold 18px "Arial Rounded MT Bold",Arial,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MeeOpp ♡', W / 2, fy + 26)
  if (label) {
    ctx.font = '12px "Arial Rounded MT Bold",Arial,sans-serif'
    ctx.fillStyle = 'rgba(190,0,85,0.7)'
    ctx.fillText(label, W / 2, fy + 46)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const THEMES = [
  { id: 'classic', label: 'MeeOpp Classic',  colors: ['#BE0055', '#FFFFFF'],  draw: drawClassic },
  { id: 'wizard',  label: 'Wizard Quest',    colors: ['#1A1A2E', '#F5C518'],  draw: drawWizard  },
  { id: 'space',   label: 'Space Explorer',  colors: ['#060614', '#1B6FD4'],  draw: drawSpace   },
  { id: 'kawaii',  label: 'Kawaii Squad',    colors: ['#FFF0F8', '#FF6BAD'],  draw: drawKawaii  },
]

export const STRIP_W = W
