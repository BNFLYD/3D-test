// Construye el grafo de arquitectura HOD (glyph extruido + capas + conexiones + seguridad)
// Copiado de la web canónica: hod-software/src/components/architecture/three/createArchitectureScene.js
// Adaptación alpine: owner de conexiones por `layer` en vez de `stage`, labels con Monaspace Argon.

import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { SCENE_CONNECTIONS, SCENE_COORDINATES } from './sceneCoordinates.js'

const CYAN = '#00d4ff'
const MODEL_HEIGHT = 7.4

function hexShape(radius) {
  const shape = new THREE.Shape()
  for (let index = 0; index < 6; index += 1) {
    const angle = Math.PI / 6 + index * Math.PI / 3
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (index === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

function createLabel(text, accent = false) {
  const element = document.createElement('span')
  element.textContent = text
  element.className = 'font-mono'
  Object.assign(element.style, {
    color: accent ? CYAN : 'rgba(242,247,248,.72)',
    fontFamily: "'Monaspace Argon', monospace",
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '.08em',
    whiteSpace: 'nowrap',
    opacity: '0',
    transition: 'opacity .15s linear',
    textShadow: '0 1px 8px #050607, 0 0 4px #050607',
    background: 'rgba(5,6,7,.58)',
    padding: '2px 4px',
  })
  const label = new CSS2DObject(element)
  label.visible = false
  return label
}

function createLayer(name) {
  const group = new THREE.Group()
  group.name = name
  return { group, materials: [], labels: [], connections: [] }
}

function addLabel(layer, text, position, accent = false) {
  const label = createLabel(text, accent)
  label.position.copy(position)
  layer.group.add(label)
  layer.labels.push(label)
  return label
}

function createNode(layer, node, material, radius = 0.18) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 0.18, 6, 1, false)
  geometry.rotateX(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(node.x, node.y, node.z)
  layer.group.add(mesh)
  addLabel(layer, node.label, new THREE.Vector3(node.x, node.y + 0.3, node.z + 0.12), true)
  return mesh
}

function createConnection(from, to, material, ai = false) {
  const points = Array.from({ length: 25 }, (_, index) => {
    const t = index / 24
    return new THREE.Vector3().lerpVectors(from, to, t)
  })
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  geometry.setDrawRange(0, 0)
  const line = new THREE.Line(geometry, material)
  const pulseMaterial = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, toneMapped: false })
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(ai ? 0.055 : 0.038, 8, 6), pulseMaterial)
  pulse.visible = false
  return { line, pulse, points, material, pulseMaterial, geometry, progress: 0 }
}

function createSecurityGeometry(radius, minZ, maxZ) {
  const vertices = []
  const segmentsPerEdge = 5
  const top = []
  const bottom = []
  for (let index = 0; index < 6; index += 1) {
    const angle = Math.PI / 6 + index * Math.PI / 3
    top.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, maxZ))
    bottom.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, minZ))
  }

  const addEdge = (start, end) => {
    for (let index = 0; index < segmentsPerEdge; index += 1) {
      vertices.push(
        new THREE.Vector3().lerpVectors(start, end, index / segmentsPerEdge),
        new THREE.Vector3().lerpVectors(start, end, (index + 1) / segmentsPerEdge),
      )
    }
  }

  for (let index = 0; index < 6; index += 1) {
    const next = (index + 1) % 6
    addEdge(top[index], top[next])
    addEdge(bottom[index], bottom[next])
    addEdge(bottom[index], top[index])
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(vertices)
  geometry.setDrawRange(0, 0)
  return geometry
}

