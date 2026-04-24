import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './PhotoStrip.module.css'
import MeeOppLogo from './MeeOppLogo'
import StickerOverlay from './StickerOverlay'

const STRIP_W = 360
const PHOTO_H = 240
const STRIP_PADDING = 16
const FOOTER_H = 60

function drawClassicStrip(ctx, images, label) {
  const w = STRIP_W
  const photoW = w - STRIP_PADDING * 2
  const totalH = STRIP_PADDING + images.length * (PHOTO_H + STRIP_PADDING) + FOOTER_H

  // Background
  const grad = ctx.createLinearGradient(0, 0, w, totalH)
  grad.addColorStop(0, '#8C003E')
  grad.addColorStop(1, '#BE0055')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, totalH)

  // White inner strip
  ctx.fillStyle = '#FFFFFF'
  ctx.roundRect(STRIP_PADDING / 2, STRIP_PADDING / 2, w - STRIP_PADDING, totalH - STRIP_PADDING - FOOTER_H + STRIP_PADDING, 8)
  ctx.fill()

  // Photos
  images.forEach((img, i) => {
    const y = STRIP_PADDING + i * (PHOTO_H + STRIP_PADDING)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(STRIP_PADDING, y, photoW, PHOTO_H, 4)
    ctx.clip()
    ctx.drawImage(img, STRIP_PADDING, y, photoW, PHOTO_H)
    ctx.restore()
  })

  // Footer
  const footerY = totalH - FOOTER_H
  ctx.fillStyle = '#BE0055'
  ctx.fillRect(0, footerY, w, FOOTER_H)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 13px Nunito, Arial Rounded MT Bold, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MeeOpp', w / 2, footerY + 22)

  if (label) {
    ctx.font = '11px Nunito, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(label, w / 2, footerY + 40)
  }

  return totalH
}

function drawRetroStrip(ctx, images, label) {
  const w = STRIP_W
  const photoW = w - STRIP_PADDING * 2
  const totalH = STRIP_PADDING + images.length * (PHOTO_H + STRIP_PADDING) + FOOTER_H

  ctx.fillStyle = '#2A1F14'
  ctx.fillRect(0, 0, w, totalH)

  // Film edge holes
  for (let y = 10; y < totalH; y += 30) {
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.roundRect(4, y, 12, 18, 3)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(w - 16, y, 12, 18, 3)
    ctx.fill()
  }

  // Photos with sepia tone
  images.forEach((img, i) => {
    const y = STRIP_PADDING + i * (PHOTO_H + STRIP_PADDING)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(STRIP_PADDING, y, photoW, PHOTO_H, 4)
    ctx.clip()
    ctx.drawImage(img, STRIP_PADDING, y, photoW, PHOTO_H)
    // Sepia overlay
    ctx.fillStyle = 'rgba(120, 80, 20, 0.25)'
    ctx.fillRect(STRIP_PADDING, y, photoW, PHOTO_H)
    ctx.restore()

    // Date stamp
    const now = new Date()
    ctx.fillStyle = 'rgba(255, 200, 100, 0.7)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`, STRIP_PADDING + photoW - 6, y + PHOTO_H - 6)
  })

  // Footer
  const footerY = totalH - FOOTER_H
  ctx.fillStyle = '#5C3A1E'
  ctx.fillRect(0, footerY, w, FOOTER_H)
  ctx.fillStyle = '#F5C518'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('MeeOpp', w / 2, footerY + 22)

  if (label) {
    ctx.font = '10px monospace'
    ctx.fillStyle = 'rgba(245, 197, 24, 0.7)'
    ctx.fillText(label, w / 2, footerY + 40)
  }

  return totalH
}

