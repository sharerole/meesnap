import { useState } from 'react'
import styles from './StickerOverlay.module.css'

// MeeOpp-branded sticker categories
const STICKER_SETS = [
  {
    label: 'MeeOpp',
    stickers: [
      { emoji: '👁️👁️', label: 'MeeOpp eyes' },
      { emoji: '⭐', label: 'Star' },
      { emoji: '🌟', label: 'Glowing star' },
      { emoji: '💫', label: 'Sparkle' },
      { emoji: '✨', label: 'Sparkles' },
      { emoji: '🎯', label: 'Target' },
    ],
  },
  {
    label: 'Kawaii',
    stickers: [
      { emoji: '🌸', label: 'Sakura' },
      { emoji: '🎀', label: 'Ribbon' },
      { emoji: '💕', label: 'Hearts' },
      { emoji: '🍬', label: 'Candy' },
      { emoji: '🦋', label: 'Butterfly' },
      { emoji: '🌈', label: 'Rainbow' },
    ],
  },
  {
    label: 'School',
    stickers: [
      { emoji: '📚', label: 'Books' },
      { emoji: '🎓', label: 'Grad cap' },
      { emoji: '✏️', label: 'Pencil' },
      { emoji: '🏆', label: 'Trophy' },
      { emoji: '🎉', label: 'Party' },
      { emoji: '🤝', label: 'Friends' },
    ],
  },
  {
    label: 'Fun',
    stickers: [
      { emoji: '😎', label: 'Cool' },
      { emoji: '🤩', label: 'Star-eyed' },
      { emoji: '🥳', label: 'Party face' },
      { emoji: '😜', label: 'Silly' },
      { emoji: '🔥', label: 'Fire' },
      { emoji: '💥', label: 'Boom' },
    ],
  },
]

const STRIP_W = 360
const STRIP_PHOTO_AREA_H = 4 * (240 + 16) + 16 // approximate strip height

export default function StickerOverlay({ onAdd }) {
  const [activeSet, setActiveSet] = useState(0)
  const [size, setSize] = useState(36)

  function placeSticker(emoji) {
    // Place randomly on the strip photo area
    const x = Math.random() * (STRIP_W - 60) + 10
    const y = Math.random() * (STRIP_PHOTO_AREA_H * 0.85) + 20
    onAdd({ emoji, x, y, size })
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>Stickers</p>

      {/* Category tabs */}
      <div className={styles.tabs}>
        {STICKER_SETS.map((set, i) => (
          <button
            key={set.label}
            className={`${styles.tab} ${activeSet === i ? styles.tabActive : ''}`}
            onClick={() => setActiveSet(i)}
          >
            {set.label}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className={styles.grid}>
        {STICKER_SETS[activeSet].stickers.map(s => (
          <button
            key={s.label}
            className={styles.stickerBtn}
            onClick={() => placeSticker(s.emoji)}
            title={s.label}
          >
            {s.emoji}
          </button>
        ))}
      </div>

      {/* Size slider */}
      <div className={styles.sizeRow}>
        <span className={styles.sizeLabel}>Size</span>
        <input
          type="range"
          min={20}
          max={64}
          value={size}
          onChange={e => setSize(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sizePreview} style={{ fontSize: size * 0.5 }}>Aa</span>
      </div>
    </div>
  )
}
