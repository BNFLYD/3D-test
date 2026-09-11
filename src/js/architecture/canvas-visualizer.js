// HOD System Architecture - Canvas 2D Visualizer (vanilla)
// Portado de next-test/src/components/architecture/ArchitectureVisualizer.jsx

import { NODES, CONNECTIONS, AI_CAPABILITIES, SECURITY_ENVELOPE, STEPS } from './data.js'
import { project } from './projection.js'
import { drawBlock3D, drawCylinder3D, drawConnectionLine, drawSecurityEnvelope, drawNodeLabel } from './draw.js'

const CYAN = '#00f3ff'

function nodeAt(node, t) {
  if (node.r) {
    return { ...node, x: node.x * t, y: node.y * t, z: node.z * t }
  }
  return { ...node, x: node.x * t, y: node.y * t, z: node.z * t }
}

function stepForProgress(p) {
  const n = STEPS.length
  return Math.min(Math.floor(p * n + 0.0001), n - 1)
}

function nodeVisibleForStep(node, si) {
  const showAll = si === 0
  const showDomain = showAll || si >= 1
  const showApp = showAll || si >= 2
  const showInterface = showAll || si >= 3
  const showData = showAll || si >= 4
  const showInfra = showAll || si >= 4

  if (node.cat === 'domain') return showDomain
  if (node.cat === 'application') return showApp
  if (node.cat === 'interface') return showInterface
  if (node.cat === 'data') return showData
  if (node.cat === 'infrastructure') return showInfra
  return false
}

export function initCanvasVisualizer({ container, canvas }) {
  if (!container || !canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const engine = {
    angleX: 0.55,
    angleY: -0.78,
    zoom: 1,
    panX: 0,
    panY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    progress: 0,
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

    const t = 1
    const si = stepForProgress(s.progress)
    const showAI = si >= 6
    const showSecurity = si >= 5

    CONNECTIONS.forEach((conn, ci) => {
      const fromNode = NODES.find(n => n.id === conn.from)
      const toNode = NODES.find(n => n.id === conn.to)
      if (!fromNode || !toNode) return
      if (!nodeVisibleForStep(fromNode, si) || !nodeVisibleForStep(toNode, si)) return

      const fn = nodeAt(fromNode, t)
      const tn = nodeAt(toNode, t)
      const p1 = project(fn.x, fn.y, fn.z + (fn.h || 10), s.angleX, s.angleY, s.zoom)
      const p2 = project(tn.x, tn.y, tn.z + (tn.h || 10), s.angleX, s.angleY, s.zoom)
      const pulse = s.reduced ? 0 : ((s.time * 0.15 + ci * 0.3) % 1)
      drawConnectionLine(ctx, p1, p2, { pulse, active: si === 0 })
    })

    if (showAI) {
      AI_CAPABILITIES.forEach((ai) => {
        const targetNode = NODES.find(n => n.id === ai.target)
        if (!targetNode) return
        const tn = nodeAt(targetNode, t)
        const aiNode = nodeAt(ai, t)
        const p1 = project(aiNode.x, aiNode.y, aiNode.z, s.angleX, s.angleY, s.zoom)
        const p2 = project(tn.x, tn.y, tn.z + (tn.h || 10), s.angleX, s.angleY, s.zoom)
        const pulse = s.reduced ? 0 : ((s.time * 0.12 + 0.5) % 1)
        drawConnectionLine(ctx, p1, p2, { pulse, isAI: true })
      })
    }

    NODES.forEach((n) => {
      if (!nodeVisibleForStep(n, si)) return
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
      const secT = s.reduced ? 1 : Math.min((s.progress - 0.65) / 0.1, 1)
      const activeNodes = NODES.filter(n => nodeVisibleForStep(n, si)).map(n => nodeAt(n, t))
      drawSecurityEnvelope(ctx, activeNodes, s.angleX, s.angleY, s.zoom, {
        pad: SECURITY_ENVELOPE.padding,
        progress: Math.max(0, secT),
      })
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
      engine.panX += dx
      engine.panY += dy
    } else {
      engine.angleY += dx * 0.006
      engine.angleX += dy * 0.006
      engine.angleX = Math.max(0.15, Math.min(Math.PI / 2.3, engine.angleX))
    }
    engine.lastX = e.clientX
    engine.lastY = e.clientY
  }
  const onWheel = (e) => {
    e.preventDefault()
    engine.zoom = Math.max(0.4, Math.min(2.2, engine.zoom + e.deltaY * -0.001))
  }

  // ---- Touch ----
  let lastTouchDist = 0
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      engine.dragging = true
      engine.lastX = e.touches[0].clientX
      engine.lastY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      engine.dragging = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist = Math.sqrt(dx * dx + dy * dy)
    }
  }
  const onTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 1 && engine.dragging) {
      const dx = e.touches[0].clientX - engine.lastX
      const dy = e.touches[0].clientY - engine.lastY
      engine.angleY += dx * 0.006
      engine.angleX += dy * 0.006
      engine.angleX = Math.max(0.15, Math.min(Math.PI / 2.3, engine.angleX))
      engine.lastX = e.touches[0].clientX
      engine.lastY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (lastTouchDist > 0) {
        const scale = dist / lastTouchDist
        engine.zoom = Math.max(0.4, Math.min(2.2, engine.zoom * scale))
      }
      lastTouchDist = dist
    }
  }
  const onTouchEnd = (e) => {
    if (e.touches.length === 0) {
      engine.dragging = false
      lastTouchDist = 0
    } else if (e.touches.length === 1) {
      engine.dragging = true
      engine.lastX = e.touches[0].clientX
      engine.lastY = e.touches[0].clientY
    }
  }

  canvas.addEventListener('mousedown', onDown)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('mousemove', onMove)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  // ---- Scroll tracking ----
  let scrollRaf = 0
  const updateScroll = () => {
    scrollRaf = 0
    const rect = container.getBoundingClientRect()
    const total = container.offsetHeight - window.innerHeight
    const p = total <= 0 ? 0 : Math.min(Math.max(-rect.top / total, 0), 1)
    engine.progress = p
  }
  const onScroll = () => {
    if (scrollRaf) return
    scrollRaf = requestAnimationFrame(updateScroll)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  updateScroll()

  rafId = requestAnimationFrame(render)

  // ---- API expuesta ----
  return {
    setView(mode) {
      if (mode === 'iso') { engine.angleX = 0.55; engine.angleY = -0.78; engine.panX = 0; engine.panY = 0 }
      else if (mode === 'front') { engine.angleX = 0.08; engine.angleY = 0; engine.panX = 0; engine.panY = 0 }
      else if (mode === 'top') { engine.angleX = 1.2; engine.angleY = -0.4; engine.panX = 0; engine.panY = 0 }
    },
    reset() {
      engine.angleX = 0.55
      engine.angleY = -0.78
      engine.zoom = 1
      engine.panX = 0
      engine.panY = 0
    },
    setZoom(z) { engine.zoom = Math.max(0.4, Math.min(2.2, z)) },
    getProgress() { return engine.progress },
    destroy() {
      if (rafId) cancelAnimationFrame(rafId)
      ro.disconnect()
      m.removeEventListener('change', updateReduced)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
    },
  }
}