function drawKawaiiStrip(ctx, images, label) {
  const w = STRIP_W
  const photoW = w - STRIP_PADDING * 2
  const totalH = STRIP_PADDING + images.length * (PHOTO_H + STRIP_PADDING) + FOOTER_H

  // Pastel gradient bg
  const grad = ctx.createLinearGradient(0, 0, w, totalH)
  grad.addColorStop(0, '#FFB3D9')
  grad.addColorStop(0.5, '#C8A2D8')
  grad.addColorStop(1, '#A8C8FF')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, totalH)

  // Corner stars
  ctx.font = '18px serif'
  ctx.textAlign = 'left'
  ctx.fillText('⭐', 4, 20)
  ctx.textAlign = 'right'
  ctx.fillText('💫', w - 4, 20)
  ctx.textAlign = 'left'
  ctx.fillText('🌸', 4, totalH - FOOTER_H - 4)
  ctx.textAlign = 'right'
  ctx.fillText('🌸', w - 4, totalH - FOOTER_H - 4)

  // Hearts between photos
  images.forEach((img, i) => {
    const y = STRIP_PADDING + i * (PHOTO_H + STRIP_PADDING)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(STRIP_PADDING, y, photoW, PHOTO_H, 8)
    ctx.clip()
    ctx.drawImage(img, STRIP_PADDING, y, photoW, PHOTO_H)
    // Pink overlay
    ctx.fillStyle = 'rgba(255, 100, 150, 0.08)'
    ctx.fillRect(STRIP_PADDING, y, photoW, PHOTO_H)
    ctx.restore()

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(STRIP_PADDING, y, photoW, PHOTO_H, 8)
    ctx.stroke()

    if (i < images.length - 1) {
      ctx.textAlign = 'center'
      ctx.font = '14px serif'
      ctx.fillText('♥ ♥ ♥', w / 2, y + PHOTO_H + STRIP_PADDING / 2 + 5)
    }
  })

  // Footer
  const footerY = totalH - FOOTER_H
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillRect(0, footerY, w, FOOTER_H)
  ctx.fillStyle = '#BE0055'
  ctx.font = 'bold 14px Nunito, Arial Rounded MT Bold, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MeeOpp ♡', w / 2, footerY + 22)

  if (label) {
    ctx.font = '11px Nunito, sans-serif'
    ctx.fillStyle = 'rgba(190,0,85,0.8)'
    ctx.fillText(label, w / 2, footerY + 40)
  }

  return totalH
}

export default function PhotoStrip({ photos, theme, onRetake, onRestart }) {
  const canvasRef = useRef(null)
  const [label, setLabel] = useState('')
  const [stickers, setStickers] = useState([])
  const [printed, setPrinted] = useState(false)
  const [stripH, setStripH] = useState(0)

  const renderStrip = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || photos.length === 0) return

    const imgs = []
    let loaded = 0
    photos.forEach((src, i) => {
      const img = new Image()
      img.onload = () => {
        imgs[i] = img
        loaded++
        if (loaded === photos.length) {
          const totalH = STRIP_PADDING + imgs.length * (PHOTO_H + STRIP_PADDING) + FOOTER_H
          canvas.width = STRIP_W
          canvas.height = totalH
          const ctx = canvas.getContext('2d')
          if (theme === 'classic') drawClassicStrip(ctx, imgs, label)
          else if (theme === 'retro') drawRetroStrip(ctx, imgs, label)
          else drawKawaiiStrip(ctx, imgs, label)
          setStripH(totalH)
        }
      }
      img.src = src
    })
  }, [photos, theme, label])

  useEffect(() => {
    const t = setTimeout(() => { setPrinted(true) }, 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (printed) renderStrip()
  }, [printed, renderStrip])

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `meeopp-strip-${Date.now()}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLogo}>
          <MeeOppLogo size={28} />
          <span>MeeOpp Booth</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={onRetake}>↩ Retake</button>
          <button className={styles.ghostBtn} onClick={onRestart}>🏠 Home</button>
        </div>
      </div>

      <div className={styles.main}>
        {/* Strip area */}
        <div className={styles.trayArea}>
          <div className={styles.trayLabel}>
            <span className={styles.trayArrow}>⬇</span>
            Collect your photos
          </div>
          <div className={`${styles.stripSlot} ${printed ? styles.stripOut : ''}`}>
            <div className={styles.stripWrapper} style={{ position: 'relative', width: STRIP_W }}>
              <canvas ref={canvasRef} className={styles.canvas} />
              {/* Sticker layer */}
              {stickers.map(s => (
                <div
                  key={s.id}
                  className={styles.stickerOnStrip}
                  style={{ left: s.x, top: s.y, fontSize: s.size }}
                  title="Sticker"
                >
                  {s.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Label */}
          <div className={styles.section}>
            <label className={styles.sectionTitle} htmlFor="strip-label">Add a label</label>
            <input
              id="strip-label"
              type="text"
              maxLength={40}
              placeholder="Class of '26 · Best friends · MeeOpp"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={renderStrip}
              className={styles.labelInput}
            />
          </div>

          {/* Stickers */}
          <StickerOverlay onAdd={(sticker) => setStickers(prev => [...prev, { ...sticker, id: Date.now() + Math.random() }])} />

          {/* Download */}
          <button className={styles.downloadBtn} onClick={handleDownload}>
            ⬇ Download Strip
          </button>

          <p className={styles.tip}>Your strip is ready! Download it or screenshot to share.</p>
        </div>
      </div>
    </div>
  )
}