export function createArchitectureScene({ geometries, sourceBounds }) {
  const root = new THREE.Group()
  root.name = 'hod-architecture-root'
  const disposableMaterials = new Set()
  const nodeMap = new Map()

  const glyph = createLayer('glyph')
  // El glyph (logo extruido) nace transparente: materializa al llegar la etapa
  // de IA (penúltima) y brilla pleno en la final — lo maneja updateArchitectureScene
  const glyphFront = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false, transparent: true, opacity: 0 })
  const glyphSide = new THREE.MeshStandardMaterial({ color: '#071b21', roughness: 0.92, metalness: 0.04, transparent: true, opacity: 0 })
  const glyphEdges = new THREE.LineBasicMaterial({ color: '#064958', transparent: true, opacity: 0, toneMapped: false })
  disposableMaterials.add(glyphFront).add(glyphSide).add(glyphEdges)
  glyph.materials.push(glyphFront, glyphSide, glyphEdges)
  glyph.frontMaterial = glyphFront
  glyph.sideMaterial = glyphSide
  glyph.edgeMaterial = glyphEdges

  const svgGroup = new THREE.Group()
  svgGroup.rotation.x = Math.PI
  svgGroup.scale.setScalar(MODEL_HEIGHT / sourceBounds.height)
  geometries.forEach((geometry, index) => {
    const mesh = new THREE.Mesh(geometry, [glyphFront, glyphSide])
    mesh.name = `hod-shape-${String(index + 1).padStart(2, '0')}`
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 28), glyphEdges)
    mesh.add(edges)
    svgGroup.add(mesh)
  })
  glyph.group.add(svgGroup)
  root.add(glyph.group)

  const data = createLayer('data')
  const dataMaterial = new THREE.MeshStandardMaterial({ color: '#063642', emissive: '#002b35', emissiveIntensity: 0.25, transparent: true, opacity: 0, roughness: 0.84, depthWrite: false })
  disposableMaterials.add(dataMaterial)
  data.materials.push(dataMaterial)
  const dataGeometry = new THREE.CylinderGeometry(SCENE_COORDINATES.data.radius, SCENE_COORDINATES.data.radius, 0.28, 6)
  dataGeometry.rotateX(Math.PI / 2)
  const dataMesh = new THREE.Mesh(dataGeometry, dataMaterial)
  dataMesh.position.z = SCENE_COORDINATES.data.z
  data.group.add(dataMesh)
  data.mesh = dataMesh
  addLabel(data, 'DATOS', new THREE.Vector3(0, SCENE_COORDINATES.data.radius + 0.23, 0.36), true)
  nodeMap.set('data-core', new THREE.Vector3(0, 0, 0.15))
  root.add(data.group)

  const domain = createLayer('domain')
  const domainMaterial = new THREE.MeshStandardMaterial({ color: '#10282e', transparent: true, opacity: 0, roughness: 0.9, depthWrite: false })
  disposableMaterials.add(domainMaterial)
  domain.materials.push(domainMaterial)
  const outer = hexShape(SCENE_COORDINATES.domain.radius)
  outer.holes.push(hexShape(SCENE_COORDINATES.data.radius * 1.12))
  const domainGeometry = new THREE.ExtrudeGeometry(outer, { depth: 0.14, bevelEnabled: false, curveSegments: 1 })
  domainGeometry.translate(0, 0, SCENE_COORDINATES.domain.z)
  const domainMesh = new THREE.Mesh(domainGeometry, domainMaterial)
  domain.group.add(domainMesh)
  domain.mesh = domainMesh
  addLabel(domain, 'DOMINIO', new THREE.Vector3(0, SCENE_COORDINATES.domain.radius + 0.2, -0.24))
  nodeMap.set('domain-ring', new THREE.Vector3(SCENE_COORDINATES.domain.radius * 0.74, 0, -0.18))
  root.add(domain.group)

  const nodeMaterial = (color = '#123039') => {
    const material = new THREE.MeshStandardMaterial({ color, emissive: '#002a33', emissiveIntensity: 0.18, transparent: true, opacity: 0, roughness: 0.88, depthWrite: false })
    disposableMaterials.add(material)
    return material
  }

  const application = createLayer('application')
  const applicationMaterial = nodeMaterial()
  application.materials.push(applicationMaterial)
  SCENE_COORDINATES.application.forEach((node) => {
    createNode(application, node, applicationMaterial)
    nodeMap.set(node.id, new THREE.Vector3(node.x, node.y, node.z))
  })
  root.add(application.group)

  const interfaceLayer = createLayer('interface')
  const interfaceMaterial = nodeMaterial('#0b313b')
  interfaceLayer.materials.push(interfaceMaterial)
  SCENE_COORDINATES.interface.forEach((node) => {
    createNode(interfaceLayer, node, interfaceMaterial)
    nodeMap.set(node.id, new THREE.Vector3(node.x, node.y, node.z))
  })
  root.add(interfaceLayer.group)

  const infrastructure = createLayer('infrastructure')
  const infrastructureMaterial = nodeMaterial('#13272d')
  infrastructure.materials.push(infrastructureMaterial)
  SCENE_COORDINATES.infrastructure.forEach((node) => {
    createNode(infrastructure, node, infrastructureMaterial)
    nodeMap.set(node.id, new THREE.Vector3(node.x, node.y, node.z))
  })
  const baseMaterial = new THREE.MeshStandardMaterial({ color: '#0b1417', transparent: true, opacity: 0, roughness: 1, depthWrite: false })
  disposableMaterials.add(baseMaterial)
  infrastructure.materials.push(baseMaterial)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.72, 3.72, 0.12, 6), baseMaterial)
  base.geometry.rotateX(Math.PI / 2)
  base.position.z = -0.9
  infrastructure.group.add(base)
  root.add(infrastructure.group)

  const ai = createLayer('ai')
  const aiMaterial = nodeMaterial('#06404d')
  ai.materials.push(aiMaterial)
  SCENE_COORDINATES.ai.forEach((node) => {
    createNode(ai, node, aiMaterial, 0.2)
    nodeMap.set(node.id, new THREE.Vector3(node.x, node.y, node.z))
  })
  root.add(ai.group)

  const connectionsGroup = new THREE.Group()
  connectionsGroup.name = 'connections'
  root.add(connectionsGroup)
  SCENE_CONNECTIONS.forEach((connection) => {
    const from = nodeMap.get(connection.from)
    const to = nodeMap.get(connection.to)
    if (!from || !to) return
    const material = new THREE.LineBasicMaterial({ color: connection.ai ? CYAN : '#3b7582', transparent: true, opacity: 0, toneMapped: false })
    disposableMaterials.add(material)
    const item = createConnection(from, to, material, connection.ai)
    item.layer = connection.layer
    connectionsGroup.add(item.line, item.pulse)
    const owner = connection.layer === 'application' ? application
      : connection.layer === 'interface' ? interfaceLayer
      : connection.layer === 'infrastructure' ? infrastructure
      : connection.layer === 'ai' ? ai
      : domain
    owner.connections.push(item)
  })

  const security = createLayer('security')
  const securityMaterial = new THREE.LineDashedMaterial({ color: CYAN, transparent: true, opacity: 0, dashSize: 0.1, gapSize: 0.09, toneMapped: false })
  disposableMaterials.add(securityMaterial)
  security.materials.push(securityMaterial)
  const securityGeometry = createSecurityGeometry(SCENE_COORDINATES.security.radius, SCENE_COORDINATES.security.minZ, SCENE_COORDINATES.security.maxZ)
  const securityLines = new THREE.LineSegments(securityGeometry, securityMaterial)
  securityLines.computeLineDistances()
  security.group.add(securityLines)
  security.lines = securityLines
  addLabel(security, 'SEGURIDAD / TRANSVERSAL', new THREE.Vector3(SCENE_COORDINATES.security.radius + 0.45, 0, SCENE_COORDINATES.security.maxZ), true)
  root.add(security.group)

  const grid = new THREE.GridHelper(10, 10, '#214049', '#14272c')
  grid.rotation.x = Math.PI / 2
  grid.position.z = -1.14
  grid.material.transparent = true
  grid.material.opacity = 0.12
  grid.material.depthWrite = false
  disposableMaterials.add(grid.material)
  root.add(grid)

  return {
    root,
    grid,
    layers: { glyph, data, domain, application, interface: interfaceLayer, infrastructure, security, ai },
    disposableMaterials,
  }
}

export function disposeArchitectureScene(graph) {
  graph.root.traverse((object) => {
    object.geometry?.dispose()
    if (object.isCSS2DObject) object.element.remove()
  })
  graph.disposableMaterials.forEach((material) => material.dispose())
}
