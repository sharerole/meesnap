import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './PhotoStrip.module.css'
import MeeOppLogo from './MeeOppLogo'
import StickerPicker from './StickerPicker'
import { THEMES, logoReady } from '../lib/themes'
import { getMetrics } from '../lib/layouts'
import { STICKER_DEFS, makeSvgDataUrl, getStickerDrawSize } from '../lib/stickers'

const MIN_STICKER_SIZE = 20
const MAX_STICKER_SIZE = 300
const DPR = window.devicePixelRatio || 1

// Pre-load all sticker images so canvas draw is synchronous
const stickerImages = {}
STICKER_DEFS.forEach(def => {
  const img = new Image()
  img.src = makeSvgDataUrl(def)
  stickerImages[def.id] = img
})

// Convert a pointer/touch event to logical canvas coordinates,
// accounting for CSS scaling and device pixel ratio.
function toCanvasXY(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  const sx   = canvas.width  / rect.width  / DPR
  const sy   = canvas.height / rect.height / DPR
  const src  = e.touches ? e.touches[0] : e
  return {
    x: (src.clientX - rect.left) * sx,
    y: (src.clientY - rect.top)  * sy,
  }
}

// Distance between two touch points in logical canvas pixels
function touchDist(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  const sx = canvas.width  / rect.width  / DPR
  const sy = canvas.height / rect.height / DPR
  const t0 = e.touches[0], t1 = e.touches[1]
  return Math.hypot((t0.clientX - t1.clientX) * sx, (t0.clientY - t1.clientY) * sy)
}

// Midpoint between two touch points in logical canvas coordinates
function touchMidpoint(e, canvas) {
  const rect = canvas.getBoundingClientRect()
  const sx = canvas.width  / rect.width  / DPR
  const sy = canvas.height / rect.height / DPR
  const t0 = e.touches[0], t1 = e.touches[1]
  return {
    x: ((t0.clientX + t1.clientX) / 2 - rect.left) * sx,
    y: ((t0.clientY + t1.clientY) / 2 - rect.top)  * sy,
  }
}

function hitTest(s, x, y, dw, dh) {
  return x >= s.x - dw / 2 && x <= s.x + dw / 2 &&
         y >= s.y - dh / 2 && y <= s.y + dh / 2
}

function stickerSize(s) {
  const def = STICKER_DEFS.find(d => d.id === s.id)
  return def ? getStickerDrawSize(def, s.size) : { dw: s.size, dh: s.size }
}

