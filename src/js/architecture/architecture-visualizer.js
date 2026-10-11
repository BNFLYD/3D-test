// HOD System Architecture — motor del gráfico 3D para el slot "2D" del demo
// Portado de la web canónica: hod-software/src/components/architecture/ThreeArchitectureVisualizer.jsx
//
// Adaptación a Alpine: en vez de progress por scroll, la línea de tiempo (0–9)
// la maneja 'app-step-changed' con easing exponencial — el mismo efecto de
// construcción progresiva que al scrollear en la web. El resize se ajusta solo
// cuando el contenedor swappea entre el slot principal y la miniatura.

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { loadHodGeometry } from './geometry/loadHodGeometry.js'
import { createArchitectureScene, disposeArchitectureScene } from './three/createArchitectureScene.js'
import { updateArchitectureScene } from './three/updateArchitectureScene.js'

// Vista frontal (la canónica de la web) para ambos slots
const VIEW_FRONT = new THREE.Vector3(0, 0, 15)

// Timeline objetivo por paso del demo (1–8), en unidades de la línea 0–9.
// Etapa + 0.5 → la capa del paso llega completa y la siguiente aún no arranca.
const STEP_TIMELINE = { 1: 1.5, 2: 2.5, 3: 3.5, 4: 4.5, 5: 5.5, 6: 6.5, 7: 7.5, 8: 9 }

// Frustum ortográfico: encuadre del grafo (igual que la web)
const SCENE_WIDTH = 10.7
const SCENE_HEIGHT = 10.1

