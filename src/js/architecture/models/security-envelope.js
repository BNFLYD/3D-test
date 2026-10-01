// Modelo 2D: jaula de seguridad HEXAGONAL — prisma con la CARA FRONTAL
// mirando a la cámara (portal de contención) y cara trasera tenue de profundidad.
// El hexágono se ajusta a la silueta real (rx/rz independientes).

import { project } from '../projection.js'
import { CYAN, CYAN_DIM } from './palette.js'

const RADIUS_CAP = 280 // tope de seguridad para no desbordar la miniatura

// Vértices del hexágono en el plano x/z (sin desfase: cara plana arriba en pantalla)
function hexagonFace(cx, cz, rx, rz, y) {
  const verts = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    verts.push({
      x: cx + rx * Math.cos(angle),
      y,
      z: cz + rz * Math.sin(angle)
    })
  }
  return verts
}

export function drawSecurityEnvelope(ctx, nodes, angleX, angleY, zoom, opts = {}) {
  const { pad = 35, progress = 0 } = opts
  if (progress <= 0) return

  // Centroide de la silueta (x/z = ancho y altura en pantalla)
  let sumX = 0, sumZ = 0, sumY = 0
  nodes.forEach(n => { sumX += n.x; sumZ += n.z; sumY += n.y })
  const cx = sumX / nodes.length
  const cz = sumZ / nodes.length
  const cy = sumY / nodes.length

  // Radios ajustados a la silueta real: envolver por separado en x y en z
  let rx = 0, rz = 0
  nodes.forEach(n => {
    const half = n.r || Math.max(n.w, n.d) / 2 || 35
    const dx = Math.abs(n.x - cx) + half + pad
    const dz = Math.abs(n.z - cz) + (n.h || n.r || 10) / 2 + pad
    if (dx > rx) rx = dx
    if (dz > rz) rz = dz
  })
  rx = Math.min(rx, RADIUS_CAP)
  rz = Math.min(rz, RADIUS_CAP)

  // Profundidad derivada del spread real en y (eje hacia la cámara)
  let minY = Infinity, maxY = -Infinity
  nodes.forEach(n => {
    if (n.y < minY) minY = n.y
    if (n.y > maxY) maxY = n.y
  })
  const depth = (maxY - minY) + pad * 2
  const frontY = cy - depth / 2 // cara más cercana a la cámara (mira desde -y)
  const backY = cy + depth / 2

  const projFront = hexagonFace(cx, cz, rx, rz, frontY)
    .map(v => project(v.x, v.y, v.z, angleX, angleY, zoom))
  const projBack = hexagonFace(cx, cz, rx, rz, backY)
    .map(v => project(v.x, v.y, v.z, angleX, angleY, zoom))

  ctx.save()
  ctx.strokeStyle = CYAN_DIM
  ctx.setLineDash([4, 6])

  // Cara trasera: eco tenue de profundidad
  ctx.globalAlpha = progress * 0.18
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(projBack[0].x, projBack[0].y)
  for (let i = 1; i < 6; i++) ctx.lineTo(projBack[i].x, projBack[i].y)
  ctx.closePath()
  ctx.stroke()

  // Aristas de profundidad (frontal -> trasera)
  ctx.globalAlpha = progress * 0.28
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(projFront[i].x, projFront[i].y)
    ctx.lineTo(projBack[i].x, projBack[i].y)
    ctx.stroke()
  }

  // Cara frontal: la que se ve "de frente"
  ctx.globalAlpha = progress * 0.5
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(projFront[0].x, projFront[0].y)
  for (let i = 1; i < 6; i++) ctx.lineTo(projFront[i].x, projFront[i].y)
  ctx.closePath()
  ctx.stroke()
  ctx.setLineDash([])

  // Etiqueta: arriba a la derecha de la cara frontal
  const labelP = projFront[5] // vértice 300° = arriba-derecha en pantalla
  ctx.globalAlpha = progress * 0.9
  ctx.font = `600 ${Math.max(9, 10 * zoom)}px 'JetBrains Mono', monospace`
  ctx.fillStyle = CYAN
  ctx.textAlign = 'left'
  ctx.fillText('SEGURIDAD HEXAGONAL', labelP.x + 8, labelP.y - 4)
  ctx.font = `${Math.max(8, 9 * zoom)}px 'JetBrains Mono', monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('perímetro blindado', labelP.x + 8, labelP.y + 10 * zoom)
  ctx.restore()
}
