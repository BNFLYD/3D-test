// Modelo 2D: etiqueta de texto de un nodo

import { CYAN } from './palette.js'

export function drawNodeLabel(ctx, p, label, opts = {}) {
  const { selected = false, dimmed = false, zoom = 1 } = opts
  ctx.font = `600 ${Math.max(8, 9 * zoom)}px 'JetBrains Mono', monospace`
  ctx.textAlign = 'center'
  ctx.fillStyle = selected ? CYAN : dimmed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)'
  ctx.fillText(label, p.x, p.y - 6 * zoom)
}