export function initArchitectureVisualizer({ container, canvas }) {
  if (!container || !canvas) return null

  const state = {
    step: 1,
    timeline: STEP_TIMELINE[1],
    target: STEP_TIMELINE[1],
    reduced: false,
  }

  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const updateReduced = () => {
    state.reduced = media.matches
    if (controls) controls.enableDamping = !media.matches
  }
  media.addEventListener('change', updateReduced)
  state.reduced = media.matches

  let renderer = null
  let labelRenderer = null
  let scene = null
  let camera = null
  let controls = null
  let graph = null
  let resizeObserver = null
  let rafId = 0
  let transition = null
  let disposed = false

  const startLoop = () => {
    if (!rafId && renderer) rafId = requestAnimationFrame(render)
  }

  const stopLoop = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
  }

  const render = (now) => {
    rafId = 0
    if (disposed || !renderer || !scene || !camera || !graph) return

    // Easing exponencial de la línea de tiempo hacia el paso activo
    const k = state.reduced ? 1 : 0.07
    state.timeline += (state.target - state.timeline) * k
    if (Math.abs(state.target - state.timeline) < 0.002) state.timeline = state.target

    // Transición de cámara (reset de vista) — igual que la web: 520ms ease-out cúbico
    if (transition) {
      const elapsed = Math.min((now - transition.startedAt) / transition.duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      camera.position.lerpVectors(transition.from, transition.to, eased)
      camera.lookAt(0, 0, 0)
      if (elapsed >= 1) transition = null
    }

    updateArchitectureScene(graph, state.timeline / 9, now / 1000, state.reduced)
    controls?.update()
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
    rafId = requestAnimationFrame(render)
  }

  const resize = () => {
    if (!renderer || !labelRenderer || !camera) return
    const rect = container.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const mobile = window.matchMedia('(max-width: 767px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2))
    renderer.setSize(rect.width, rect.height, false)
    labelRenderer.setSize(rect.width, rect.height)

    const aspect = rect.width / rect.height
    const frustumHeight = Math.max(SCENE_HEIGHT, SCENE_WIDTH / aspect)
    camera.left = -(frustumHeight * aspect) / 2
    camera.right = (frustumHeight * aspect) / 2
    camera.top = frustumHeight / 2
    camera.bottom = -frustumHeight / 2
    camera.updateProjectionMatrix()
  }

  const moveCamera = (destination, animate = true) => {
    if (!camera || !controls) return
    controls.target.set(0, 0, 0)
    camera.up.set(0, 1, 0)
    if (state.reduced || !animate) {
      transition = null
      camera.position.copy(destination)
      camera.lookAt(0, 0, 0)
      controls.update()
    } else {
      transition = {
        from: camera.position.clone(),
        to: destination.clone(),
        startedAt: performance.now(),
        duration: 520,
      }
    }
    startLoop()
  }

  const applyStep = (step) => {
    state.step = step
    state.target = STEP_TIMELINE[step] ?? STEP_TIMELINE[1]
    startLoop()
  }

  const initialize = async () => {
    if (disposed || renderer) return
    try {
      const geometryData = await loadHodGeometry()
      if (disposed) {
        geometryData.geometries.forEach((geometry) => geometry.dispose())
        return
      }

      scene = new THREE.Scene()
      scene.background = new THREE.Color('#0a0d14')

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
      renderer.outputColorSpace = THREE.SRGBColorSpace

      labelRenderer = new CSS2DRenderer()
      Object.assign(labelRenderer.domElement.style, {
        position: 'absolute',
        inset: '0',
        pointerEvents: 'none',
        overflow: 'hidden',
      })
      container.appendChild(labelRenderer.domElement)

      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
      camera.position.copy(VIEW_FRONT)
      camera.lookAt(0, 0, 0)

      controls = new OrbitControls(camera, canvas)
      controls.enableDamping = !state.reduced
      controls.dampingFactor = 0.075
      controls.enableZoom = false   // la rueda del demo navega etapas, no hace zoom
      controls.enablePan = true
      controls.minZoom = 0.55
      controls.maxZoom = 2.35
      controls.target.set(0, 0, 0)
      canvas.style.touchAction = 'none'
      controls.update()

      graph = createArchitectureScene(geometryData)
      scene.add(graph.root)
      scene.add(new THREE.HemisphereLight('#b8f5ff', '#020405', 0.68))
      const keyLight = new THREE.DirectionalLight('#d8faff', 2)
      keyLight.position.set(5, 7, 10)
      scene.add(keyLight)

      // Guardia drag-vs-click: rotar el gráfico (OrbitControls) no debe
      // disparar el toggle de vistas del mini-viewport (@click de Alpine)
      canvas.addEventListener('pointerdown', onPointerDown)
      canvas.addEventListener('click', onClickGuard)

      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      window.addEventListener('resize', resize)
      resize()

      startLoop()
    } catch (error) {
      console.error('HOD architecture graph failed to initialize', error)
    }
  }

  // ---- Listeners del estado Alpine ----
  const onStepChanged = (e) => {
    applyStep(e.detail?.step ?? 1)
  }

  const onResetCamera = () => {
    if (!camera || !controls) return
    camera.zoom = 1
    camera.updateProjectionMatrix()
    moveCamera(VIEW_FRONT)
  }

  const onAutoSpin = (e) => {
    if (!controls) return
    controls.autoRotate = !!e.detail?.active
    controls.autoRotateSpeed = 2.0
    startLoop()
  }

  // ---- Guardia drag-vs-click ----
  let pointerDown = null
  const onPointerDown = (e) => {
    pointerDown = { x: e.clientX, y: e.clientY }
  }
  const onClickGuard = (e) => {
    if (!pointerDown) return
    const moved = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y)
    pointerDown = null
    if (moved > 6) e.stopPropagation() // fue un drag de OrbitControls, no un click
  }

  window.addEventListener('app-step-changed', onStepChanged)
  window.addEventListener('app-reset-camera', onResetCamera)
  window.addEventListener('app-autospin-toggle', onAutoSpin)

  initialize()

  // ---- API expuesta (paridad con el canvas 2D anterior) ----
  return {
    setStep(step) {
      applyStep(step)
    },
    destroy() {
      disposed = true
      stopLoop()
      resizeObserver?.disconnect()
      media.removeEventListener('change', updateReduced)
      window.removeEventListener('resize', resize)
      window.removeEventListener('app-step-changed', onStepChanged)
      window.removeEventListener('app-reset-camera', onResetCamera)
      window.removeEventListener('app-autospin-toggle', onAutoSpin)
      controls?.dispose()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('click', onClickGuard)
      if (graph) disposeArchitectureScene(graph)
      labelRenderer?.domElement.remove()
      renderer?.dispose()
      renderer?.forceContextLoss()
    },
  }
}
