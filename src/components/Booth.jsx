import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './Booth.module.css'
import MeeOppLogo from './MeeOppLogo'

const THEMES = [
  { id: 'classic', label: '✨ Classic', color: '#BE0055' },
  { id: 'retro', label: '📽 Retro', color: '#8B7355' },
  { id: 'kawaii', label: '🌸 Kawaii', color: '#FF8FAB' },
]

const TOTAL_SHOTS = 4
const COUNTDOWN_FROM = 3

export default function Booth({ onPhotosReady, theme, setTheme, onBack }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [camReady, setCamReady] = useState(false)
  const [camError, setCamError] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | countdown | flash | done
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM)
  const [shotIndex, setShotIndex] = useState(0)
  const [photos, setPhotos] = useState([])
  const [flash, setFlash] = useState(false)

  // Start camera
  useEffect(() => {
    let active = true
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => { if (active) setCamReady(true) }
        }
      })
      .catch(err => { if (active) setCamError(err.message) })
    return () => {
      active = false
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  const runSession = useCallback(() => {
    if (phase !== 'idle') return
    setPhotos([])
    setShotIndex(0)
    setPhase('countdown')

    let shot = 0
    const captured = []

    const doShot = (shotNum) => {
      let count = COUNTDOWN_FROM
      setCountdown(count)
      setShotIndex(shotNum)

      const tick = setInterval(() => {
        count -= 1
        setCountdown(count)
        if (count <= 0) {
          clearInterval(tick)
          setFlash(true)
          setTimeout(() => {
            setFlash(false)
            const dataUrl = captureFrame()
            if (dataUrl) captured.push(dataUrl)

            shot += 1
            if (shot < TOTAL_SHOTS) {
              setTimeout(() => doShot(shot), 800)
            } else {
              setPhase('done')
              onPhotosReady(captured)
            }
          }, 300)
        }
      }, 1000)
    }

    doShot(0)
  }, [phase, captureFrame, onPhotosReady])

  return (
    <div className={styles.booth}>
      {/* Flash overlay */}
      {flash && <div className={styles.flashOverlay} />}

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.headerLogo}>
          <MeeOppLogo size={28} />
          <span>MeeOpp Booth</span>
        </div>
        <div className={styles.shotCounter}>
          {[...Array(TOTAL_SHOTS)].map((_, i) => (
            <span key={i} className={`${styles.dot} ${i < photos.length ? styles.dotFilled : ''} ${i === shotIndex && phase === 'countdown' ? styles.dotActive : ''}`} />
          ))}
        </div>
      </div>

      <div className={styles.main}>
        {/* Camera feed */}
        <div className={styles.cameraWrap}>
          <div className={`${styles.cameraFrame} ${styles[`frame_${theme}`]}`}>
            {camError ? (
              <div className={styles.camError}>
                <p>📷 Camera not available</p>
                <p className={styles.camErrorSub}>{camError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={styles.video}
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!camReady && <div className={styles.camLoading}>Loading camera…</div>}
              </>
            )}

            {/* Corner decorations based on theme */}
            <span className={`${styles.corner} ${styles.tl}`} />
            <span className={`${styles.corner} ${styles.tr}`} />
            <span className={`${styles.corner} ${styles.bl}`} />
            <span className={`${styles.corner} ${styles.br}`} />

            {/* Countdown overlay */}
            {phase === 'countdown' && (
              <div className={styles.countdownOverlay}>
                <div className={styles.countdownNumber}>{countdown > 0 ? countdown : '📸'}</div>
                <div className={styles.shotLabel}>Shot {shotIndex + 1} of {TOTAL_SHOTS}</div>
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Right panel */}
        <div className={styles.sidebar}>
          {/* Theme picker */}
          <div className={styles.themeSection}>
            <p className={styles.sectionTitle}>Frame Theme</p>
            <div className={styles.themes}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.themeBtn} ${theme === t.id ? styles.themeBtnActive : ''}`}
                  style={{ '--theme-color': t.color }}
                  onClick={() => setTheme(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          {photos.length > 0 && (
            <div className={styles.thumbSection}>
              <p className={styles.sectionTitle}>Captured</p>
              <div className={styles.thumbs}>
                {photos.map((p, i) => (
                  <img key={i} src={p} alt={`Shot ${i + 1}`} className={styles.thumb} />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className={styles.ctaArea}>
            {phase === 'idle' && (
              <button
                className={styles.snapBtn}
                onClick={runSession}
                disabled={!camReady && !camError}
              >
                {camReady || camError ? '📸 Start Session' : 'Waiting for camera…'}
              </button>
            )}
            {phase === 'countdown' && (
              <div className={styles.snapBtn} style={{ opacity: 0.6, cursor: 'default' }}>
                Get ready! 😄
              </div>
            )}
            {phase === 'done' && (
              <div className={styles.snapBtn} style={{ background: 'var(--blue)', cursor: 'default' }}>
                Developing strip… ✨
              </div>
            )}
          </div>

          <p className={styles.tip}>Smile! 4 shots will be taken automatically</p>
        </div>
      </div>
    </div>
  )
}
