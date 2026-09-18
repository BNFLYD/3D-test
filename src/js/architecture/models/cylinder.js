// Modelo 2D: cilindro 3D isométrico (canvas)

import { project } from '../projection.js'
import { CYAN_GLOW, EDGE, EDGE_ACTIVE } from './palette.js'

export function drawCylinder3D(ctx, cx, cy, cz, radius, height, angleX, angleY, zoom, opts = {}) {
  const { fill = '#1a1a1a', stroke = EDGE, selected = false } = opts
  const top = project(cx, cy, cz + height, angleX, angleY, zoom)
  const bot = project(cx, cy, cz, angleX, angleY, zoom)
  const rx = radius * zoom
  const ry = radius * 0.5 * zoom

  ctx.save()
  if (selected) {
    ctx.shadowColor = CYAN_GLOW
    ctx.shadowBlur = 16
  }

  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.ellipse(top.x, top.y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = selected ? EDGE_ACTIVE : stroke
  ctx.lineWidth = 0.8
  ctx.stroke()

  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath()
  ctx.ellipse(bot.x, bot.y, rx, ry, 0, 0, Math.PI)
  ctx.lineTo(top.x - rx, top.y)
  ctx.ellipse(top.x, top.y, rx, ry, 0, Math.PI, 0, true)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
