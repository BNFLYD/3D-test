// Modelo 2D: sobre de seguridad que envuelve los nodos visibles

import { project } from '../projection.js'
import { CYAN, CYAN_DIM } from './palette.js'

export function drawSecurityEnvelope(ctx, nodes, angleX, angleY, zoom, opts = {}) {
  const { pad = 35, progress = 0 } = opts
  if (progress <= 0) return
  const minX = Math.min(...nodes.map(n => n.x)) - pad
  const maxX = Math.max(...nodes.map(n => n.x)) + pad
  const minY = Math.min(...nodes.map(n => n.y)) - pad
  const maxY = Math.max(...nodes.map(n => n.y)) + pad
  const minZ = -60
  const maxZ = 150

  const corners3D = [
    [minX, minY, maxZ], [maxX, minY, maxZ],
    [maxX, maxY, maxZ], [minX, maxY, maxZ],
    [minX, minY, minZ], [maxX, minY, minZ],
    [maxX, maxY, minZ], [minX, maxY, minZ],
  ]
  const projected = corners3D.map(([x, y, z]) => project(x, y, z, angleX, angleY, zoom))

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ]

  ctx.save()
  ctx.globalAlpha = progress * 0.4
  ctx.strokeStyle = CYAN_DIM
  ctx.lineWidth = 0.8
  ctx.setLineDash([3, 6])
  edges.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(projected[a].x, projected[a].y)
    ctx.lineTo(projected[b].x, projected[b].y)
    ctx.stroke()
  })
  ctx.setLineDash([])

  // Etiqueta
  const labelP = project(maxX + 12, minY, maxZ - 20, angleX, angleY, zoom)
  ctx.globalAlpha = progress * 0.9
  ctx.font = `600 ${Math.max(9, 10 * zoom)}px 'JetBrains Mono', monospace`
  ctx.fillStyle = CYAN
  ctx.textAlign = 'left'
  ctx.fillText('SEGURIDAD', labelP.x, labelP.y)
  ctx.font = `${Math.max(8, 9 * zoom)}px 'JetBrains Mono', monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('transversal', labelP.x, labelP.y + 12 * zoom)
  ctx.restore()
}
