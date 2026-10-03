// Modelo 2D: jaula de seguridad HEXAGONAL — prisma 3D real con la cara
// FRONTAL por delante de los nodos y la TRASERA por detrás.
// Se dibuja en dos pasadas: { layer: 'back' } antes de los nodos y
// { layer: 'front' } después, para que el orden de profundidad sea correcto.

import { project } from '../projection.js'
import { CYAN, CYAN_DIM } from './palette.js'

const RADIUS_CAP = 340 // tope de seguridad para no desbordar la miniatura

// Rotación del hexágono: +30° deja los vértices arriba/abajo en pantalla
// (pointy-top), alineados con la silueta isométrica del logo HOD
const HEX_ROTATION = Math.PI / 6

// Logo HOD: pared del fondo de la celda (fase final, contain-fit a la cara trasera)
const LOGO = {
  alpha: 0.15,             // opacidad del watermark
  aspect: 760.9 / 888.8,   // ratio w/h del viewBox del SVG
  nudgeX: -0.05,           // -5% del ancho → izquierda
  nudgeY: -0.05,           // -5% del alto → arriba
}

const logoImage = new Image()
let logoLoaded = false
logoImage.onload = () => { logoLoaded = true }
logoImage.src = '/logo.svg'

// Vértices del hexágono en el plano x/z
function hexagonFace(cx, cz, rx, rz, y) {
  const verts = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + HEX_ROTATION
    verts.push({
      x: cx + rx * Math.cos(angle),
      y,
      z: cz + rz * Math.sin(angle)
    })
  }
  return verts
}

export function drawSecurityEnvelope(ctx, nodes, angleX, angleY, zoom, opts = {}) {
  const { pad = 35, progress = 0, layer = 'front', logo = 0 } = opts
  if (progress <= 0) return

  // Centroide de la silueta (x/z = ancho y altura en pantalla)
  let sumX = 0, sumZ = 0, sumY = 0
  nodes.forEach(n => { sumX += n.x; sumZ += n.z; sumY += n.y })
  const cx = sumX / nodes.length
  const cz = sumZ / nodes.length
  const cy = sumY / nodes.length

  // Radios ajustados a la silueta real + el offset de proyección de la
  // profundidad, para que cada cara ENCIERRE al cluster completo en pantalla
  let rx = 0, rz = 0
  nodes.forEach(n => {
    const half = n.r || Math.max(n.w, n.d) / 2 || 35
    const dx = Math.abs(n.x - cx) + half + pad
    const dz = Math.abs(n.z - cz) + (n.h || n.r || 10) / 2 + pad
    if (dx > rx) rx = dx
    if (dz > rz) rz = dz
  })

  // Profundidad derivada del spread real en y (eje hacia la cámara)
  let minY = Infinity, maxY = -Infinity
  nodes.forEach(n => {
    if (n.y < minY) minY = n.y
    if (n.y > maxY) maxY = n.y
  })
  const depth = (maxY - minY) + pad * 2
  const frontY = cy - depth / 2 // cara más cercana a la cámara (mira desde -y)
  const backY = cy + depth / 2

  // Ensanchar cada cara por el offset de proyección de la profundidad:
  // la frontal queda desplazada hacia un lado y aun así debe contener todo
  const widen = depth * 0.25
  rx = Math.min(rx + widen, RADIUS_CAP)
  rz = Math.min(rz + widen, RADIUS_CAP)
  // Proporción: el alto no baja del 90% del ancho para que el hexágono
  // no se lea achatado (aristas laterales ≈ aristas de piso/techo)
  rz = Math.max(rz, rx * 0.9)

  const projFront = hexagonFace(cx, cz, rx, rz, frontY)
    .map(v => project(v.x, v.y, v.z, angleX, angleY, zoom))
  const projBack = hexagonFace(cx, cz, rx, rz, backY)
    .map(v => project(v.x, v.y, v.z, angleX, angleY, zoom))

  ctx.save()
  ctx.strokeStyle = CYAN_DIM
  ctx.setLineDash([4, 6])

  if (layer === 'back') {
    // ---- Pasada TRASERA (dibujar ANTES de los nodos) ----

    // Pared del fondo: logo contain-fit al bbox proyectado de la cara trasera,
    // ANTES del trazo del hexágono → queda detrás de todo el sobre
    if (logo > 0 && logoLoaded) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      projBack.forEach(p => {
        if (p.x < minX) minX = p.x
        if (p.x > maxX) maxX = p.x
        if (p.y < minY) minY = p.y
        if (p.y > maxY) maxY = p.y
      })
      const bboxW = maxX - minX
      const bboxH = maxY - minY
      // Contain-fit preservando el aspecto del SVG (sin deformar):
      // mismo alto exacto que la cara trasera, ancho proporcional
      let lh = bboxH
      let lw = lh * LOGO.aspect
      if (lw > bboxW) {
        lw = bboxW
        lh = lw / LOGO.aspect
      }
      const ccx = (minX + maxX) / 2
      const ccy = (minY + maxY) / 2
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = logo * LOGO.alpha
      ctx.drawImage(logoImage,
        ccx - lw / 2 + lw * LOGO.nudgeX,
        ccy - lh / 2 + lh * LOGO.nudgeY,
        lw, lh)
      ctx.restore()
    }

    ctx.globalAlpha = progress * 0.35
    ctx.lineWidth = 0.9
    ctx.beginPath()
    ctx.moveTo(projBack[0].x, projBack[0].y)
    for (let i = 1; i < 6; i++) ctx.lineTo(projBack[i].x, projBack[i].y)
    ctx.closePath()
    ctx.stroke()
  } else {
    // ---- Pasada FRONTAL (dibujar DESPUÉS de los nodos) ----
    // Aristas de profundidad (frontal -> trasera)
    ctx.globalAlpha = progress * 0.35
    ctx.lineWidth = 0.9
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.moveTo(projFront[i].x, projFront[i].y)
      ctx.lineTo(projBack[i].x, projBack[i].y)
      ctx.stroke()
    }

    // Cara frontal: la que se ve "de frente", por delante de los nodos
    ctx.globalAlpha = progress * 0.55
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(projFront[0].x, projFront[0].y)
    for (let i = 1; i < 6; i++) ctx.lineTo(projFront[i].x, projFront[i].y)
    ctx.closePath()
    ctx.stroke()

    ctx.setLineDash([])

    // Etiqueta: arriba a la derecha de la cara frontal
    const labelP = projFront[5] // vértice 330° = arriba-derecha en pantalla
    ctx.globalAlpha = progress * 0.9
    ctx.font = `600 ${Math.max(9, 10 * zoom)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = CYAN
    ctx.textAlign = 'left'
    ctx.fillText('SEGURIDAD HEXAGONAL', labelP.x + 8, labelP.y - 4)
    ctx.font = `${Math.max(8, 9 * zoom)}px 'JetBrains Mono', monospace`
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('perímetro blindado', labelP.x + 8, labelP.y + 10 * zoom)
  }

  ctx.restore()
}
