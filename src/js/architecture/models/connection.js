// Modelo 2D: línea de conexión entre nodos (con pulso animado)

import { CYAN, CYAN_DIM } from './palette.js'

export function drawConnectionLine(ctx, p1, p2, opts = {}) {
  const { pulse = 0, active = false, isAI = false } = opts
  const color = isAI ? CYAN_DIM : active ? 'rgba(0,243,255,0.25)' : 'rgba(255,255,255,0.06)'
  ctx.strokeStyle = color
  ctx.lineWidth = isAI ? 1.2 : 0.6
  ctx.setLineDash(isAI ? [4, 6] : [6, 10])
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
  ctx.setLineDash([])

  if (pulse > 0 && pulse < 1) {
    const px = p1.x + (p2.x - p1.x) * pulse
    const py = p1.y + (p2.y - p1.y) * pulse
    ctx.fillStyle = isAI ? CYAN : 'rgba(255,255,255,0.5)'
    ctx.shadowColor = isAI ? CYAN : 'rgba(255,255,255,0.3)'
    ctx.shadowBlur = isAI ? 10 : 4
    ctx.beginPath()
    ctx.arc(px, py, isAI ? 3 : 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}
