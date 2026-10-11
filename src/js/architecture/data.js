// HOD System Architecture — datos del gráfico
// Copiado de la web canónica: hod-software/src/components/architecture/data.js
// Coordenadas en espacio de diseño 740×868 (mismas que en la web)

const TAU = Math.PI * 2

function rotatePoint(point, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  }
}

// Un trazo angular repetido seis veces forma las piezas entrelazadas del glyph HOD.
const BASE_GLYPH_PATH = [
  { x: 0, y: -238 },
  { x: 0, y: -164 },
  { x: -68, y: -125 },
  { x: -68, y: -48 },
  { x: -4, y: -11 },
  { x: 48, y: -41 },
]

export const GLYPH_PARTS = Array.from({ length: 6 }, (_, index) => ({
  id: `glyph-${index}`,
  category: index === 0 ? 'interface' : index < 3 ? 'application' : 'infrastructure',
  path: BASE_GLYPH_PATH.map((point) => rotatePoint(point, index * (TAU / 6))),
  z: index % 2 === 0 ? 18 : 12,
  width: 28,
  height: 18,
  label: index === 0 ? 'INTERFAZ' : index < 3 ? 'APLICACIÓN' : 'INFRAESTRUCTURA',
}))

export const DATA_CORE = {
  id: 'data-core',
  category: 'data',
  x: 0,
  y: 0,
  z: 38,
  radius: 57,
  height: 30,
  label: 'DATOS',
  items: ['Bases de datos', 'Documentos', 'Registros', 'Conocimiento'],
}

export const DOMAIN_RING = {
  id: 'domain-ring',
  category: 'domain',
  x: 0,
  y: 0,
  z: 28,
  radius: 91,
  label: 'DOMINIO',
  items: ['Entidades', 'Reglas', 'Modelo de negocio'],
}

export const APPLICATION_ANCHORS = [
  { id: 'workflow', label: 'FLUJOS', x: -106, y: -54, z: 38, target: 'domain-ring' },
  { id: 'services', label: 'SERVICIOS', x: 106, y: -54, z: 38, target: 'data-core' },
]

export const INTERFACE_ANCHORS = [
  { id: 'web', label: 'WEB', x: -68, y: -164, z: 58, target: 'workflow' },
  { id: 'mobile', label: 'MÓVIL', x: 0, y: -238, z: 58, target: 'services' },
  { id: 'api', label: 'API', x: 68, y: -164, z: 58, target: 'services' },
]

export const INFRASTRUCTURE_ANCHORS = [
  { id: 'compute', label: 'CÓMPUTO', x: -112, y: 118, z: 4, target: 'data-core' },
  { id: 'network', label: 'RED', x: 112, y: 118, z: 4, target: 'data-core' },
]

export const SYSTEM_CONNECTIONS = [
  { from: 'data-core', to: 'domain-ring', type: 'internal' },
  ...APPLICATION_ANCHORS.map((node) => ({ from: node.id, to: node.target, type: 'internal' })),
  ...INTERFACE_ANCHORS.map((node) => ({ from: node.id, to: node.target, type: 'internal' })),
  ...INFRASTRUCTURE_ANCHORS.map((node) => ({ from: node.id, to: node.target, type: 'internal' })),
]

export const AI_CAPABILITIES = [
  { id: 'assistant', label: 'ASISTENTE IA', x: -275, y: -152, z: 86, target: 'web' },
  { id: 'automation', label: 'AUTOMATIZACIÓN', x: 270, y: -20, z: 62, target: 'services' },
  { id: 'semantic-search', label: 'BÚSQUEDA SEMÁNTICA', x: 218, y: 166, z: 32, target: 'data-core' },
  { id: 'agents', label: 'AGENTES', x: -224, y: 160, z: 48, target: 'domain-ring' },
]

export const SECURITY_ENVELOPE = {
  radius: 292,
  z: 0,
  height: 124,
  label: 'SEGURIDAD / TRANSVERSAL',
}

export const STEPS = [
  { key: 'overview', eyebrow: 'LÓGICA HOD', title: 'Cómo se conectan\nlas distintas capas.' },
  { key: 'data', eyebrow: 'Datos', title: 'El sistema\nempieza acá.' },
  { key: 'domain', eyebrow: 'Dominio', title: 'Conocimiento alrededor\ndel núcleo.' },
  { key: 'application', eyebrow: 'Aplicación', title: 'Los procesos se vuelven\nestructura.' },
  { key: 'interface', eyebrow: 'Interfaz', title: 'Todos los canales,\nuna plataforma.' },
  { key: 'infrastructure', eyebrow: 'Infraestructura', title: 'Un sistema diseñado\npara funcionar.' },
  { key: 'security', eyebrow: 'Seguridad', title: 'Protección alrededor\nde cada componente.' },
  { key: 'intelligence', eyebrow: 'Inteligencia', title: 'IA cuando\ntiene sentido.' },
  { key: 'complete', eyebrow: 'HOD integrado', title: 'Productos distintos.\nUna misma base.' },
]

export const INTERNAL_ANCHORS = [
  DATA_CORE,
  DOMAIN_RING,
  ...APPLICATION_ANCHORS,
  ...INTERFACE_ANCHORS,
  ...INFRASTRUCTURE_ANCHORS,
]
