import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './BoothInterior.module.css'
import { THEMES } from '../lib/themes'
import { LAYOUTS } from '../lib/layouts'
import ThemePreview from './ThemePreview'
import PoseGuide from './PoseGuide'

const COUNTDOWN_SEC = 3
const RING_R    = 48
const RING_CIRC = +(2 * Math.PI * RING_R).toFixed(2)

const FILTERS = [
  { id: 'natural', label: 'Natural',  css: 'none' },
  { id: 'bw',      label: 'B & W',    css: 'grayscale(1)' },
  { id: 'sepia',   label: 'Sepia',    css: 'sepia(0.85) contrast(1.05)' },
  { id: 'faded',   label: 'Faded',    css: 'saturate(0.6) brightness(1.1) contrast(0.85)' },
  { id: 'vivid',   label: 'Vivid',    css: 'saturate(1.6) contrast(1.1)' },
  { id: 'warm',    label: 'Warm',     css: 'sepia(0.25) saturate(1.2) brightness(1.05)' },
]

function playShutter() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)()
    const sr = ac.sampleRate
    const buf = ac.createBuffer(1, Math.floor(sr * 0.12), sr)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const t = i / sr
      const e1 = Math.exp(-t * 300)
      const t2 = Math.max(0, t - 0.06)
      const e2 = Math.exp(-t2 * 400) * (t >= 0.06 ? 0.7 : 0)
      d[i] = (Math.random() * 2 - 1) * (e1 + e2) * 0.5
    }
    const src = ac.createBufferSource()
    src.buffer = buf
    const bpf = ac.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.value = 1200
    bpf.Q.value = 0.5
    const gain = ac.createGain()
    gain.gain.value = 0.8
    src.connect(bpf); bpf.connect(gain); gain.connect(ac.destination)
    src.start()
    setTimeout(() => { try { ac.close() } catch {} }, 500)
  } catch {}
}

