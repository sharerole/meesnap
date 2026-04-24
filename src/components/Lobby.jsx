import { useEffect, useState } from 'react'
import styles from './Lobby.module.css'
import MascotSVG from './MascotSVG'
import MeeOppLogo from './MeeOppLogo'

export default function Lobby({ onEnter }) {
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 700)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={styles.scene}>
      {/* Floating stars background */}
      <div className={styles.stars}>
        {[...Array(20)].map((_, i) => (
          <span key={i} className={styles.star} style={{
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            fontSize: `${0.5 + (i % 3) * 0.4}rem`
          }}>★</span>
        ))}
      </div>

      <div className={styles.wrapper}>
        {/* Booth machine */}
        <div className={styles.machine}>
          {/* Neon sign on top */}
          <div className={styles.signBar}>
            <div className={`${styles.neonSign} ${blink ? styles.on : styles.dim}`}>
              <MeeOppLogo size={36} />
              <span className={styles.signText}>PHOTO BOOTH</span>
            </div>
          </div>

          {/* Machine body */}
          <div className={styles.body}>
            {/* Decorative rivets */}
            <span className={styles.rivet} style={{ top: 12, left: 12 }} />
            <span className={styles.rivet} style={{ top: 12, right: 12 }} />
            <span className={styles.rivet} style={{ bottom: 12, left: 12 }} />
            <span className={styles.rivet} style={{ bottom: 12, right: 12 }} />

            {/* Viewing window */}
            <div className={styles.window}>
              <div className={styles.windowGlass}>
                <MascotSVG className={styles.mascotInWindow} />
                <p className={styles.windowText}>Step right in!</p>
              </div>
            </div>

            {/* Coin slot area */}
            <div className={styles.coinArea}>
              <div className={styles.coinSlotLabel}>INSERT COIN</div>
              <div className={styles.coinSlot} />
            </div>

            {/* Control panel */}
            <div className={styles.panel}>
              <div className={styles.panelLights}>
                {['var(--magenta)', 'var(--gold)', 'var(--blue)', 'var(--orange)'].map((c, i) => (
                  <span key={i} className={styles.panelLight} style={{
                    background: c,
                    animationDelay: `${i * 0.25}s`
                  }} />
                ))}
              </div>
              <button className={styles.enterBtn} onClick={onEnter}>
                📸 Step Inside
              </button>
              <p className={styles.tagline}>Snap. Share. Remember.</p>
            </div>

            {/* Strip tray */}
            <div className={styles.tray}>
              <div className={styles.trayLabel}>← Collect photos here</div>
            </div>
          </div>

          {/* Legs */}
          <div className={styles.legs}>
            <div className={styles.leg} />
            <div className={styles.leg} />
          </div>
        </div>

        {/* Side decorations */}
        <div className={styles.sideLeft}>
          <div className={styles.floatingBadge}>
            <MeeOppLogo size={28} />
            <span>MeeOpp</span>
          </div>
          <p className={styles.sideNote}>4 shots<br />1 strip</p>
        </div>
        <div className={styles.sideRight}>
          <p className={styles.sideNote}>Choose<br />your frame</p>
          <div className={styles.miniStrip}>
            {['classic', 'retro', 'kawaii'].map(t => (
              <div key={t} className={`${styles.miniFrame} ${styles[`miniFrame_${t}`]}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
