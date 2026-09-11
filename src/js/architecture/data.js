// HOD System Architecture - Canvas 2D data (traducido al español)
// Portado de next-test/src/components/architecture/data.js

export const NODES = [
  // INTERACCIÓN — dispuesto espacialmente sobre el centro del dominio
  { id: 'web', cat: 'interface', label: 'Web', x: -140, y: -40, z: 110, w: 70, d: 50, h: 10 },
  { id: 'mobile', cat: 'interface', label: 'Móvil', x: 0, y: 0, z: 115, w: 50, d: 50, h: 10 },
  { id: 'api', cat: 'interface', label: 'APIs', x: 140, y: -40, z: 110, w: 70, d: 50, h: 10 },

  // APLICACIÓN — orbitando a altura media
  { id: 'workflow', cat: 'application', label: 'Motor de Workflows', x: -100, y: 50, z: 60, w: 50, d: 35, h: 14 },
  { id: 'orchestration', cat: 'application', label: 'Orquestación', x: 0, y: 0, z: 65, w: 55, d: 35, h: 14 },
  { id: 'integration', cat: 'application', label: 'Integración', x: 100, y: 50, z: 60, w: 50, d: 35, h: 14 },

  // DOMINIO — núcleo central
  { id: 'entities', cat: 'domain', label: 'Entidades', x: -60, y: 0, z: 10, w: 60, d: 50, h: 22 },
  { id: 'rules', cat: 'domain', label: 'Reglas de Negocio', x: 40, y: 0, z: 15, w: 60, d: 50, h: 22 },

  // DATOS — cilindros detrás del núcleo
  { id: 'database', cat: 'data', label: 'Bases de Datos', x: -90, y: 60, z: -50, r: 26, h: 30 },
  { id: 'documents', cat: 'data', label: 'Documentos', x: 0, y: 80, z: -55, r: 22, h: 26 },
  { id: 'cache', cat: 'data', label: 'Caché', x: 90, y: 60, z: -50, r: 22, h: 22 },

  // INFRAESTRUCTURA — bloques anchos a los costados
  { id: 'compute', cat: 'infrastructure', label: 'Cómputo', x: -160, y: 0, z: -40, w: 60, d: 45, h: 30 },
  { id: 'network', cat: 'infrastructure', label: 'Redes', x: 160, y: 0, z: -40, w: 60, d: 45, h: 30 },
]

export const CONNECTIONS = [
  // Interfaces → Aplicación
  { from: 'web', to: 'orchestration' },
  { from: 'mobile', to: 'orchestration' },
  { from: 'api', to: 'integration' },

  // Aplicación → Dominio
  { from: 'workflow', to: 'entities' },
  { from: 'orchestration', to: 'rules' },
  { from: 'integration', to: 'entities' },

  // Dominio → Datos
  { from: 'entities', to: 'database' },
  { from: 'entities', to: 'documents' },
  { from: 'rules', to: 'cache' },
  { from: 'rules', to: 'database' },

  // Infraestructura → todas las zonas
  { from: 'compute', to: 'database' },
  { from: 'compute', to: 'workflow' },
  { from: 'network', to: 'api' },
  { from: 'network', to: 'cache' },

  // Capa transversal
  { from: 'web', to: 'entities' },
  { from: 'api', to: 'rules' },
  { from: 'workflow', to: 'database' },
]

export const AI_CAPABILITIES = [
  {
    id: 'semantic-search',
    label: 'Búsqueda Semántica',
    target: 'database',
    desc: 'RAG y embeddings vectoriales sobre tus datos',
    x: -90, y: 60, z: -100,
  },
  {
    id: 'assistant',
    label: 'Asistente',
    target: 'web',
    desc: 'Interfaz de IA contextual para usuarios',
    x: -200, y: -40, z: 130,
  },
  {
    id: 'automation',
    label: 'Automatización',
    target: 'workflow',
    desc: 'Enrutamiento inteligente de procesos y decisiones',
    x: -160, y: 50, z: 40,
  },
  {
    id: 'document-intel',
    label: 'Intel. de Documentos',
    target: 'documents',
    desc: 'Clasificación, indexación y extracción',
    x: 50, y: 80, z: -100,
  },
]

export const SECURITY_ENVELOPE = {
  padding: 35,
  label: 'Seguridad',
  sublabel: 'Protección transversal',
  features: ['Identidad', 'Control de Acceso', 'Cifrado', 'Auditoría', 'Gobierno'],
}

export const STEPS = [
  { key: 'overview', eyebrow: 'Arquitectura Primero', title: 'Un sistema,\nno siete capas.' },
  { key: 'domain', eyebrow: 'Dominio', title: 'Conocimiento de negocio,\ncodificado en estructura.' },
  { key: 'application', eyebrow: 'Aplicación', title: 'Workflows que\nconectan operaciones.' },
  { key: 'interface', eyebrow: 'Interfaz', title: 'Cada canal,\nuna sola plataforma.' },
  { key: 'data', eyebrow: 'Datos', title: 'Información que\npersiste y fluye.' },
  { key: 'security', eyebrow: 'Seguridad', title: 'Protección envuelta\nalrededor de cada nodo.' },
  { key: 'intelligence', eyebrow: 'Inteligencia', title: 'IA cuando\ntiene sentido.' },
  { key: 'complete', eyebrow: 'HOD en Uno', title: 'Arquitectura primero.\nTecnología después.' },
]