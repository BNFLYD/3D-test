// Proyección isométrica - portada de next-test/utils/projection.js

export function project(x, y, z, angleX, angleY, zoom) {
  const cosY = Math.cos(angleY)
  const sinY = Math.sin(angleY)
  const cosX = Math.cos(angleX)
  const sinX = Math.sin(angleX)
  const rx = x * cosY - y * sinY
  const ry = x * sinY + y * cosY
  return { x: rx * zoom, y: ry * sinX * zoom + z * zoom }
}