export default function BoothInterior({ theme, setTheme, layout, setLayout, filter, setFilter, onPhotosReady, onExit }) {
  const shotCount = layout.cols * layout.rows
  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const streamRef     = useRef(null)
  const touchStartX   = useRef(null)

  const [step, setStep]           = useState('style')
  const [slideDir, setSlideDir]   = useState('right')
  const [carouselDir, setCarouselDir] = useState('right')
  const [camStarted, setCamStarted] = useState(false)
  const [camReady, setCamReady]   = useState(false)
  const [camError, setCamError]   = useState(null)
  const [running, setRunning]     = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [shotIndex, setShotIndex] = useState(0)
  const [captured, setCaptured]   = useState(0)
  const [flash, setFlash]         = useState(false)
  const [done, setDone]           = useState(false)

  const themeIdx = THEMES.findIndex(t => t.id === theme)
  const prevTheme = () => { setCarouselDir('left');  setTheme(THEMES[(themeIdx - 1 + THEMES.length) % THEMES.length].id) }
  const nextTheme = () => { setCarouselDir('right'); setTheme(THEMES[(themeIdx + 1) % THEMES.length].id) }

  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? nextTheme() : prevTheme()
    touchStartX.current = null
  }

  // Camera only initialises when camStarted becomes true
  useEffect(() => {
    if (!camStarted) return
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
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
  }, [camStarted])

  // Re-attach stream to video after step changes
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [step])

  const captureFrame = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.save()
    const activeFilter = FILTERS.find(f => f.id === filter)?.css ?? 'none'
    if (activeFilter !== 'none') ctx.filter = activeFilter
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.restore()
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [filter])

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
          playShutter()
          if (navigator.vibrate) navigator.vibrate(40)
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
    setTimeout(() => doShot(0), 2000)
  }, [running, captureFrame, onPhotosReady, shotCount])

  // Auto-start session as soon as camera is ready in shooting step
  useEffect(() => {
    if (step === 'shooting' && camReady && !running && !done) runSession()
  }, [step, camReady, running, done, runSession])

  function goToFilter() {
    setSlideDir('right')
    setCamStarted(true)
    setStep('filter')
  }

  function goBackToStyle() {
    setSlideDir('left')
    setStep('style')
  }

  // ── Style step ────────────────────────────────────────────────────────────────
  if (step === 'style') {
    return (
      <div className={styles.setupScreen}>
        <div className={styles.curtainEdgeLeft} />
        <div className={styles.curtainEdgeRight} />

        <button className={styles.exitBtn} onClick={onExit}>← Exit</button>

        <div className={`${styles.setupContent} ${slideDir === 'left' ? styles.slideInLeft : styles.slideInRight}`}>
          <p className={styles.setupHeading}>Choose your style</p>

          {/* Frame carousel */}
          <div
            className={styles.carousel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button className={styles.carouselArrow} onClick={prevTheme} aria-label="Previous frame">‹</button>
            <div className={styles.carouselCenter}>
              <div
                key={theme}
                className={carouselDir === 'right' ? styles.carouselSlideRight : styles.carouselSlideLeft}
              >
                <ThemePreview theme={theme} displayWidth={180} layout={layout} showHeading={false} />
              </div>
              <div className={styles.carouselDots}>
                {THEMES.map((t, i) => (
                  <span
                    key={t.id}
                    className={`${styles.carouselDot} ${i === themeIdx ? styles.carouselDotActive : ''}`}
                    onClick={() => { setCarouselDir('right'); setTheme(t.id) }}
                  />
                ))}
              </div>
            </div>
            <button className={styles.carouselArrow} onClick={nextTheme} aria-label="Next frame">›</button>
          </div>

          {/* Layout picker */}
          <div className={`${styles.optGroup} ${styles.layoutOptGroup}`}>
            <div className={styles.layoutInner}>
            <p className={styles.optSection}>Layout</p>
            <div className={styles.layoutRow}>
              {LAYOUTS.map(l => (
                <button
                  key={l.id}
                  className={`${styles.layoutBtn} ${layout.id === l.id ? styles.layoutBtnActive : ''}`}
                  onClick={() => setLayout(l)}
                >
                  <div
                    className={styles.layoutIcon}
                    style={{
                      gridTemplateColumns: `repeat(${l.cols}, 1fr)`,
                      gridTemplateRows: `repeat(${l.rows}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: l.cols * l.rows }).map((_, i) => (
                      <div key={i} className={styles.layoutCell} />
                    ))}
                  </div>
                  <span className={styles.layoutLabel}>{l.label}</span>
                </button>
              ))}
            </div>
            </div>
          </div>

          <div className={styles.startWrap}>
            <button className={styles.startBtn} onClick={goToFilter}>Ready? Go! →</button>
            <p className={styles.startNote}>{shotCount} shots · {COUNTDOWN_SEC} sec each</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Filter step ───────────────────────────────────────────────────────────────
  if (step === 'filter') {
    return (
      <div className={styles.setupScreen}>
        <div className={styles.curtainEdgeLeft} />
        <div className={styles.curtainEdgeRight} />

        <button className={styles.exitBtn} onClick={goBackToStyle}>← Back</button>

        <div className={`${styles.setupContent} ${slideDir === 'right' ? styles.slideInRight : styles.slideInLeft}`}>
          <p className={styles.setupHeading}>Choose your filter</p>

          <div className={styles.filterCamWrap}>
            {camError ? (
              <div className={styles.errorState}>
                <p className={styles.errorIcon}>📷</p>
                <p>Camera unavailable</p>
                <p className={styles.errorSub}>{camError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={styles.filterVideo}
                  style={{ transform: 'scaleX(-1)', filter: FILTERS.find(f => f.id === filter)?.css ?? 'none' }}
                />
                {!camReady && <div className={styles.loadingOverlay}><p>Setting up camera…</p></div>}
              </>
            )}
          </div>

          <div className={styles.optGroup}>
            <p className={styles.optSection}>Filter</p>
            <div className={styles.filterGrid}>
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  className={`${styles.filterChip} ${filter === f.id ? styles.filterChipActive : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.startWrap}>
            <button className={styles.startBtn} onClick={() => setStep('shooting')}>Smile! 📸</button>
            <p className={styles.startNote}>{shotCount} shots · {COUNTDOWN_SEC} sec each</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Shooting step ─────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.interior} ${styles.slideInRight}`}>
      {flash && <div className={styles.flash} />}
      <div className={styles.curtainEdgeLeft} />
      <div className={styles.curtainEdgeRight} />

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
            style={{
              transform: 'scaleX(-1)',
              filter: FILTERS.find(f => f.id === filter)?.css ?? 'none',
            }}
          />
        )}

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

        <PoseGuide shotIndex={shotIndex} visible={countdown !== null && countdown > 0} />

        {countdown !== null && countdown > 0 && (
          <div className={styles.countdownOverlay}>
            <div className={styles.ringWrap}>
              <div className={styles.ringSvgOuter}>
                <svg viewBox="0 0 120 120" className={styles.ringSvg}>
                  <circle cx="60" cy="60" r={RING_R} className={styles.ringTrack} />
                  <circle
                    cx="60" cy="60" r={RING_R}
                    className={styles.ringProgress}
                    style={{
                      strokeDasharray:  RING_CIRC,
                      strokeDashoffset: RING_CIRC * (COUNTDOWN_SEC - countdown + 1) / COUNTDOWN_SEC,
                    }}
                  />
                  <g className={styles.apertureRing}>
                    {[0, 60, 120, 180, 240, 300].map(deg => (
                      <line key={deg} x1="60" y1="2" x2="60" y2="9"
                        transform={`rotate(${deg} 60 60)`}
                        className={styles.ringTick}
                      />
                    ))}
                  </g>
                </svg>
                <span key={countdown} className={styles.ringNum}>{countdown}</span>
              </div>
              <span className={styles.shotLabel}>Shot {shotIndex + 1} / {shotCount}</span>
            </div>
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
