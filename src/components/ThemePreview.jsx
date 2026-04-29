import { useRef, useEffect, useMemo, useCallback } from 'react'
import { THEMES, stripTotalHeight, logoImg } from '../lib/themes'
import { DEFAULT_LAYOUT, getMetrics } from '../lib/layouts'
import styles from './ThemePreview.module.css'

function makePlaceholders(count, pw, ph) {
  return Array.from({ length: count }, () => {
    const c = document.createElement('canvas')
    c.width  = pw
    c.height = ph
    const ctx = c.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, c.height)
    grad.addColorStop(0, '#BEBEBE')
    grad.addColorStop(1, '#A8A8A8')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(0, 0);       ctx.lineTo(c.width, c.height); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(c.width, 0); ctx.lineTo(0, c.height);       ctx.stroke()
    return c
  })
}

// displayWidth and layout are optional — defaults give the original lobby preview size.
export default function ThemePreview({ theme, displayWidth = 148, layout = DEFAULT_LAYOUT, showHeading = true, compact = false }) {
  const canvasRef = useRef(null)
  const themeObj  = THEMES.find(t => t.id === theme) ?? THEMES[0]

  const { W, PHOTO_W, PHOTO_H, cols, rows } = getMetrics(layout)
  const numPhotos = cols * rows
  const fullH     = stripTotalHeight(layout)

  const placeholders = useMemo(
    () => makePlaceholders(numPhotos, PHOTO_W, PHOTO_H),
    [numPhotos, PHOTO_W, PHOTO_H]
  )

  const scale    = displayWidth / W
  const displayH = Math.round(fullH * scale)

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = W * dpr
    canvas.height = fullH * dpr
    canvas.style.width  = W + 'px'
    canvas.style.height = fullH + 'px'
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    themeObj.draw(ctx, placeholders, '', layout)
  }, [themeObj, fullH, W, placeholders, layout])

  useEffect(() => {
    renderCanvas()
    // If the logo PNG hasn't finished loading yet, redraw once it does so
    // the footer (which contains the logo) appears correctly.
    if (!logoImg.complete) {
      logoImg.addEventListener('load', renderCanvas)
      return () => logoImg.removeEventListener('load', renderCanvas)
    }
  }, [renderCanvas])

  return (
    <div className={`${styles.wrap} ${compact ? styles.wrapCompact : ''}`}>
      {showHeading && <p className={styles.heading}>Frame Preview</p>}
      <div className={styles.window} style={{ width: displayWidth, height: displayH }}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ transform: `scale(${scale})` }}
        />
      </div>
      <p className={styles.name}>{themeObj.label}</p>
    </div>
  )
}
