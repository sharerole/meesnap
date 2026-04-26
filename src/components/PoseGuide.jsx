import styles from './PoseGuide.module.css'

const POSES = [
  {
    id: 'hands-up',
    label: 'Hands up! 🙌',
    figure: (
      <svg viewBox="0 0 80 150" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="14" r="10" />
        <line x1="40" y1="24" x2="40" y2="78" />
        <line x1="40" y1="38" x2="16" y2="18" />
        <line x1="40" y1="38" x2="64" y2="18" />
        <line x1="40" y1="78" x2="28" y2="125" />
        <line x1="40" y1="78" x2="52" y2="125" />
      </svg>
    ),
  },
  {
    id: 'peace',
    label: 'Peace out! ✌️',
    figure: (
      <svg viewBox="0 0 80 150" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="14" r="10" />
        <line x1="40" y1="24" x2="40" y2="78" />
        <line x1="40" y1="38" x2="18" y2="50" />
        <line x1="40" y1="38" x2="62" y2="12" />
        <line x1="62" y1="12" x2="56" y2="23" />
        <line x1="62" y1="12" x2="68" y2="23" />
        <line x1="40" y1="78" x2="28" y2="125" />
        <line x1="40" y1="78" x2="52" y2="125" />
      </svg>
    ),
  },
  {
    id: 'superhero',
    label: 'Superhero! 💪',
    figure: (
      <svg viewBox="0 0 80 150" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="14" r="10" />
        <line x1="40" y1="24" x2="40" y2="78" />
        <polyline points="40,38 22,56 18,70" />
        <polyline points="40,38 58,56 62,70" />
        <line x1="40" y1="78" x2="24" y2="125" />
        <line x1="40" y1="78" x2="56" y2="125" />
      </svg>
    ),
  },
  {
    id: 'jump',
    label: 'Jump! 🦘',
    figure: (
      <svg viewBox="0 0 80 120" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="10" r="10" />
        <line x1="40" y1="20" x2="40" y2="66" />
        <line x1="40" y1="34" x2="12" y2="52" />
        <line x1="40" y1="34" x2="68" y2="52" />
        <line x1="40" y1="66" x2="18" y2="100" />
        <line x1="40" y1="66" x2="62" y2="100" />
      </svg>
    ),
  },
  {
    id: 'point',
    label: 'You! 👆',
    figure: (
      <svg viewBox="0 0 80 150" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="14" r="10" />
        <line x1="40" y1="24" x2="40" y2="78" />
        <line x1="40" y1="38" x2="18" y2="50" />
        <line x1="40" y1="38" x2="72" y2="34" />
        <line x1="40" y1="78" x2="28" y2="125" />
        <line x1="40" y1="78" x2="52" y2="125" />
      </svg>
    ),
  },
  {
    id: 'dance',
    label: 'Dance! 🕺',
    figure: (
      <svg viewBox="0 0 80 150" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="14" r="10" />
        <line x1="40" y1="24" x2="40" y2="78" />
        <line x1="40" y1="38" x2="16" y2="24" />
        <line x1="40" y1="38" x2="62" y2="54" />
        <line x1="40" y1="78" x2="28" y2="125" />
        <polyline points="40,78 56,96 65,110" />
      </svg>
    ),
  },
]

export default function PoseGuide({ shotIndex, visible }) {
  const pose = POSES[shotIndex % POSES.length]
  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : ''}`}>
      <div className={styles.figure}>{pose.figure}</div>
      <p className={styles.label}>{pose.label}</p>
    </div>
  )
}
