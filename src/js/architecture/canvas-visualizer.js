// HOD System Architecture - Canvas 2D Visualizer (vanilla)
// Portado de next-test/src/components/architecture/ArchitectureVisualizer.jsx
// Adaptado al estado de Alpine.js: escucha 'app-step-changed' y 'app-explode-changed'

import { NODES, CONNECTIONS, AI_CAPABILITIES, SECURITY_ENVELOPE } from './data.js'
import { project } from './projection.js'
import { drawBlock3D, drawCylinder3D, drawConnectionLine, drawSecurityEnvelope, drawNodeLabel } from './draw.js'

const CYAN = '#00f3ff'

// Posición de cámara fija — ajustar estos valores para centrar el diagrama
const FRAME = {
  angleX: 0.55,
  angleY: -0.78,
  zoom: 1,
  panX: 0,
  panY: 0,
}

// Mapeo de los pasos de Alpine (1-8) a flags de visibilidad acumulativa
// 1 Experience · 2 Application · 3 Domain · 4 Data · 5 Infrastructure ·
// 6 Security · 7 AI · 8 Completo
const STEP_VIS = {
  1: { interface: true, application: false, domain: false, data: false, infrastructure: false, security: false, ai: false },
  2: { interface: true, application: true, domain: false, data: false, infrastructure: false, security: false, ai: false },
  3: { interface: true, application: true, domain: true, data: false, infrastructure: false, security: false, ai: false },
  4: { interface: true, application: true, domain: true, data: true, infrastructure: false, security: false, ai: false },
  5: { interface: true, application: true, domain: true, data: true, infrastructure: true, security: false, ai: false },
  6: { interface: true, application: true, domain: true, data: true, infrastructure: true, security: true, ai: false },
  7: { interface: true, application: true, domain: true, data: true, infrastructure: true, security: true, ai: true },
  8: { interface: true, application: true, domain: true, data: true, infrastructure: true, security: true, ai: true },
}
const STEP_KEYS = ['interface', 'application', 'domain', 'data', 'infrastructure']

function nodeAt(node, t) {
  // t > 1 expande radialmente desde el origen (efecto "explode")
  return { ...node, x: node.x * t, y: node.y * t, z: node.z * t }
}

