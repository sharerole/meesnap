import { useRef, useEffect, useMemo } from 'react'
import { THEMES, STRIP_W, PHOTO_DIMS, stripTotalHeight } from '../lib/themes'
import styles from './ThemePreview.module.css'

function makePlaceholders(count) {
  return Array.from({ length: count }, () => {
    const c = document.createElement('canvas')
    c.width  = PHOTO_DIMS.w
    c.height = PHOTO_DIMS.h
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

// displayWidth and numPhotos are optional — defaults give the original lobby preview size.
export default function ThemePreview({ theme, displayWidth = 148, numPhotos = 2 }) {
  const canvasRef = useRef(null)
  const themeObj  = THEMES.find(t => t.id === theme) ?? THEMES[0]

  const placeholders = useMemo(() => makePlaceholders(numPhotos), [numPhotos])

  const scale    = displayWidth / STRIP_W
  const fullH    = stripTotalHeight(numPhotos)
  const displayH = Math.round(fullH * scale)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = STRIP_W
    canvas.height = fullH
    themeObj.draw(canvas.getContext('2d'), placeholders, '')
  }, [theme, themeObj, fullH, placeholders])

  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>Frame Preview</p>
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
