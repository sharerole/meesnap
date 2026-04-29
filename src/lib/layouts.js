export const LAYOUTS = [
  { id: '1x2', cols: 1, rows: 2, label: '1×2' },
  { id: '1x3', cols: 1, rows: 3, label: '1×3' },
  { id: '1x4', cols: 1, rows: 4, label: '1×4' },
  { id: '2x2', cols: 2, rows: 2, label: '2×2' },
  { id: '2x3', cols: 2, rows: 3, label: '2×3' },
]

export const DEFAULT_LAYOUT = LAYOUTS[2] // 1×4

const PAD_TOP  = 56
const PAD_BOT  = 22
const FOOTER_H = 84
const GAP_ROW  = 14

export function getMetrics(layout) {
  const { cols, rows } = layout
  if (cols === 1) {
    const W = 360, PHOTO_W = 278, PHOTO_H = 208, PAD_X = 41, GAP_COL = 0
    return {
      W, PHOTO_W, PHOTO_H, PAD_X, PAD_TOP, PAD_BOT, FOOTER_H, GAP_ROW, GAP_COL, cols, rows,
      h: PAD_TOP + rows * PHOTO_H + (rows - 1) * GAP_ROW + PAD_BOT + FOOTER_H,
    }
  }
  // 2-column: wider canvas, proportionally smaller photos
  const W = 480, PHOTO_W = 204, PHOTO_H = 153, PAD_X = 30, GAP_COL = 12
  return {
    W, PHOTO_W, PHOTO_H, PAD_X, PAD_TOP, PAD_BOT, FOOTER_H, GAP_ROW, GAP_COL, cols, rows,
    h: PAD_TOP + rows * PHOTO_H + (rows - 1) * GAP_ROW + PAD_BOT + FOOTER_H,
  }
}
