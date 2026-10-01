// Modelo 2D: contenedor 3D isométrico (beige con laterales corrugados)

import { project } from '../projection.js'
import {
    CYAN_GLOW,
    EDGE,
    EDGE_ACTIVE,
    CONTAINER_COLOR,
    CONTAINER_TOP,
    CONTAINER_BOTTOM,
    CONTAINER_LEFT,
    CONTAINER_RIGHT
} from './palette.js'

export function drawBlock3D(ctx, x, y, z, w, d, h, angleX, angleY, zoom, opts = {}) {
    const { stroke = EDGE, selected = false } = opts
    const hw = w / 2
    const hd = d / 2

    const p = [
        project(x - hw, y - hd, z, angleX, angleY, zoom),
        project(x + hw, y - hd, z, angleX, angleY, zoom),
        project(x + hw, y + hd, z, angleX, angleY, zoom),
        project(x - hw, y + hd, z, angleX, angleY, zoom),
        project(x - hw, y - hd, z + h, angleX, angleY, zoom),
        project(x + hw, y - hd, z + h, angleX, angleY, zoom),
        project(x + hw, y + hd, z + h, angleX, angleY, zoom),
        project(x - hw, y + hd, z + h, angleX, angleY, zoom),
    ]

    ctx.save()
    ctx.globalAlpha = 0.5 // Transparencia al 50% en los contenedores

    if (selected) {
        ctx.shadowColor = CYAN_GLOW
        ctx.shadowBlur = 15
    }

    // Tapa inferior
    ctx.fillStyle = CONTAINER_BOTTOM
    ctx.beginPath()
    ctx.moveTo(p[0].x, p[0].y)
    ctx.lineTo(p[1].x, p[1].y)
    ctx.lineTo(p[2].x, p[2].y)
    ctx.lineTo(p[3].x, p[3].y)
    ctx.closePath()
    ctx.fill()

    // Tapa superior del contenedor
    ctx.fillStyle = selected ? CONTAINER_TOP : CONTAINER_COLOR
    ctx.beginPath()
    ctx.moveTo(p[4].x, p[4].y)
    ctx.lineTo(p[5].x, p[5].y)
    ctx.lineTo(p[6].x, p[6].y)
    ctx.lineTo(p[7].x, p[7].y)
    ctx.closePath()
    ctx.fill()

    // Lateral izquierdo (con textura corrugada)
    ctx.fillStyle = CONTAINER_LEFT
    ctx.beginPath()
    ctx.moveTo(p[0].x, p[0].y)
    ctx.lineTo(p[1].x, p[1].y)
    ctx.lineTo(p[5].x, p[5].y)
    ctx.lineTo(p[4].x, p[4].y)
    ctx.closePath()
    ctx.fill()

    // Líneas de corrugación en el lateral izquierdo
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = 0.8
    for (let i = 1; i <= 3; i++) {
        const fx = p[0].x + (p[1].x - p[0].x) * (i / 4)
        const fy = p[0].y + (p[1].y - p[0].y) * (i / 4)
        const fz5 = p[4].x + (p[5].x - p[4].x) * (i / 4)
        const fz6 = p[4].y + (p[5].y - p[4].y) * (i / 4)
        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.lineTo(fz5, fz6)
        ctx.stroke()
    }

    // Lateral derecho (con textura corrugada)
    ctx.fillStyle = CONTAINER_RIGHT
    ctx.beginPath()
    ctx.moveTo(p[1].x, p[1].y)
    ctx.lineTo(p[2].x, p[2].y)
    ctx.lineTo(p[6].x, p[6].y)
    ctx.lineTo(p[5].x, p[5].y)
    ctx.closePath()
    ctx.fill()

    // Líneas de corrugación en el lateral derecho
    for (let i = 1; i <= 3; i++) {
        const fx = p[1].x + (p[2].x - p[1].x) * (i / 4)
        const fy = p[1].y + (p[2].y - p[1].y) * (i / 4)
        const fz5 = p[5].x + (p[6].x - p[5].x) * (i / 4)
        const fz6 = p[5].y + (p[6].y - p[5].y) * (i / 4)
        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.lineTo(fz5, fz6)
        ctx.stroke()
    }

    // Bordes exteriores
    ctx.strokeStyle = selected ? EDGE_ACTIVE : CONTAINER_BOTTOM
    ctx.lineWidth = selected ? 1.2 : 0.8
    ctx.beginPath()
    ctx.moveTo(p[4].x, p[4].y)
    ctx.lineTo(p[5].x, p[5].y)
    ctx.lineTo(p[6].x, p[6].y)
    ctx.lineTo(p[7].x, p[7].y)
    ctx.closePath()
    ctx.stroke()

    for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(p[i].x, p[i].y)
        ctx.lineTo(p[i + 4].x, p[i + 4].y)
        ctx.stroke()
    }

    ctx.restore()
}
