// MeeOpp main mascot — blue-faced wizard hero in orange coat
export default function MascotSVG({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MeeOpp mascot"
    >
      {/* Body / coat */}
      <ellipse cx="100" cy="175" rx="52" ry="58" fill="#E8621A" />

      {/* Inner shirt */}
      <ellipse cx="100" cy="182" rx="30" ry="38" fill="#8B3A0A" />

      {/* Red scarf */}
      <rect x="74" y="148" width="52" height="14" rx="7" fill="#CC1A1A" />
      <polygon points="100,162 86,185 114,185" fill="#CC1A1A" />

      {/* Left arm */}
      <ellipse cx="52" cy="175" rx="16" ry="32" fill="#E8621A" transform="rotate(-20 52 175)" />
      {/* Left glove */}
      <circle cx="40" cy="202" r="12" fill="#CC4400" />

      {/* Right arm */}
      <ellipse cx="148" cy="175" rx="16" ry="32" fill="#E8621A" transform="rotate(20 148 175)" />
      {/* Right glove */}
      <circle cx="160" cy="202" r="12" fill="#CC4400" />

      {/* Gold trim on coat */}
      <rect x="75" y="145" width="50" height="5" rx="2.5" fill="#F5C518" />

      {/* Legs */}
      <rect x="76" y="225" width="20" height="30" rx="6" fill="#1A1A2E" />
      <rect x="104" y="225" width="20" height="30" rx="6" fill="#1A1A2E" />

      {/* Boots */}
      <ellipse cx="86" cy="254" rx="16" ry="8" fill="#E8621A" />
      <ellipse cx="114" cy="254" rx="16" ry="8" fill="#E8621A" />

      {/* Boot highlight */}
      <ellipse cx="80" cy="251" rx="6" ry="3" fill="#FF8C42" opacity="0.5" />
      <ellipse cx="108" cy="251" rx="6" ry="3" fill="#FF8C42" opacity="0.5" />

      {/* Neck */}
      <rect x="88" y="130" width="24" height="20" rx="4" fill="#2A7FE0" />

      {/* Head */}
      <ellipse cx="100" cy="108" rx="38" ry="40" fill="#2A7FE0" />

      {/* Face highlight */}
      <ellipse cx="94" cy="100" rx="22" ry="20" fill="#4A9FFF" opacity="0.3" />

      {/* Eyes */}
      <ellipse cx="85" cy="108" rx="9" ry="10" fill="white" />
      <ellipse cx="115" cy="108" rx="9" ry="10" fill="white" />
      {/* Pupils */}
      <circle cx="87" cy="110" r="5" fill="#1A1A2E" />
      <circle cx="117" cy="110" r="5" fill="#1A1A2E" />
      {/* Eye shine */}
      <circle cx="89" cy="107" r="2" fill="white" />
      <circle cx="119" cy="107" r="2" fill="white" />

      {/* Nose */}
      <ellipse cx="100" cy="120" rx="4" ry="3" fill="#1B5AAA" />

      {/* Smile */}
      <path d="M 86 128 Q 100 138 114 128" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Cheek blush */}
      <ellipse cx="74" cy="122" rx="8" ry="5" fill="#FF8FAB" opacity="0.5" />
      <ellipse cx="126" cy="122" rx="8" ry="5" fill="#FF8FAB" opacity="0.5" />

      {/* Wizard hat brim */}
      <ellipse cx="100" cy="74" rx="46" ry="10" fill="#1B6FD4" />
      {/* Hat body */}
      <path d="M 68 74 Q 72 20 100 10 Q 128 20 132 74 Z" fill="#1B6FD4" />
      {/* Hat highlight stripe */}
      <path d="M 80 68 Q 82 40 100 28 Q 102 40 104 68" fill="#2A8FFF" opacity="0.3" />
      {/* Hat tip */}
      <ellipse cx="100" cy="10" rx="8" ry="6" fill="#F5C518" />
      {/* Hat band */}
      <rect x="70" y="68" width="60" height="8" rx="4" fill="#F5C518" />

      {/* Small robot horns / antennae on hat */}
      <rect x="88" y="14" width="6" height="18" rx="3" fill="#888" transform="rotate(-15 91 20)" />
      <rect x="106" y="14" width="6" height="18" rx="3" fill="#888" transform="rotate(15 109 20)" />
      <circle cx="84" cy="11" r="5" fill="#F5C518" />
      <circle cx="116" cy="11" r="5" fill="#F5C518" />
    </svg>
  )
}
