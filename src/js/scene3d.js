// HOD System Architecture - Three.js Scene Orchestrator
// Coordina la escena 3D y delega en los modelos de models3d/

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

import {
    LAYERS_DATA,
    createLayers,
    updateLayersVisibility,
    createFloorGrid,
    createSecurityField,
    createAINode,
    animateAINode,
    createFlowParticles,
    animateFlowParticles
} from './models3d/index.js'

// Frames de cámara por defecto para cada slot (main = vista principal, mini = miniatura)
const FRAME3D_MAIN = {
    position: { x: 20, y: 20, z: 20 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1,
    autoRotate: false
}
const FRAME3D_MINI = {
    position: { x: 20, y: 20, z: 20 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1,
    autoRotate: true
}
const frame3DFor = (mode) => (mode === '3d' ? FRAME3D_MAIN : FRAME3D_MINI)

let currentFrame3D = FRAME3D_MAIN

// State del orquestador
let scene, camera, renderer, controls
let layerMeshes = []
let securityGroup, aiNodeGroup, flowParticlesGroup
let raycaster, mouse

let currentStep = 1
let explodeFactor = 0
let isAutoRotating = false
let showSecurity = true
let showAI = true
let showFlow = true

// ---- Init ----

export function initThree() {
    const container = document.getElementById('webgl-container')
    if (!container) return

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x07090e)
    scene.fog = new THREE.FogExp2(0x07090e, 0.025)

    const rect = container.getBoundingClientRect()
    const cw = rect.width || window.innerWidth
    const ch = rect.height || window.innerHeight
    const aspect = cw / ch
    const d = 11
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000)
    camera.position.set(20, 20, 20)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(cw, ch)
    renderer.domElement.classList.add('w-full', 'h-full')
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 + 0.1
    controls.minDistance = 5
    controls.maxDistance = 50

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight1.position.set(15, 30, 20)
    dirLight1.castShadow = true
    dirLight1.shadow.mapSize.width = 2048
    dirLight1.shadow.mapSize.height = 2048
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x00f3ff, 0.8)
    dirLight2.position.set(-20, 10, -15)
    scene.add(dirLight2)

    const bottomPointLight = new THREE.PointLight(0x0088ff, 1.5, 30)
    bottomPointLight.position.set(0, -8, 0)
    scene.add(bottomPointLight)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    // Delegar la creación de escena a los modelos (models3d/)
    createFloorGrid(scene)
    layerMeshes = createLayers(scene)
    securityGroup = createSecurityField(scene)
    aiNodeGroup = createAINode(scene)
    flowParticlesGroup = createFlowParticles(scene)

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('click', onCanvasClick)

    bindAppEvents()
    animate()
}

// ---- Orquestación de visibilidad (delega en models3d) ----

function updateLayerVisibility() {
    updateLayersVisibility(layerMeshes, currentStep, explodeFactor)

    if (securityGroup) {
        const secVisible = showSecurity && (currentStep >= 6)
        gsap.to(securityGroup.scale, {
            x: secVisible ? 1 : 0.001,
            y: secVisible ? 1 : 0.001,
            z: secVisible ? 1 : 0.001,
            duration: 0.6,
            ease: "back.out(1.7)"
        })
    }

    if (aiNodeGroup) {
        const aiVisible = showAI && (currentStep >= 7)
        gsap.to(aiNodeGroup.scale, {
            x: aiVisible ? 1 : 0.001,
            y: aiVisible ? 1 : 0.001,
            z: aiVisible ? 1 : 0.001,
            duration: 0.6,
            ease: "back.out(1.7)"
        })
    }
}

// ---- Frames de cámara ----

function applyFrame3D(f) {
    currentFrame3D = f
    gsap.to(camera.position, { x: f.position.x, y: f.position.y, z: f.position.z, duration: 0.8, ease: 'power2.inOut' })
    gsap.to(controls.target, { x: f.target.x, y: f.target.y, z: f.target.z, duration: 0.8, ease: 'power2.inOut' })
    gsap.to(camera, { zoom: f.zoom, duration: 0.8, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() })
    controls.autoRotate = f.autoRotate
    controls.autoRotateSpeed = 2.0
}

// ---- Eventos ----

function onWindowResize() {
    const container = document.getElementById('webgl-container')
    if (!container) return
    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const aspect = rect.width / rect.height
    const d = 11
    camera.left = -d * aspect
    camera.right = d * aspect
    camera.top = d
    camera.bottom = -d
    camera.updateProjectionMatrix()
    renderer.setSize(rect.width, rect.height)
}

function onCanvasClick(event) {
    if (event.target.closest('.pointer-events-auto')) return
    if (event.target !== renderer.domElement) return

    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
        let hitObject = intersects[0].object
        while (hitObject.parent && !hitObject.userData.step && hitObject.parent !== scene) {
            hitObject = hitObject.parent
        }

        if (hitObject.userData && hitObject.userData.step) {
            const layer = hitObject.userData
            window.dispatchEvent(new CustomEvent('3d-step-changed', { detail: { step: layer.step } }))

            gsap.to(hitObject.scale, { x: 1.08, z: 1.08, duration: 0.2, yoyo: true, repeat: 1 })
        }
    }
}

function bindAppEvents() {
    window.addEventListener('app-step-changed', (e) => {
        currentStep = e.detail.step
        updateLayerVisibility()
    })

    window.addEventListener('app-explode-changed', (e) => {
        explodeFactor = e.detail.factor
        updateLayerVisibility()
    })

    window.addEventListener('app-security-toggle', (e) => {
        showSecurity = e.detail.visible
        updateLayerVisibility()
    })

    window.addEventListener('app-ai-toggle', (e) => {
        showAI = e.detail.visible
        updateLayerVisibility()
    })

    window.addEventListener('app-flow-toggle', (e) => {
        showFlow = e.detail.visible
        if (flowParticlesGroup) flowParticlesGroup.visible = showFlow
    })

    window.addEventListener('app-autospin-toggle', (e) => {
        isAutoRotating = e.detail.active
        controls.autoRotate = isAutoRotating
        controls.autoRotateSpeed = 2.0
    })

    window.addEventListener('app-view-changed', (e) => {
        applyFrame3D(frame3DFor(e.detail?.mode ?? '3d'))
    })

    window.addEventListener('app-reset-camera', () => {
        applyFrame3D(currentFrame3D)
    })
}

// ---- Loop de animación (delega en los animators de cada modelo) ----

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    if (aiNodeGroup && showAI) {
        animateAINode(aiNodeGroup)
    }

    if (flowParticlesGroup && showFlow) {
        animateFlowParticles(flowParticlesGroup)
    }

    renderer.render(scene, camera)
}

window.initThree = initThree
