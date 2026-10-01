// Modelo 2D: cilindro 3D isométrico (beige, semi-transparente)

import { project } from '../projection.js'
import { CYAN_GLOW, EDGE, EDGE_ACTIVE, CONTAINER_COLOR, CONTAINER_RIGHT } from './palette.js'

export function drawCylinder3D(ctx, x, y, z, r, h, angleX, angleY, zoom, opts = {}) {
    const { selected = false } = opts
    const top = project(x, y, z + h, angleX, angleY, zoom)
    const bot = project(x, y, z, angleX, angleY, zoom)
    const rx = r * zoom
    const ry = r * 0.5 * zoom

    ctx.save()
    ctx.globalAlpha = 0.5 // Transparencia al 50% en los cilindros

    if (selected) {
        ctx.shadowColor = CYAN_GLOW
        ctx.shadowBlur = 16
    }

    ctx.fillStyle = CONTAINER_COLOR
    ctx.beginPath()
    ctx.ellipse(top.x, top.y, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = selected ? EDGE_ACTIVE : EDGE
    ctx.lineWidth = 0.8
    ctx.stroke()

    ctx.fillStyle = CONTAINER_RIGHT
    ctx.beginPath()
    ctx.ellipse(bot.x, bot.y, rx, ry, 0, 0, Math.PI)
    ctx.lineTo(top.x - rx, top.y)
    ctx.ellipse(top.x, top.y, rx, ry, 0, Math.PI, 0, true)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
}
