import { useEffect, useState } from 'react'
import styles from './BoothScene.module.css'
import MeeOppLogo from './MeeOppLogo'

const STRIP_TIMINGS = { glow: 1200, print: 2000, ready: 4800 }

export default function BoothScene({
  phase, stripDataUrl,
  onEnter, onCurtainsOpen, onCurtainsClosed, onPickUp,
}) {
  const [curtainOpen, setCurtainOpen] = useState(true)
  const [stripStage, setStripStage]   = useState('idle')

  useEffect(() => {
    if (phase === 'entering') {
      setCurtainOpen(false)
      const t = setTimeout(onCurtainsOpen, 950)
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

      {/* Pill-shaped illuminated sign */}
      <div className={styles.pillSign}>
        <MeeOppLogo height={20} />
        <span className={styles.pillText}>Photo Booth</span>
      </div>

      {isRevealing ? (

        /* ── Tray reveal view ────────────────────────────────────────────── */
        <div className={styles.trayReveal}>
          <div className={styles.darkroomGlow} />

          {/* Film-frame progress */}
          <div className={styles.filmStrip}>
            {[...Array(8)].map((_, i) => {
              const filled = { idle: 2, glow: 4, printing: 6, ready: 8 }[stripStage] ?? 0
              return (
                <div
                  key={i}
                  className={`${styles.filmFrame} ${i < filled ? styles.filmFrameFilled : ''}`}
                />
              )
            })}
          </div>

          {/* Output tray unit */}
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
            <button className={styles.pickupBtn} onClick={onPickUp}>
              Pick up →
            </button>
          )}
        </div>

      ) : (

        /* ── Booth view ──────────────────────────────────────────────────── */
        <>
          <div className={styles.boothRow}>

            <div className={styles.boothUnit}>

              {/* LEFT: Machine panel */}
              <div className={styles.machinePanel}>

                {/* Brand box with MeeOpp logo */}
                <div className={styles.brandBox}>
                  <MeeOppLogo height={16} />
                </div>

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
                  <div className={`${styles.boardStrip} ${styles.boardStripSquad}`}>
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                    <div className={styles.boardPhoto} />
                  </div>
                </div>

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
            </div>
          )}
        </>
      )}

    </div>
  )
}
