import { useEffect, useState } from 'react'
import styles from './BoothScene.module.css'
import MeeOppLogo from './MeeOppLogo'

const STRIP_TIMINGS = { glow: 1200, print: 2000, ready: 4800 }

const PARTICLES = [
  { x: '7%',  s: 3, d: '15s', delay: '0s'   },
  { x: '19%', s: 5, d: '20s', delay: '-6s'  },
  { x: '34%', s: 2, d: '13s', delay: '-10s' },
  { x: '51%', s: 4, d: '18s', delay: '-3s'  },
  { x: '66%', s: 3, d: '23s', delay: '-14s' },
  { x: '79%', s: 5, d: '16s', delay: '-8s'  },
  { x: '91%', s: 2, d: '12s', delay: '-2s'  },
  { x: '43%', s: 3, d: '21s', delay: '-18s' },
]

const HOW_STEPS = [
  { n: '1', title: 'Pick your frame',      desc: 'Choose a theme and layout' },
  { n: '2', title: 'Strike a pose',        desc: '3-second countdown per shot' },
  { n: '3', title: 'Download your strip',  desc: 'Add stickers, a label and save' },
]

export default function BoothScene({
  phase, stripDataUrl,
  onEnter, onCurtainsOpen, onCurtainsClosed, onPickUp,
}) {
  const [curtainOpen, setCurtainOpen] = useState(true)
  const [stripStage, setStripStage]   = useState('idle')

  useEffect(() => {
    if (phase === 'entering') {
      setCurtainOpen(false)
      const t = setTimeout(onCurtainsOpen, 1900)
      return () => clearTimeout(t)
    }
    if (phase === 'exiting') {
      setCurtainOpen(false)
      const t1 = setTimeout(() => setCurtainOpen(true), 300)
      const t2 = setTimeout(onCurtainsClosed, 1300)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    setCurtainOpen(true)
  }, [phase, onCurtainsOpen, onCurtainsClosed])

  useEffect(() => {
    if (phase !== 'revealing') { setStripStage('idle'); return }
    setStripStage('idle')
    const t1 = setTimeout(() => setStripStage('glow'),     STRIP_TIMINGS.glow)
    const t2 = setTimeout(() => setStripStage('printing'), STRIP_TIMINGS.print)
    const t3 = setTimeout(() => setStripStage('ready'),    STRIP_TIMINGS.ready)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [phase])

  const isLobby     = phase === 'lobby'
  const isRevealing = phase === 'revealing'

  return (
    <div className={styles.scene}>

      {/* Ambient background elements */}
      <div className={styles.ambientGlow} />
      <div className={styles.particles} aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={styles.particle}
            style={{ left: p.x, width: p.s, height: p.s, animationDuration: p.d, animationDelay: p.delay }}
          />
        ))}
      </div>

      {/* Pill-shaped illuminated sign — hidden during tray reveal */}
      {!isRevealing && (
        <div className={styles.pillSign}>
          <span className={styles.neonLogo}><MeeOppLogo height={20} /></span>
          <span className={styles.pillText}>Photo Booth</span>
        </div>
      )}

      {isRevealing ? (

        /* ── Tray reveal view ────────────────────────────────────────────── */
        <div className={styles.trayReveal}>
          <div className={styles.darkroomGlow} />

          {/* Safelight indicator */}
          {(() => {
            const bulbMod  = { glow: styles.safelightBulbGlow, printing: styles.safelightBulbPrint, ready: styles.safelightBulbReady }[stripStage] ?? ''
            const labelMod = { printing: styles.safelightLabelAlmost, ready: styles.safelightLabelReady }[stripStage] ?? ''
            const labelTxt = { idle: 'Developing...', glow: 'Developing...', printing: 'Printing...', ready: 'Ready' }[stripStage]
            return (
          <div className={styles.safelight}>
            <div className={`${styles.safelightBulb} ${bulbMod}`} />
            <span className={`${styles.safelightLabel} ${labelMod}`}>
              {labelTxt}
            </span>
          </div>
            )
          })()}

          {/* Output tray unit — clickable once strip is ready */}
          <div
            className={`${styles.trayUnitWrap} ${stripStage === 'ready' ? styles.trayUnitReady : ''}`}
            onClick={stripStage === 'ready' ? onPickUp : undefined}
            role={stripStage === 'ready' ? 'button' : undefined}
            tabIndex={stripStage === 'ready' ? 0 : undefined}
            onKeyDown={stripStage === 'ready' ? (e) => { if (e.key === 'Enter' || e.key === ' ') onPickUp() } : undefined}
          >
            <div className={styles.trayUnit}>
              <div className={`${styles.traySlot} ${stripStage !== 'idle' ? styles.traySlotGlow : ''}`} />
              <div className={styles.trayWindow}>
                {stripDataUrl && (
                  <img
                    src={stripDataUrl}
                    alt="Your photo strip"
                    className={`${styles.trayStrip} ${(stripStage === 'printing' || stripStage === 'ready') ? styles.trayStripOut : ''}`}
                  />
                )}
              </div>
            </div>
            {stripStage === 'ready' && (
              <p className={styles.pickupLabel}>↑ Click to pick up</p>
            )}
          </div>
        </div>

      ) : (

        /* ── Booth view ──────────────────────────────────────────────────── */
        <>
          <div className={styles.boothRow}>

            <div className={styles.boothUnit}>

              {/* LEFT: Machine panel */}
              <div className={styles.machinePanel}>

                {/* Display board — sample strips left by previous users */}
                <div className={styles.displayBoard}>
                  <div className={`${styles.boardStrip} ${styles.boardStripClassic}`}>
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                  </div>
                  <div className={`${styles.boardStrip} ${styles.boardStripMilestone}`}>
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                  </div>
                  <div className={`${styles.boardStrip} ${styles.boardStripCrew}`}>
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                  </div>
                </div>

                <div className={styles.machineFiller} />

                <div className={styles.outputSection}>
                  <span className={styles.collectLabel}>COLLECT PRINTS</span>
                  <div className={`${styles.outputSlot} ${stripStage !== 'idle' ? styles.slotGlow : ''}`} />
                  <div className={styles.outputTray}>
                    {(stripStage === 'printing' || stripStage === 'ready') && (
                      <div className={`${styles.stripInTray} ${stripStage === 'ready' ? styles.stripFull : ''}`} />
                    )}
                  </div>
                </div>

              </div>

              {/* Chrome divider */}
              <div className={styles.panelDivider} />

              {/* RIGHT: Curtained sitting area */}
              <div className={styles.curtainArea}>
                <div className={styles.curtainRod} />
                <div className={styles.interiorPreview}>
                  <div className={styles.interiorWall} />
                  <div className={styles.stool}>
                    <div className={styles.stoolSeat} />
                    <div className={styles.stoolStem} />
                    <div className={styles.stoolBase} />
                  </div>
                  <div className={styles.checkerFloor} />
                </div>
                <div className={`${styles.curtainPanel} ${curtainOpen ? styles.curtainOpen : ''}`} />
              </div>

            </div>


          </div>

          {isLobby && (
            <div className={styles.actions}>
              <button className={styles.enterBtn} onClick={onEnter}>
                Step Inside
              </button>
              <p className={styles.hint}>Choose your frame and shots once you're inside</p>
              <div className={styles.howItWorks}>
                {HOW_STEPS.map(step => (
                  <div key={step.n} className={styles.howStep}>
                    <div className={styles.howNum}>{step.n}</div>
                    <p className={styles.howTitle}>{step.title}</p>
                    <p className={styles.howDesc}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}
