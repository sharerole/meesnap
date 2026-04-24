import { useState } from 'react'
import styles from './StickerPicker.module.css'
import { STICKER_DEFS, CATEGORIES, makeSvgDataUrl } from '../lib/stickers'

export default function StickerPicker({ onSelect }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)

  const visible = STICKER_DEFS.filter(s => s.category === activeCategory)

  return (
    <div className={styles.picker}>
      {/* Category tabs */}
      <div className={styles.tabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className={styles.grid}>
        {visible.map(def => (
          <button
            key={def.id}
            className={styles.stickerBtn}
            onClick={() => onSelect(def)}
            title={def.label}
          >
            <img
              src={makeSvgDataUrl(def)}
              alt={def.label}
              className={styles.stickerImg}
              draggable={false}
            />
          </button>
        ))}
      </div>

      <p className={styles.hint}>Tap a sticker to place it on the strip</p>
    </div>
  )
}
