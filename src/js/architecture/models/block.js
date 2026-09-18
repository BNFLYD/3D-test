// Modelo 2D: bloque 3D isométrico (canvas)

import { project } from '../projection.js'
import { CYAN_GLOW, EDGE, EDGE_ACTIVE } from './palette.js'

export function drawBlock3D(ctx, cx, cy, cz, bw, bd, bh, angleX, angleY, zoom, opts = {}) {
  const { fill = '#181818', stroke = EDGE, selected = false } = opts
  const s = selected ? 1.15 : 1
  const p1 = project(cx - bw / 2, cy - bd / 2, cz + bh, angleX, angleY, zoom)
  const p2 = project(cx + bw / 2, cy - bd / 2, cz + bh, angleX, angleY, zoom)
  const p3 = project(cx + bw / 2, cy + bd / 2, cz + bh, angleX, angleY, zoom)
  const p4 = project(cx - bw / 2, cy + bd / 2, cz + bh, angleX, angleY, zoom)
  const p1b = project(cx - bw / 2, cy - bd / 2, cz, angleX, angleY, zoom)
  const p2b = project(cx + bw / 2, cy - bd / 2, cz, angleX, angleY, zoom)
  const p3b = project(cx + bw / 2, cy + bd / 2, cz, angleX, angleY, zoom)
  const p4b = project(cx - bw / 2, cy + bd / 2, cz, angleX, angleY, zoom)

  ctx.save()
  if (selected) {
    ctx.shadowColor = CYAN_GLOW
    ctx.shadowBlur = 18
  }

  // Cara superior
  const tg = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y)
  tg.addColorStop(0, selected ? '#252525' : '#1e1e1e')
  tg.addColorStop(1, selected ? '#1a1a1a' : '#141414')
  ctx.fillStyle = tg
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.lineTo(p4.x, p4.y)
  ctx.closePath()
  ctx.fill()

  // Cara derecha
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.moveTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.lineTo(p3b.x, p3b.y)
  ctx.lineTo(p2b.x, p2b.y)
  ctx.closePath()
  ctx.fill()

  // Cara frontal
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.moveTo(p4.x, p4.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.lineTo(p3b.x, p3b.y)
  ctx.lineTo(p4b.x, p4b.y)
  ctx.closePath()
  ctx.fill()

  // Bordes
  ctx.strokeStyle = selected ? EDGE_ACTIVE : stroke
  ctx.lineWidth = selected ? 1.2 : 0.6
  ctx.stroke()
  ctx.restore()
}
