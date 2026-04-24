import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './BoothInterior.module.css'

const TOTAL_SHOTS = 4
const COUNTDOWN_SEC = 3

export default function BoothInterior({ onPhotosReady }) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [camReady, setCamReady]   = useState(false)
  const [camError, setCamError]   = useState(null)
  const [running, setRunning]     = useState(false)
  const [countdown, setCountdown] = useState(null)  // null | 3 | 2 | 1 | 0
  const [shotIndex, setShotIndex] = useState(0)     // 0-based current shot
  const [captured, setCaptured]   = useState(0)     // photos taken so far
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
    // Mirror horizontally so the image matches what the user sees
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

            if (imgs.length < TOTAL_SHOTS) {
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
  }, [running, captureFrame, onPhotosReady])

  // Auto-start once camera is ready
  useEffect(() => {
    if (camReady && !running) {
      const t = setTimeout(runSession, 600)
      return () => clearTimeout(t)
    }
  }, [camReady, running, runSession])

  return (
    <div className={styles.interior}>
      {/* Camera flash */}
      {flash && <div className={styles.flash} />}

      {/* Side curtain edges to feel inside the booth */}
      <div className={styles.curtainEdgeLeft} />
      <div className={styles.curtainEdgeRight} />

      {/* Camera frame */}
      <div className={styles.cameraWrap}>
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
        <div className={styles.dots}>
          {[...Array(TOTAL_SHOTS)].map((_, i) => (
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

        {/* Countdown overlay */}
        {countdown !== null && countdown > 0 && (
          <div className={styles.countdownOverlay}>
            <span key={countdown} className={styles.countdownNum}>{countdown}</span>
            <span className={styles.shotLabel}>
              Shot {shotIndex + 1} / {TOTAL_SHOTS}
            </span>
          </div>
        )}

        {done && (
          <div className={styles.doneOverlay}>
            <p className={styles.doneMsg}>Printing your strip…</p>
          </div>
        )}

        {!camReady && !camError && (
          <div className={styles.loadingOverlay}>
            <p>Setting up camera…</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
