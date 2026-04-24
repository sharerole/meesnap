import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './BoothInterior.module.css'
import { THEMES } from '../lib/themes'
import ThemePreview from './ThemePreview'

const COUNTDOWN_SEC = 3

export default function BoothInterior({ theme, setTheme, shotCount, setShotCount, onPhotosReady }) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [camReady, setCamReady]   = useState(false)
  const [camError, setCamError]   = useState(null)
  const [running, setRunning]     = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [shotIndex, setShotIndex] = useState(0)
  const [captured, setCaptured]   = useState(0)
  const [flash, setFlash]         = useState(false)
  const [done, setDone]           = useState(false)

  // Acquire camera
  useEffect(() => {
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
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
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.restore()
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  const runSession = useCallback(() => {
    if (running) return
    setRunning(true)
    setCaptured(0)

    const imgs = []

    const doShot = (shotNum) => {
      setShotIndex(shotNum)
      let count = COUNTDOWN_SEC
      setCountdown(count)

      const tick = setInterval(() => {
        count -= 1
        setCountdown(count)
        if (count <= 0) {
          clearInterval(tick)
          setFlash(true)
          setTimeout(() => {
            setFlash(false)
            const dataUrl = captureFrame()
            if (dataUrl) imgs.push(dataUrl)
            setCaptured(imgs.length)
            setCountdown(null)

            if (imgs.length < shotCount) {
              setTimeout(() => doShot(shotNum + 1), 900)
            } else {
              setDone(true)
              setTimeout(() => onPhotosReady(imgs), 1200)
            }
          }, 300)
        }
      }, 1000)
    }

    doShot(0)
  }, [running, captureFrame, onPhotosReady, shotCount])

  const inSetup = !running && !done

  return (
    <div className={`${styles.interior} ${inSetup ? styles.setupMode : ''}`}>
      {flash && <div className={styles.flash} />}

      <div className={styles.curtainEdgeLeft} />
      <div className={styles.curtainEdgeRight} />

      {/* Camera */}
      <div className={`${styles.cameraWrap} ${inSetup ? styles.cameraWrapSetup : ''}`}>
        {camError ? (
          <div className={styles.errorState}>
            <p className={styles.errorIcon}>📷</p>
            <p>Camera unavailable</p>
            <p className={styles.errorSub}>{camError}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {/* Shot progress dots */}
        {running && (
          <div className={styles.dots}>
            {[...Array(shotCount)].map((_, i) => (
              <span
                key={i}
                className={`
                  ${styles.dot}
                  ${i < captured ? styles.dotDone : ''}
                  ${i === shotIndex && countdown !== null ? styles.dotActive : ''}
                `}
              />
            ))}
          </div>
        )}

        {/* Countdown overlay */}
        {countdown !== null && countdown > 0 && (
          <div className={styles.countdownOverlay}>
            <span key={countdown} className={styles.countdownNum}>{countdown}</span>
            <span className={styles.shotLabel}>
              Shot {shotIndex + 1} / {shotCount}
            </span>
          </div>
        )}

        {done && (
          <div className={styles.doneOverlay}>
            <p className={styles.doneMsg}>Printing your strip…</p>
          </div>
        )}

        {!camReady && !camError && !running && (
          <div className={styles.loadingOverlay}>
            <p>Setting up camera…</p>
          </div>
        )}
      </div>

      {/* Options panel — visible only in setup mode */}
      {inSetup && (
        <div className={styles.optionsPanel}>

          {/* Live frame preview — updates as you pick a theme */}
          <div className={styles.previewWrap}>
            <ThemePreview theme={theme} displayWidth={140} numPhotos={2} />
          </div>

          <p className={styles.optSection}>Frame</p>
          <div className={styles.themeGrid}>
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`${styles.themeChip} ${theme === t.id ? styles.themeChipActive : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <span
                  className={styles.chipSwatch}
                  style={{ background: `linear-gradient(135deg, ${t.colors[0]} 0%, ${t.colors[1]} 100%)` }}
                />
                <span className={styles.chipLabel}>{t.label}</span>
              </button>
            ))}
          </div>

          <p className={styles.optSection}>Shots</p>
          <div className={styles.shotRow}>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`${styles.shotBtn} ${shotCount === n ? styles.shotBtnActive : ''}`}
                onClick={() => setShotCount(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <div className={styles.startWrap}>
            {camReady ? (
              <button className={styles.startBtn} onClick={runSession}>
                Start
              </button>
            ) : (
              <p className={styles.camWait}>Setting up camera…</p>
            )}
            <p className={styles.startNote}>{shotCount} shots · {COUNTDOWN_SEC}s each</p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
