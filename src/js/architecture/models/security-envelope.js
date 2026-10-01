// Modelo 2D: jaula de seguridad HEXAGONAL envolviendo los nodos visibles
// Hexágono en el plano x/y (huella de suelo de la proyección),
// extruido vertical en z (piso zMin -> techo zMax)

import { project } from '../projection.js'
import { CYAN, CYAN_DIM } from './palette.js'

const RADIUS_CAP = 280 // tope para no desbordar la miniatura

// Vértices del hexágono en el plano x/y (desfase PI/6), a una altura z dada
function hexagonVertices(cx, cy, radius, z) {
  const verts = []
  for (let i = 0; i < 6; i++) {
    // Sin desfase: la CARA del hexágono (borde 240°-300°, midpoint 270°)
    // mira al espectador; vértices a izquierda/derecha
    const angle = (i * Math.PI) / 3
    verts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), z })
  }
  return verts
}

export function drawSecurityEnvelope(ctx, nodes, angleX, angleY, zoom, opts = {}) {
  const { pad = 35, progress = 0 } = opts
  if (progress <= 0) return

  // Centroide de la huella (x/y = ejes de suelo de la proyección)
  let sumX = 0, sumY = 0
  nodes.forEach(n => { sumX += n.x; sumY += n.y })
  const cx = sumX / nodes.length
  const cy = sumY / nodes.length

  // Radio: distancia máxima en el plano x/y + half-size + pad (con tope)
  let radius = 0
  nodes.forEach(n => {
    const half = n.r || Math.max(n.w, n.d) / 2 || 35
    const dist = Math.hypot(n.x - cx, n.y - cy) + half + pad
    if (dist > radius) radius = dist
  })
  radius = Math.min(radius, RADIUS_CAP)

  // Alturas derivadas de los nodos reales (z es el eje vertical)
  let zMin = Infinity
  let zMax = -Infinity
  nodes.forEach(n => {
    if (n.z < zMin) zMin = n.z
    const top = n.z + (n.h || n.r || 10)
    if (top > zMax) zMax = top
  })
  zMin -= 25
  zMax += 25

  const projFloor = hexagonVertices(cx, cy, radius, zMin)
    .map(v => project(v.x, v.y, v.z, angleX, angleY, zoom))
  const projCeiling = hexagonVertices(cx, cy, radius, zMax)
    .map(v => project(v.x, v.y, v.z, angleX, angleY, zoom))

  ctx.save()
  ctx.globalAlpha = progress * 0.4
  ctx.strokeStyle = CYAN_DIM
  ctx.lineWidth = 0.9
  ctx.setLineDash([4, 6])

  // Piso y techo
  ;[projFloor, projCeiling].forEach(proj => {
    ctx.beginPath()
    ctx.moveTo(proj[0].x, proj[0].y)
    for (let i = 1; i < 6; i++) ctx.lineTo(proj[i].x, proj[i].y)
    ctx.closePath()
    ctx.stroke()
  })

  // Aristas verticales conectando piso y techo
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(projFloor[i].x, projFloor[i].y)
    ctx.lineTo(projCeiling[i].x, projCeiling[i].y)
    ctx.stroke()
  }

  ctx.setLineDash([])

  // Etiqueta: a la derecha del hexágono, a la altura del techo
  const labelP = project(cx + radius + 15, cy, zMax, angleX, angleY, zoom)
  ctx.globalAlpha = progress * 0.9
  ctx.font = `600 ${Math.max(9, 10 * zoom)}px 'JetBrains Mono', monospace`
  ctx.fillStyle = CYAN
  ctx.textAlign = 'left'
  ctx.fillText('SEGURIDAD HEXAGONAL', labelP.x, labelP.y)
  ctx.font = `${Math.max(8, 9 * zoom)}px 'JetBrains Mono', monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('perímetro blindado', labelP.x, labelP.y + 12 * zoom)
  ctx.restore()
}
