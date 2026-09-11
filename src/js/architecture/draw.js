// Funciones de dibujo Canvas 2D - portadas de next-test/utils/draw.js

import { project } from './projection.js'

const CYAN = '#00f3ff'
const CYAN_DIM = 'rgba(0,243,255,0.35)'
const CYAN_GLOW = 'rgba(0,243,255,0.15)'
const EDGE = 'rgba(255,255,255,0.12)'
const EDGE_ACTIVE = 'rgba(0,243,255,0.5)'

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

export function drawNodeLabel(ctx, p, label, opts = {}) {
  const { selected = false, dimmed = false, zoom = 1 } = opts
  ctx.font = `600 ${Math.max(8, 9 * zoom)}px 'JetBrains Mono', monospace`
  ctx.textAlign = 'center'
  ctx.fillStyle = selected ? CYAN : dimmed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)'
  ctx.fillText(label, p.x, p.y - 6 * zoom)
}