// Modelo 2D: línea de conexión entre nodos — draw-in progresivo con cabeza
// brillante (el "cable" conecta entre sus capas) y flujo de datos continuo
// (3 pulsos escalonados recorriendo la línea completa).

import { CYAN, CYAN_DIM } from './palette.js'

export function drawConnectionLine(ctx, p1, p2, opts = {}) {
  const { flow = 0, progress = 1, active = false, isAI = false } = opts

  // Frente de avance del trazo: la línea crece de p1 hacia p2
  const head = {
    x: p1.x + (p2.x - p1.x) * progress,
    y: p1.y + (p2.y - p1.y) * progress,
  }

  const color = isAI ? CYAN_DIM : active ? 'rgba(0,243,255,0.25)' : 'rgba(255,255,255,0.06)'
  ctx.strokeStyle = color
  ctx.lineWidth = isAI ? 1.2 : 0.6
  ctx.setLineDash(isAI ? [4, 6] : [6, 10])
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(head.x, head.y)
  ctx.stroke()
  ctx.setLineDash([])

  // Durante el draw-in: la cabeza ES el pulso (paquete conectando las capas)
  if (progress < 1) {
    ctx.fillStyle = CYAN
    ctx.shadowColor = CYAN
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(head.x, head.y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    return
  }

  // Línea completa: flujo de datos continuo (3 pulsos escalonados)
  if (flow > 0) {
    for (let i = 0; i < 3; i++) {
      const phase = (flow + i / 3) % 1
      const px = p1.x + (p2.x - p1.x) * phase
      const py = p1.y + (p2.y - p1.y) * phase
      ctx.fillStyle = CYAN
      ctx.shadowColor = CYAN
      ctx.shadowBlur = isAI ? 10 : 8
      ctx.beginPath()
      ctx.arc(px, py, isAI ? 3 : 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }
}
