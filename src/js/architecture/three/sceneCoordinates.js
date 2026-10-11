// Mapea coordenadas de diseño (740×868) a coordenadas de escena Three.js
// Copiado de la web canónica: hod-software/src/components/architecture/three/sceneCoordinates.js
// Adaptación alpine: las conexiones llevan `layer` (capa dueña del draw-in)
// en lugar del número de `stage`, para respetar el orden narrativo del demo.

import {
  APPLICATION_ANCHORS,
  INTERFACE_ANCHORS,
  INFRASTRUCTURE_ANCHORS,
  AI_CAPABILITIES,
  SECURITY_ENVELOPE,
} from '../data.js'

const X_SCALE = 6.31 / 440
const Y_SCALE = 7.4 / 504
const Z_SCALE = 0.012

export function mapArchitectureNode(node) {
  return {
    ...node,
    x: node.x * X_SCALE,
    y: -node.y * Y_SCALE,
    z: node.z * Z_SCALE,
  }
}

export const SCENE_COORDINATES = {
  data: { id: 'data-core', label: 'DATA', x: 0, y: 0, z: -0.18, radius: 57 * Y_SCALE },
  domain: { id: 'domain-ring', label: 'DOMAIN', x: 0, y: 0, z: -0.52, radius: 91 * Y_SCALE },
  application: APPLICATION_ANCHORS.map(mapArchitectureNode),
  interface: INTERFACE_ANCHORS.map(mapArchitectureNode),
  infrastructure: INFRASTRUCTURE_ANCHORS.map(mapArchitectureNode),
  ai: AI_CAPABILITIES.map(mapArchitectureNode),
  security: {
    radius: SECURITY_ENVELOPE.radius * ((X_SCALE + Y_SCALE) / 2),
    minZ: -0.85,
    maxZ: 1.05,
  },
}

export const SCENE_CONNECTIONS = [
  { from: 'data-core', to: 'domain-ring', layer: 'domain' },
  ...APPLICATION_ANCHORS.map((node) => ({ from: node.id, to: node.target, layer: 'application' })),
  ...INTERFACE_ANCHORS.map((node) => ({ from: node.id, to: node.target, layer: 'interface' })),
  ...INFRASTRUCTURE_ANCHORS.map((node) => ({ from: node.id, to: node.target, layer: 'infrastructure' })),
  ...AI_CAPABILITIES.map((node) => ({ from: node.id, to: node.target, layer: 'ai', ai: true })),
]
