import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './PhotoStrip.module.css'
import MeeOppLogo from './MeeOppLogo'
import StickerPicker from './StickerPicker'
import { THEMES, STRIP_W, stripTotalHeight } from '../lib/themes'
import { STICKER_DEFS, makeSvgDataUrl } from '../lib/stickers'

// Pre-load all sticker images so canvas draw is synchronous
const stickerImages = {}
STICKER_DEFS.forEach(def => {
  const img = new Image()
  img.src = makeSvgDataUrl(def)
  stickerImages[def.id] = img
})

export default function PhotoStrip({ photos, theme, onRetake, onRestart }) {
  const canvasRef  = useRef(null)
  const [label, setLabel]       = useState('')
  const [stickers, setStickers] = useState([])   // { id, x, y, size }
  const [lifted, setLifted]     = useState(false) // animation: strip lifts up

  const themeObj = THEMES.find(t => t.id === theme) ?? THEMES[0]

  // Load photos as Image objects
  const loadImages = useCallback(() => {
    return new Promise(resolve => {
      const imgs = []
      let loaded = 0
      photos.forEach((src, i) => {
        const img = new Image()
        img.onload = () => {
          imgs[i] = img
          if (++loaded === photos.length) resolve(imgs)
        }
        img.src = src
      })
    })
  }, [photos])

  const renderStrip = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || photos.length === 0) return
    const imgs = await loadImages()
    const h = stripTotalHeight(imgs.length)
    canvas.width  = STRIP_W
    canvas.height = h
    const ctx = canvas.getContext('2d')
    themeObj.draw(ctx, imgs, label)

    // Composite stickers on top
    stickers.forEach(s => {
      const img = stickerImages[s.id]
      if (img?.complete) {
        ctx.drawImage(img, s.x - s.size / 2, s.y - s.size / 2, s.size, s.size)
      }
    })
  }, [photos, themeObj, label, stickers, loadImages])

  // Initial render + re-render on label/sticker change
  useEffect(() => { renderStrip() }, [renderStrip])

  // Lift animation on mount
  useEffect(() => {
    const t = setTimeout(() => setLifted(true), 200)
    return () => clearTimeout(t)
  }, [])

  function addSticker(def) {
    const h = stripTotalHeight(photos.length)
    // Random position inside the photo area (avoid footer)
    const x = 40 + Math.random() * (STRIP_W - 80)
    const y = 30 + Math.random() * (h - 100)
    setStickers(prev => [...prev, { id: def.id, x, y, size: def.defaultSize ?? 56 }])
  }

  function clearStickers() { setStickers([]) }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `meeopp-${Date.now()}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLogo}>
          <MeeOppLogo size={26} />
          <span>MeeOpp</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={onRetake}>↩ Retake</button>
          <button className={styles.ghostBtn} onClick={onRestart}>🏠 Home</button>
        </div>
      </div>

      <div className={styles.main}>
        {/* Strip display */}
        <div className={styles.stripArea}>
          <p className={styles.stripHint}>Your strip</p>
          <div className={`${styles.stripHolder} ${lifted ? styles.stripLifted : ''}`}>
            <canvas ref={canvasRef} className={styles.canvas} />
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Label */}
          <div className={styles.section}>
            <label className={styles.sectionLabel} htmlFor="strip-label">
              Add a label
            </label>
            <input
              id="strip-label"
              type="text"
              maxLength={40}
              placeholder="Class of '26 · Best friends ever"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={renderStrip}
              className={styles.input}
            />
          </div>

          {/* Stickers */}
          <div className={styles.section}>
            <div className={styles.stickerHeader}>
              <span className={styles.sectionLabel}>Stickers</span>
              {stickers.length > 0 && (
                <button className={styles.clearBtn} onClick={clearStickers}>
                  Clear all
                </button>
              )}
            </div>
            <StickerPicker onSelect={addSticker} />
          </div>

          {/* Download */}
          <button className={styles.downloadBtn} onClick={handleDownload}>
            ↓ Download Strip
          </button>

          <p className={styles.tip}>
            PNG saved at full resolution — ready to share.
          </p>
        </div>
      </div>
    </div>
  )
}
