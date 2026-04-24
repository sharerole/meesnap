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

// Convert a pointer/touch event to canvas-space coordinates,
// accounting for any CSS scaling applied to the canvas element.
function toCanvasXY(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  const sx   = canvas.width  / rect.width
  const sy   = canvas.height / rect.height
  const src  = e.touches ? e.touches[0] : e
  return {
    x: (src.clientX - rect.left) * sx,
    y: (src.clientY - rect.top)  * sy,
  }
}

function hitTest(s, x, y) {
  const half = s.size / 2
  return x >= s.x - half && x <= s.x + half &&
         y >= s.y - half && y <= s.y + half
}

export default function PhotoStrip({ photos, theme, onRetake, onRestart }) {
  const canvasRef  = useRef(null)
  const baseRef    = useRef(null)   // offscreen canvas: theme + photos, no stickers
  const imgsRef    = useRef(null)   // cached loaded Image objects
  const dragging   = useRef(null)   // { idx, ox, oy } while dragging, else null
  const rafHandle  = useRef(null)

  const [label, setLabel]       = useState('')
  const [stickers, setStickers] = useState([])
  const [lifted, setLifted]     = useState(false)

  // Mirror stickers into a ref so event handlers always see the latest list
  // without needing to be recreated on every sticker change.
  const stickersRef = useRef(stickers)
  stickersRef.current = stickers

  const themeObj = THEMES.find(t => t.id === theme) ?? THEMES[0]

  // Load photo data-URLs into Image objects (cached so drag re-draws don't reload)
  const loadImages = useCallback(() => {
    if (imgsRef.current?.length === photos.length) {
      return Promise.resolve(imgsRef.current)
    }
    return new Promise(resolve => {
      const imgs = []
      let loaded = 0
      photos.forEach((src, i) => {
        const img = new Image()
        img.onload = () => {
          imgs[i] = img
          if (++loaded === photos.length) {
            imgsRef.current = imgs
            resolve(imgs)
          }
        }
        img.src = src
      })
    })
  }, [photos])

  // Fast composite: base strip + stickers on top (no async, no theme re-draw)
  const compositeNow = useCallback(() => {
    const canvas = canvasRef.current
    const base   = baseRef.current
    if (!canvas || !base) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(base, 0, 0)
    stickersRef.current.forEach(s => {
      const img = stickerImages[s.id]
      if (img?.complete) ctx.drawImage(img, s.x - s.size / 2, s.y - s.size / 2, s.size, s.size)
    })
  }, [])

  // Full render: load images → draw themed strip to offscreen base → composite
  const renderBase = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || photos.length === 0) return

    const imgs = await loadImages()
    const h    = stripTotalHeight(imgs.length)

    // Build / reuse the offscreen base canvas
    let base = baseRef.current
    if (!base) { base = document.createElement('canvas'); baseRef.current = base }
    base.width  = STRIP_W
    base.height = h
    themeObj.draw(base.getContext('2d'), imgs, label)

    canvas.width  = STRIP_W
    canvas.height = h

    compositeNow()
  }, [photos, themeObj, label, loadImages, compositeNow])

  // Re-render base + composite when photos, theme, or label change
  useEffect(() => { renderBase() }, [renderBase])

  // Just re-composite (instant) when sticker list changes
  useEffect(() => {
    if (baseRef.current) compositeNow()
  }, [stickers, compositeNow])

  // Lift animation
  useEffect(() => {
    const t = setTimeout(() => setLifted(true), 200)
    return () => clearTimeout(t)
  }, [])

  // Drag event handlers — attached to document so fast mouse moves don't escape
  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      const { x, y } = toCanvasXY(e, canvas)
      const { idx, ox, oy } = dragging.current

      // Clamp so sticker stays fully inside the canvas
      const half = stickersRef.current[idx].size / 2
      const cx   = Math.max(half, Math.min(canvas.width  - half, x - ox))
      const cy   = Math.max(half, Math.min(canvas.height - half, y - oy))

      stickersRef.current = stickersRef.current.map((s, i) =>
        i === idx ? { ...s, x: cx, y: cy } : s
      )

      if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
      rafHandle.current = requestAnimationFrame(compositeNow)
      e.preventDefault()
    }

    function onUp() {
      if (!dragging.current) return
      dragging.current = null
      // Commit final positions to React state (triggers one re-render)
      setStickers([...stickersRef.current])
      if (canvasRef.current) canvasRef.current.style.cursor = 'default'
    }

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('touchmove',  onMove, { passive: false })
    document.addEventListener('touchend',   onUp)
    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('touchmove',  onMove)
      document.removeEventListener('touchend',   onUp)
    }
  }, [compositeNow])

  // Canvas mousedown / touchstart — start drag if clicking a sticker
  function handleCanvasDown(e) {
    const canvas = canvasRef.current
    if (!canvas || stickersRef.current.length === 0) return
    const { x, y } = toCanvasXY(e, canvas)
    // Reverse iterate: last sticker is rendered on top
    for (let i = stickersRef.current.length - 1; i >= 0; i--) {
      const s = stickersRef.current[i]
      if (hitTest(s, x, y)) {
        dragging.current = { idx: i, ox: x - s.x, oy: y - s.y }
        canvas.style.cursor = 'grabbing'
        e.preventDefault()
        return
      }
    }
  }

  // Hover cursor — show "grab" when pointer is over a sticker
  function handleCanvasMove(e) {
    if (dragging.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const { x, y } = toCanvasXY(e, canvas)
    const over = stickersRef.current.some(s => hitTest(s, x, y))
    canvas.style.cursor = over ? 'grab' : 'default'
  }

  function addSticker(def) {
    const h = stripTotalHeight(photos.length)
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
          <MeeOppLogo height={22} />
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={onRetake}>↩ Retake</button>
          <button className={styles.ghostBtn} onClick={onRestart}>🏠 Home</button>
        </div>
      </div>

      <div className={styles.main}>
        {/* Strip display */}
        <div className={styles.stripArea}>
          <p className={styles.stripHint}>Drag stickers to reposition</p>
          <div className={`${styles.stripHolder} ${lifted ? styles.stripLifted : ''}`}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              onMouseDown={handleCanvasDown}
              onMouseMove={handleCanvasMove}
              onTouchStart={handleCanvasDown}
            />
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
              onBlur={renderBase}
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