export default function PhotoStrip({ photos, theme, layout, onRetake, onRestart }) {
  const canvasRef  = useRef(null)
  const baseRef    = useRef(null)   // offscreen canvas: theme + photos, no stickers
  const imgsRef    = useRef(null)   // cached loaded Image objects
  const dragging   = useRef(null)   // { idx, ox, oy } while dragging, else null
  const pinching   = useRef(null)   // { idx, startDist, startSize } while pinching, else null
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
    const W   = canvas.width  / DPR
    const h   = canvas.height / DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx.drawImage(base, 0, 0, W, h)
    stickersRef.current.forEach(s => {
      const img = stickerImages[s.id]
      if (!img?.complete) return
      const { dw, dh } = stickerSize(s)
      ctx.drawImage(img, s.x - dw / 2, s.y - dh / 2, dw, dh)
    })
  }, [])

  // Full render: load images → draw themed strip to offscreen base → composite
  const renderBase = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || photos.length === 0) return

    const [imgs] = await Promise.all([loadImages(), logoReady])
    const { W, h } = getMetrics(layout)

    // Build / reuse the offscreen base canvas
    let base = baseRef.current
    if (!base) { base = document.createElement('canvas'); baseRef.current = base }
    base.width  = W * DPR
    base.height = h * DPR
    const baseCtx = base.getContext('2d')
    baseCtx.setTransform(DPR, 0, 0, DPR, 0, 0)
    themeObj.draw(baseCtx, imgs, label, layout)

    canvas.width  = W * DPR
    canvas.height = h * DPR

    compositeNow()
  }, [photos, themeObj, label, layout, loadImages, compositeNow])

  // Re-render base + composite when photos, theme, layout, or label change
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

  // Drag + pinch event handlers — attached to document so fast moves don't escape
  useEffect(() => {
    function onMove(e) {
      // Pinch-to-resize: two-finger touch
      if (e.touches && e.touches.length === 2 && pinching.current) {
        const canvas = canvasRef.current
        if (!canvas) return
        const newDist = touchDist(e, canvas)
        const { idx, startDist, startSize } = pinching.current
        const scale   = newDist / startDist
        const newSize = Math.max(MIN_STICKER_SIZE, Math.min(MAX_STICKER_SIZE, startSize * scale))
        stickersRef.current = stickersRef.current.map((s, i) =>
          i === idx ? { ...s, size: newSize } : s
        )
        if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
        rafHandle.current = requestAnimationFrame(compositeNow)
        e.preventDefault()
        return
      }

      if (!dragging.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      const { x, y } = toCanvasXY(e, canvas)
      const { idx, ox, oy } = dragging.current

      // Clamp so sticker stays fully inside the canvas (logical coordinates)
      const { dw, dh } = stickerSize(stickersRef.current[idx])
      const cx = Math.max(dw / 2, Math.min(canvas.width  / DPR - dw / 2, x - ox))
      const cy = Math.max(dh / 2, Math.min(canvas.height / DPR - dh / 2, y - oy))

      stickersRef.current = stickersRef.current.map((s, i) =>
        i === idx ? { ...s, x: cx, y: cy } : s
      )

      if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
      rafHandle.current = requestAnimationFrame(compositeNow)
      e.preventDefault()
    }

    function onUp() {
      if (pinching.current) {
        pinching.current = null
        setStickers([...stickersRef.current])
        return
      }
      if (!dragging.current) return
      dragging.current = null
      // Commit final positions to React state (triggers one re-render)
      setStickers([...stickersRef.current])
      if (canvasRef.current) canvasRef.current.style.cursor = 'default'
    }

    document.addEventListener('mousemove',   onMove)
    document.addEventListener('mouseup',     onUp)
    document.addEventListener('touchmove',   onMove, { passive: false })
    document.addEventListener('touchend',    onUp)
    document.addEventListener('touchcancel', onUp)
    return () => {
      document.removeEventListener('mousemove',   onMove)
      document.removeEventListener('mouseup',     onUp)
      document.removeEventListener('touchmove',   onMove)
      document.removeEventListener('touchend',    onUp)
      document.removeEventListener('touchcancel', onUp)
    }
  }, [compositeNow])

  // Scroll-to-resize: wheel event on canvas (must be non-passive for preventDefault)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onWheel(e) {
      const { x, y } = toCanvasXY(e, canvas)
      for (let i = stickersRef.current.length - 1; i >= 0; i--) {
        const s = stickersRef.current[i]
        const { dw, dh } = stickerSize(s)
        if (hitTest(s, x, y, dw, dh)) {
          const delta   = e.deltaY > 0 ? -8 : 8
          const newSize = Math.max(MIN_STICKER_SIZE, Math.min(MAX_STICKER_SIZE, s.size + delta))
          stickersRef.current = stickersRef.current.map((st, idx) =>
            idx === i ? { ...st, size: newSize } : st
          )
          setStickers([...stickersRef.current])
          e.preventDefault()
          return
        }
      }
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [])

  // Canvas mousedown / touchstart — start drag or pinch-to-resize
  function handleCanvasDown(e) {
    const canvas = canvasRef.current
    if (!canvas) return

    // Two-finger touch: cancel any drag and start pinch-to-resize
    if (e.touches && e.touches.length === 2) {
      dragging.current = null
      if (stickersRef.current.length === 0) return
      const mid  = touchMidpoint(e, canvas)
      const dist = touchDist(e, canvas)
      for (let i = stickersRef.current.length - 1; i >= 0; i--) {
        const s = stickersRef.current[i]
        const { dw, dh } = stickerSize(s)
        // Slightly wider hit area makes pinch easier to initiate
        if (hitTest(s, mid.x, mid.y, dw * 1.5, dh * 1.5)) {
          pinching.current = { idx: i, startDist: dist, startSize: s.size }
          e.preventDefault()
          return
        }
      }
      return
    }

    if (stickersRef.current.length === 0) return
    const { x, y } = toCanvasXY(e, canvas)
    // Reverse iterate: last sticker is rendered on top
    for (let i = stickersRef.current.length - 1; i >= 0; i--) {
      const s = stickersRef.current[i]
      const { dw, dh } = stickerSize(s)
      if (hitTest(s, x, y, dw, dh)) {
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
    const over = stickersRef.current.some(s => {
      const { dw, dh } = stickerSize(s)
      return hitTest(s, x, y, dw, dh)
    })
    canvas.style.cursor = over ? 'grab' : 'default'
  }

  function addSticker(def) {
    const { W, h } = getMetrics(layout)
    const x = 40 + Math.random() * (W - 80)
    const y = 30 + Math.random() * (h - 100)
    setStickers(prev => [...prev, { id: def.id, x, y, size: def.defaultSize ?? 56 }])
  }

  function undoSticker()  { setStickers(prev => prev.slice(0, -1)) }
  function clearStickers() { setStickers([]) }

  async function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return

    const filename = `meeopp-${Date.now()}.png`

    // On iOS, <a download> saves to Files — use Web Share API instead so the
    // native share sheet appears and the user can tap "Save Image" → Photos.
    if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] })
          return
        } catch (err) {
          if (err.name === 'AbortError') return  // user dismissed sheet
          // any other error falls through to the standard download
        }
      }
    }

    const a = document.createElement('a')
    a.download = filename
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
              placeholder="Name your moment…"
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
              <span className={styles.stickerHint}>Drag · scroll or pinch to resize</span>
              {stickers.length > 0 && (
                <div className={styles.stickerActions}>
                  <button className={styles.clearBtn} onClick={undoSticker}>Undo</button>
                  {stickers.length > 1 && (
                    <button className={styles.clearBtn} onClick={clearStickers}>Clear all</button>
                  )}
                </div>
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
