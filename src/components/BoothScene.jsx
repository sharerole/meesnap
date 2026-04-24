import { useEffect, useState } from 'react'
import styles from './BoothScene.module.css'
import MeeOppLogo from './MeeOppLogo'
import { THEMES } from '../lib/themes'

// Strip reveal stages after exiting the booth
const STRIP_DELAY_GLOW   = 1400
const STRIP_DELAY_PRINT  = 2200
const STRIP_DELAY_READY  = 4800

export default function BoothScene({
  phase, theme, setTheme,
  onEnter, onCurtainsOpen, onCurtainsClosed, onPickUp,
}) {
  const [curtainsOpen, setCurtainsOpen] = useState(false)
  const [stripStage, setStripStage] = useState('idle') // idle | glow | printing | ready

  // Curtain open/close animation sequencing
  useEffect(() => {
    if (phase === 'entering') {
      setCurtainsOpen(false)
      // Small delay so the closed state renders before the transition fires
      const t1 = setTimeout(() => setCurtainsOpen(true), 80)
      const t2 = setTimeout(onCurtainsOpen, 1300)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    if (phase === 'exiting') {
      setCurtainsOpen(true)
      const t1 = setTimeout(() => setCurtainsOpen(false), 80)
      const t2 = setTimeout(onCurtainsClosed, 1200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    if (phase !== 'revealing') {
      setCurtainsOpen(false)
    }
  }, [phase, onCurtainsOpen, onCurtainsClosed])

  // Strip reveal sequence
  useEffect(() => {
    if (phase !== 'revealing') { setStripStage('idle'); return }
    setStripStage('idle')
    const t1 = setTimeout(() => setStripStage('glow'),     STRIP_DELAY_GLOW)
    const t2 = setTimeout(() => setStripStage('printing'), STRIP_DELAY_PRINT)
    const t3 = setTimeout(() => setStripStage('ready'),    STRIP_DELAY_READY)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [phase])

  const isEntering  = phase === 'entering'
  const isRevealing = phase === 'revealing'
  const isLobby     = phase === 'lobby'

  return (
    <div className={styles.scene}>
      {/* Ambient floor reflection */}
      <div className={styles.floor} />

      <div className={styles.layout}>
        {/* ── Booth ── */}
        <div className={styles.booth}>
          {/* Neon sign */}
          <div className={`${styles.sign} ${isEntering ? styles.signBright : ''}`}>
            <MeeOppLogo size={24} />
            <span className={styles.signText}>PHOTO BOOTH</span>
          </div>

          {/* Main body */}
          <div className={styles.body}>
            {/* Decorative corner rivets */}
            <span className={styles.rivet} style={{ top: 10, left: 10 }} />
            <span className={styles.rivet} style={{ top: 10, right: 10 }} />
            <span className={styles.rivet} style={{ bottom: 10, left: 10 }} />
            <span className={styles.rivet} style={{ bottom: 10, right: 10 }} />

            {/* Curtained doorway */}
            <div className={styles.doorwayWrap}>
              {/* Rail rod */}
              <div className={styles.curtainRod} />

              <div className={styles.doorway}>
                {/* Dark interior behind curtains */}
                <div className={`${styles.interior} ${isEntering ? styles.interiorLit : ''}`} />

                {/* Left curtain */}
                <div className={`${styles.curtain} ${styles.curtainLeft} ${curtainsOpen ? styles.curtainLeftOpen : ''}`}>
                  <div className={styles.curtainTieLeft} />
                </div>

                {/* Right curtain */}
                <div className={`${styles.curtain} ${styles.curtainRight} ${curtainsOpen ? styles.curtainRightOpen : ''}`}>
                  <div className={styles.curtainTieRight} />
                </div>
              </div>
            </div>

            {/* Indicator lights */}
            <div className={styles.lights}>
              {['#BE0055', '#F5C518', '#1B6FD4', '#E8621A'].map((c, i) => (
                <span
                  key={i}
                  className={styles.light}
                  style={{ background: c, animationDelay: `${i * 0.28}s` }}
                />
              ))}
            </div>

            {/* Strip output slot */}
            <div className={styles.slotSection}>
              <span className={styles.slotLabel}>PHOTO OUTPUT</span>
              <div className={`${styles.slot} ${stripStage !== 'idle' ? styles.slotActive : ''}`}>
                {/* Strip printing animation */}
                {(stripStage === 'printing' || stripStage === 'ready') && (
                  <div
                    className={`${styles.stripPrint} ${stripStage === 'ready' ? styles.stripReady : ''}`}
                    onClick={stripStage === 'ready' ? onPickUp : undefined}
                    title={stripStage === 'ready' ? 'Pick up your photos!' : undefined}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Booth legs */}
          <div className={styles.legs}>
            <div className={styles.leg} />
            <div className={styles.leg} />
          </div>
        </div>

        {/* ── Theme picker (lobby only) ── */}
        {isLobby && (
          <div className={styles.themePicker}>
            <p className={styles.themeHeading}>Choose frame</p>
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`${styles.themeBtn} ${theme === t.id ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <span className={styles.themeSwatch}>
                  <span style={{ background: t.colors[0] }} />
                  <span style={{ background: t.colors[1] }} />
                </span>
                <span className={styles.themeLabel}>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom action area ── */}
      {isLobby && (
        <div className={styles.actions}>
          <button className={styles.enterBtn} onClick={onEnter}>
            Step Inside
          </button>
          <p className={styles.hint}>4 shots · automatic countdown · downloadable strip</p>
        </div>
      )}

      {isRevealing && (
        <div className={styles.revealStatus}>
          {stripStage === 'idle'     && <p className={styles.revealMsg}>Developing your photos…</p>}
          {stripStage === 'glow'     && <p className={styles.revealMsg}>Almost ready…</p>}
          {stripStage === 'printing' && <p className={styles.revealMsg}>Printing your strip…</p>}
          {stripStage === 'ready'    && (
            <p className={`${styles.revealMsg} ${styles.revealReady}`}>
              ↑ Pick up your photos!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