export function initCanvasVisualizer({ container, canvas }) {
  if (!container || !canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const engine = {
    angleX: FRAME.angleX,
    angleY: FRAME.angleY,
    zoom: FRAME.zoom,
    panX: FRAME.panX,
    panY: FRAME.panY,
    dragging: false,
    lastX: 0,
    lastY: 0,
    step: 1,         // paso del state Alpine (1-8)
    explode: 1,      // factor radial (1 = neutral)
    secFade: 0,      // fade-in del sobre de seguridad
    reduced: false,
    time: 0,
  }

  let dpr = 1
  let initialized = false
  let rafId = null

  const m = window.matchMedia('(prefers-reduced-motion: reduce)')
  const updateReduced = () => { engine.reduced = m.matches }
  updateReduced()
  m.addEventListener('change', updateReduced)

  const resize = () => {
    dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    initialized = true
  }

  const ro = new ResizeObserver(resize)
  ro.observe(container)
  window.addEventListener('resize', resize)
  requestAnimationFrame(resize)

  const render = () => {
    rafId = requestAnimationFrame(render)
    if (!initialized) return
    const rect = container.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w === 0 || h === 0) return

    const s = engine
    s.time += 0.016

    ctx.clearRect(0, 0, w, h)
    ctx.save()
    ctx.translate(w / 2 + s.panX, h / 2 + s.panY)

    const t = s.explode
    const vis = STEP_VIS[s.step] || STEP_VIS[1]
    const showAI = vis.ai
    const showSecurity = vis.security

    const nodeVisible = (node) => !!vis[node.cat]

    CONNECTIONS.forEach((conn, ci) => {
      const fromNode = NODES.find(n => n.id === conn.from)
      const toNode = NODES.find(n => n.id === conn.to)
      if (!fromNode || !toNode) return
      if (!nodeVisible(fromNode) || !nodeVisible(toNode)) return

      const fn = nodeAt(fromNode, t)
      const tn = nodeAt(toNode, t)
      const p1 = project(fn.x, fn.y, fn.z + (fn.h || 10), s.angleX, s.angleY, s.zoom)
      const p2 = project(tn.x, tn.y, tn.z + (tn.h || 10), s.angleX, s.angleY, s.zoom)
      const pulse = s.reduced ? 0 : ((s.time * 0.15 + ci * 0.3) % 1)
      drawConnectionLine(ctx, p1, p2, { pulse, active: s.step >= 8 })
    })

    if (showAI) {
      AI_CAPABILITIES.forEach((ai) => {
        const targetNode = NODES.find(n => n.id === ai.target)
        if (!targetNode || !nodeVisible(targetNode)) return
        const tn = nodeAt(targetNode, t)
        const aiNode = nodeAt(ai, t)
        const p1 = project(aiNode.x, aiNode.y, aiNode.z, s.angleX, s.angleY, s.zoom)
        const p2 = project(tn.x, tn.y, tn.z + (tn.h || 10), s.angleX, s.angleY, s.zoom)
        const pulse = s.reduced ? 0 : ((s.time * 0.12 + 0.5) % 1)
        drawConnectionLine(ctx, p1, p2, { pulse, isAI: true })
      })
    }

    NODES.forEach((n) => {
      if (!nodeVisible(n)) return
      const nd = nodeAt(n, t)
      if (n.r) {
        drawCylinder3D(ctx, nd.x, nd.y, nd.z, n.r, n.h, s.angleX, s.angleY, s.zoom, { selected: false })
      } else {
        drawBlock3D(ctx, nd.x, nd.y, nd.z, n.w, n.d, n.h, s.angleX, s.angleY, s.zoom, { selected: false })
      }
      const p = project(nd.x, nd.y, nd.z + (n.h || n.r || 10) + 4, s.angleX, s.angleY, s.zoom)
      drawNodeLabel(ctx, p, n.label, { zoom: s.zoom })
    })

    if (showAI) {
      AI_CAPABILITIES.forEach((ai) => {
        const nd = nodeAt(ai, t)
        drawBlock3D(ctx, nd.x, nd.y, nd.z, 30, 25, 8, s.angleX, s.angleY, s.zoom, {
          fill: '#002a33',
          stroke: CYAN,
          selected: true,
        })
        const p = project(nd.x, nd.y, nd.z + 12, s.angleX, s.angleY, s.zoom)
        drawNodeLabel(ctx, p, ai.label, { selected: true, zoom: s.zoom })
      })
    }

    if (showSecurity) {
      s.secFade = s.reduced ? 1 : Math.min(s.secFade + 0.04, 1)
      const activeNodes = NODES.filter(n => nodeVisible(n)).map(n => nodeAt(n, t))
      if (activeNodes.length > 0) {
        drawSecurityEnvelope(ctx, activeNodes, s.angleX, s.angleY, s.zoom, {
          pad: SECURITY_ENVELOPE.padding,
          progress: s.secFade,
        })
      }
    } else {
      s.secFade = 0
    }

    // Guías de rejilla (siempre visibles)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 0.5
    ctx.setLineDash([8, 16])
    for (let i = -200; i <= 200; i += 50) {
      const pa = project(i, -120, 0, s.angleX, s.angleY, s.zoom)
      const pb = project(i, 120, 0, s.angleX, s.angleY, s.zoom)
      ctx.beginPath()
      ctx.moveTo(pa.x, pa.y)
      ctx.lineTo(pb.x, pb.y)
      ctx.stroke()
    }
    ctx.setLineDash([])

    ctx.restore()
  }

  // ---- Interacciones de mouse ----
  const onDown = (e) => {
    engine.dragging = true
    engine.lastX = e.clientX
    engine.lastY = e.clientY
    canvas.style.cursor = 'grabbing'
  }
  const onUp = () => {
    engine.dragging = false
    canvas.style.cursor = 'grab'
  }
  const onMove = (e) => {
    if (!engine.dragging) return
    const dx = e.clientX - engine.lastX
    const dy = e.clientY - engine.lastY
    if (e.shiftKey) {
      // Solo desplazamiento (pan) con shift+drag; rotación y zoom fijos
      engine.panX += dx
      engine.panY += dy
    }
    engine.lastX = e.clientX
    engine.lastY = e.clientY
  }

  // La rueda NO hace zoom aquí: se deja propagar a window para navegar etapas

  // ---- Touch (1 dedo = pan; sin pinch-zoom) ----
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      engine.dragging = true
      engine.lastX = e.touches[0].clientX
      engine.lastY = e.touches[0].clientY
    }
  }
  const onTouchMove = (e) => {
    if (e.touches.length === 1 && engine.dragging) {
      e.preventDefault()
      engine.panX += e.touches[0].clientX - engine.lastX
      engine.panY += e.touches[0].clientY - engine.lastY
      engine.lastX = e.touches[0].clientX
      engine.lastY = e.touches[0].clientY
    }
  }
  const onTouchEnd = (e) => {
    if (e.touches.length === 0) {
      engine.dragging = false
    } else if (e.touches.length === 1) {
      engine.lastX = e.touches[0].clientX
      engine.lastY = e.touches[0].clientY
    }
  }

  canvas.addEventListener('mousedown', onDown)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('mousemove', onMove)
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  // ---- Listeners del estado Alpine ----
  const onStepChanged = (e) => {
    engine.step = e.detail?.step ?? 1
  }
  const onExplodeChanged = (e) => {
    // explodeFactor de Alpine: 0 → 1.2 → explode: 1 → 1.6
    engine.explode = 1 + (e.detail?.factor ?? 0) * 0.5
  }
  window.addEventListener('app-step-changed', onStepChanged)
  window.addEventListener('app-explode-changed', onExplodeChanged)

  rafId = requestAnimationFrame(render)

  // ---- API expuesta ----
  return {
    setStep(step) { engine.step = step },
    destroy() {
      if (rafId) cancelAnimationFrame(rafId)
      ro.disconnect()
      m.removeEventListener('change', updateReduced)
      window.removeEventListener('resize', resize)
      window.removeEventListener('app-step-changed', onStepChanged)
      window.removeEventListener('app-explode-changed', onExplodeChanged)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    },
    STEP_KEYS,
  }
}