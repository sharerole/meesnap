import { useRef, useEffect } from 'react'
import { THEMES, STRIP_W, PHOTO_DIMS, stripTotalHeight } from '../lib/themes'
import styles from './ThemePreview.module.css'

const PREVIEW_PHOTOS = 2
const DISPLAY_W      = 148
const SCALE          = DISPLAY_W / STRIP_W  // ~0.411

// Grey placeholder canvases — created once at module load
const placeholders = Array.from({ length: PREVIEW_PHOTOS }, () => {
  const c = document.createElement('canvas')
  c.width  = PHOTO_DIMS.w
  c.height = PHOTO_DIMS.h
  const ctx = c.getContext('2d')
  // Neutral grey gradient
  const grad = ctx.createLinearGradient(0, 0, 0, c.height)
  grad.addColorStop(0, '#BEBEBE')
  grad.addColorStop(1, '#A8A8A8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, c.width, c.height)
  // Crossed lines — universal "placeholder" convention
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, 0);       ctx.lineTo(c.width, c.height); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(c.width, 0); ctx.lineTo(0, c.height);       ctx.stroke()
  return c
})

export default function ThemePreview({ theme }) {
  const canvasRef = useRef(null)
  const themeObj  = THEMES.find(t => t.id === theme) ?? THEMES[0]

  const fullH    = stripTotalHeight(PREVIEW_PHOTOS)
  const displayH = Math.round(fullH * SCALE)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = STRIP_W
    canvas.height = fullH
    themeObj.draw(canvas.getContext('2d'), placeholders, '')
  }, [theme, themeObj, fullH])

  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>Frame Preview</p>

      {/* Fixed-size window — CSS clips the full-res canvas down to DISPLAY_W × displayH */}
      <div className={styles.window} style={{ width: DISPLAY_W, height: displayH }}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ transform: `scale(${SCALE})` }}
        />
      </div>

      <p className={styles.name}>{themeObj.label}</p>
    </div>
  )
}
