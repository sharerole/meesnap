import { useEffect, useState } from 'react'
import styles from './BoothScene.module.css'
import MeeOppLogo from './MeeOppLogo'
import ThemePreview from './ThemePreview'
import { THEMES } from '../lib/themes'

const STRIP_TIMINGS = { glow: 1200, print: 2000, ready: 4800 }

export default function BoothScene({
  phase, theme, setTheme,
  onEnter, onCurtainsOpen, onCurtainsClosed, onPickUp,
}) {
  // Curtain starts open in lobby (bunched to one side)
  const [curtainOpen, setCurtainOpen] = useState(true)
  const [stripStage, setStripStage]   = useState('idle')

  // Curtain choreography
  useEffect(() => {
    if (phase === 'entering') {
      // Curtain sweeps closed as user steps in
      setCurtainOpen(false)
      const t = setTimeout(onCurtainsOpen, 950)
      return () => clearTimeout(t)
    }
    if (phase === 'exiting') {
      // Booth reappears with curtain closed, then it opens (user steps out)
      setCurtainOpen(false)
      const t1 = setTimeout(() => setCurtainOpen(true), 300)
      const t2 = setTimeout(onCurtainsClosed, 1300)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    // lobby + revealing: curtain open (bunched to side)
    setCurtainOpen(true)
  }, [phase, onCurtainsOpen, onCurtainsClosed])

  // Strip reveal sequence
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

      {/* ── Pill-shaped illuminated sign ── */}
      <div className={styles.pillSign}>
        <MeeOppLogo size={22} />
        <span className={styles.pillText}>MeeOpp Photo Booth</span>
      </div>

      {/* ── Booth row: machine + theme preview side by side ── */}
      <div className={styles.boothRow}>

      {/* ── Main booth unit (chrome frame wraps both panels) ── */}
      <div className={styles.boothUnit}>

        {/* LEFT: Machine panel */}
        <div className={styles.machinePanel}>

          {/* MeeOpp brand box (top of panel — replaces the "PHOTOS" poster) */}
          <div className={styles.brandBox}>
            <MeeOppLogo size={20} />
            <span className={styles.brandName}>MeeOpp</span>
          </div>

          {/* Theme picker in lobby, else a decorative filler */}
          {isLobby ? (
            <div className={styles.themeSection}>
              <p className={styles.themeTitle}>Choose frame</p>
              <div className={styles.themeList}>
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    className={`${styles.themeOpt} ${theme === t.id ? styles.themeOptActive : ''}`}
                    onClick={() => setTheme(t.id)}
                  >
                    <span className={styles.themeDots}>
                      <span style={{ background: t.colors[0] }} />
                      <span style={{ background: t.colors[1] }} />
                    </span>
                    <span className={styles.themeOptLabel}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.machineFiller} />
          )}

          {/* Output section — slot + tray */}
          <div className={styles.outputSection}>
            <span className={styles.collectLabel}>COLLECT PRINTS</span>
            {/* Horizontal slot opening */}
            <div className={`${styles.outputSlot} ${stripStage !== 'idle' ? styles.slotGlow : ''}`} />
            {/* Tray: contains the strip so it can't fall */}
            <div className={styles.outputTray}>
              {(stripStage === 'printing' || stripStage === 'ready') && (
                <div
                  className={`${styles.stripInTray} ${stripStage === 'ready' ? styles.stripFull : ''}`}
                />
              )}
            </div>
          </div>

        </div>

        {/* Chrome divider between the two panels */}
        <div className={styles.panelDivider} />

        {/* RIGHT: Curtained sitting area */}
        <div className={styles.curtainArea}>

          {/* Curtain rod */}
          <div className={styles.curtainRod} />

          {/* Interior — visible through parted curtain */}
          <div className={styles.interiorPreview}>
            <div className={styles.interiorWall} />
            {/* Simple CSS stool */}
            <div className={styles.stool}>
              <div className={styles.stoolSeat} />
              <div className={styles.stoolStem} />
              <div className={styles.stoolBase} />
            </div>
            {/* Checkered floor */}
            <div className={styles.checkerFloor} />
          </div>

          {/* Single curtain panel — bunches to one side when open */}
          <div className={`${styles.curtainPanel} ${curtainOpen ? styles.curtainOpen : ''}`} />

        </div>

      </div>{/* end boothUnit */}

      {/* Theme preview — lobby only, shown to the right of the booth */}
      {isLobby && <ThemePreview theme={theme} />}

      </div>{/* end boothRow */}

      {/* ── Bottom actions ── */}
      {isLobby && (
        <div className={styles.actions}>
          <button className={styles.enterBtn} onClick={onEnter}>
            Step Inside
          </button>
          <p className={styles.hint}>4 shots · auto countdown · choose your frame above</p>
        </div>
      )}

      {isRevealing && (
        <div className={styles.revealArea}>
          {stripStage === 'idle'     && <p className={styles.revealMsg}>Developing your photos…</p>}
          {stripStage === 'glow'     && <p className={styles.revealMsg}>Almost ready…</p>}
          {stripStage === 'printing' && <p className={styles.revealMsg}>Printing your strip…</p>}
          {stripStage === 'ready'    && (
            <button className={styles.pickupBtn} onClick={onPickUp}>
              Pick Up Your Strip
            </button>
          )}
        </div>
      )}

    </div>
  )
}
