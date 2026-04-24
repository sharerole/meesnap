export default function MeeOppLogo({ size = 40, showText = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="MeeOpp">
      {/* Magenta circle */}
      <circle cx="50" cy="50" r="48" fill="#BE0055" />
      {/* White eyes */}
      <circle cx="34" cy="46" r="10" fill="white" />
      <circle cx="66" cy="46" r="10" fill="white" />
      {/* Pupils */}
      <circle cx="36" cy="48" r="5" fill="#BE0055" />
      <circle cx="68" cy="48" r="5" fill="#BE0055" />
      {/* Smile */}
      <path d="M 34 62 Q 50 74 66 62" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
