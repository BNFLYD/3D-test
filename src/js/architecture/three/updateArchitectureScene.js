// Actualización del grafo por línea de tiempo (fade + scale por capa, draw-in de conexiones)
// Copiado de la web canónica: hod-software/src/components/architecture/three/updateArchitectureScene.js
//
// Adaptación alpine: la web narra Data→Domain→Application→Interface→Infrastructure
// (stages 1–5), pero el demo alpine narra bottom-up: Infrastructure→Data→Domain→
// Application→Experience(Interface)→Security→AI→Complete. Remapeamos las etapas
// para que el gráfico respete el orden narrativo del demo sin tocar app.js ni
// la escena principal de models3d/.

import * as THREE from 'three'

const CYAN = new THREE.Color('#00d4ff')
const DIM_CYAN = new THREE.Color('#0b6c80')

// Etapa de cada capa en la línea de tiempo (0–9), en el orden narrativo del demo alpine
const STAGE = {
  infrastructure: 1,
  data: 2,
  domain: 3,
  application: 4,
  interface: 5,
  security: 6,
  ai: 7,
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function smooth(value) {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

function layerProgress(timeline, stage, reduced) {
  if (reduced) return timeline >= stage ? 1 : 0
  return smooth((timeline - stage + 0.22) / 0.72)
}

function setLayer(layer, opacity, scale = 1) {
  layer.group.visible = opacity > 0.005
  layer.group.scale.setScalar(scale)
  layer.materials.forEach((material) => {
    material.opacity = opacity
  })
  layer.labels.forEach((label) => {
    label.visible = opacity > 0.18
    label.element.style.opacity = String(opacity)
  })
}

function updateConnections(layer, opacity, time) {
  layer.connections.forEach((connection, index) => {
    const progress = clamp01(opacity)
    connection.geometry.setDrawRange(0, Math.max(0, Math.ceil(connection.points.length * progress)))
    connection.material.opacity = progress * 0.72
    connection.line.visible = progress > 0.01
    connection.pulse.visible = progress > 0.92
    connection.pulseMaterial.opacity = progress
    if (connection.pulse.visible) {
      const pulsePosition = (time * 0.22 + index * 0.27) % 1
      const pointIndex = Math.min(connection.points.length - 1, Math.floor(pulsePosition * connection.points.length))
      connection.pulse.position.copy(connection.points[pointIndex])
    }
  })
}

export function updateArchitectureScene(graph, progress, time, reduced = false) {
  const timeline = clamp01(progress) * 9
  const overview = 1 - smooth(timeline / 1.1)
  const complete = smooth((timeline - 7.55) / 0.45)
  const glyphStrength = 0.48 + Math.max(overview, complete) * 0.52
  graph.layers.glyph.frontMaterial.color.copy(DIM_CYAN).lerp(CYAN, glyphStrength)
  graph.layers.glyph.sideMaterial.emissive.set('#001116')
  graph.layers.glyph.sideMaterial.emissiveIntensity = 0.12 + complete * 0.18

  const infrastructureProgress = Math.max(overview * 0.12, layerProgress(timeline, STAGE.infrastructure, reduced))
  const dataProgress = Math.max(overview * 0.18, layerProgress(timeline, STAGE.data, reduced))
  const domainProgress = Math.max(overview * 0.16, layerProgress(timeline, STAGE.domain, reduced))
  const applicationProgress = Math.max(overview * 0.14, layerProgress(timeline, STAGE.application, reduced))
  const interfaceProgress = Math.max(overview * 0.12, layerProgress(timeline, STAGE.interface, reduced))
  const securityProgress = layerProgress(timeline, STAGE.security, reduced)
  const aiProgress = layerProgress(timeline, STAGE.ai, reduced)

  setLayer(graph.layers.data, dataProgress, 0.72 + dataProgress * 0.28)
  setLayer(graph.layers.domain, domainProgress, 0.78 + domainProgress * 0.22)
  setLayer(graph.layers.application, applicationProgress, 0.82 + applicationProgress * 0.18)
  setLayer(graph.layers.interface, interfaceProgress, 0.82 + interfaceProgress * 0.18)
  setLayer(graph.layers.infrastructure, infrastructureProgress, 0.9 + infrastructureProgress * 0.1)
  setLayer(graph.layers.security, securityProgress)
  setLayer(graph.layers.ai, aiProgress, 0.84 + aiProgress * 0.16)

  updateConnections(graph.layers.domain, domainProgress, time)
  updateConnections(graph.layers.application, applicationProgress, time)
  updateConnections(graph.layers.interface, interfaceProgress, time)
  // Las conexiones de infraestructura apuntan al núcleo de Datos, que en el
  // orden narrativo del demo llega DESPUÉS: se trazan recién cuando ambos
  // extremos existen (en la web no hacía falta porque infra llega al final).
  updateConnections(graph.layers.infrastructure, Math.min(infrastructureProgress, dataProgress), time)
  updateConnections(graph.layers.ai, aiProgress, time)

  const securityCount = graph.layers.security.lines.geometry.attributes.position.count
  graph.layers.security.lines.geometry.setDrawRange(0, Math.ceil(securityCount * securityProgress))
  graph.grid.material.opacity = 0.05 + infrastructureProgress * 0.08
}
