// HOD Models 3D - layers.js
// El stack de 5 capas: geometría, texturas, glow, handles y visibilidad por etapa
// Narrativa bottom-up: se construye desde Infrastructure (abajo) hacia Experience (arriba)

import * as THREE from 'three'
import gsap from 'gsap'

export const LAYERS_DATA = [
    {
        id: 'inf',
        step: 1,
        number: '01',
        name: 'INFRASTRUCTURE',
        subtitle: 'Cloud · On-Prem · Hybrid · Edge',
        desc: 'Capa base que soporta la nube híbrida, cómputo distribuido y redes de baja latencia.',
        relation: 'Capa fundamental sobre la cual se despliegan todos los recursos de datos y cómputo.',
        colorHex: 0xc5bfae,
        accentColor: '#c5bfae',
        bgGradient: ['#001133', '#0066ff'],
        icon: 'fa-cloud',
        subComponents: ['AWS / GCP Multi-cloud', 'On-Premise Private Cluster', 'Edge Computing Nodes', 'Kubernetes Containers'],
        yBase: -5.2
    },
    {
        id: 'dat',
        step: 2,
        number: '02',
        name: 'DATA',
        subtitle: 'Database · Search · Storage · Cache',
        desc: 'Persistencia distribuida, almacenamiento relacional, búsquedas indexadas y caché rápido.',
        relation: 'Reside sobre la Infraestructura física o virtualizada para garantizar alta disponibilidad.',
        colorHex: 0xc5bfae,
        accentColor: '#c5bfae',
        bgGradient: ['#280f54', '#8b5cf6'],
        icon: 'fa-database',
        subComponents: ['PostgreSQL / Distributed DB', 'ElasticSearch / Vector DB', 'Object Storage (S3)', 'Redis Memory Cache'],
        yBase: -2.6
    },
    {
        id: 'dom',
        step: 3,
        number: '03',
        name: 'DOMAIN',
        subtitle: 'Business Rules · Entities · Processes',
        desc: 'Núcleo de inteligencia operativa. Contiene el modelo de dominio agnóstico a la tecnología.',
        relation: 'Utiliza las abstracciones de persistencia de la capa de Datos para guardar estado.',
        colorHex: 0xc5bfae,
        accentColor: '#c5bfae',
        bgGradient: ['#023824', '#10b981'],
        icon: 'fa-diagram-project',
        subComponents: ['Core Entities', 'Domain Logic & Invariants', 'Business State Machines', 'Domain Events'],
        yBase: 0.0
    },
    {
        id: 'app',
        step: 4,
        number: '04',
        name: 'APPLICATION',
        subtitle: 'Services · Workflows · Integrations',
        desc: 'Orquestación de procesos de negocio, comunicación asíncrona y microservicios.',
        relation: 'Ejecuta operaciones consultando las Reglas de Dominio y disparando eventos.',
        colorHex: 0xc5bfae,
        accentColor: '#c5bfae',
        bgGradient: ['#002244', '#0099ff'],
        icon: 'fa-gears',
        subComponents: ['Microservices Mesh', 'Workflow Orchestration', 'Event Bus / Webhooks', 'Third-party Integrations'],
        yBase: 2.6
    },
    {
        id: 'exp',
        step: 5,
        number: '05',
        name: 'EXPERIENCE',
        subtitle: 'Web · Mobile · API · WhatsApp',
        desc: 'Punto de contacto e interacción multicanal con usuarios y clientes finales.',
        relation: 'Interactúa directamente con la capa de Aplicación a través de contratos de API seguros.',
        colorHex: 0xc5bfae,
        accentColor: '#c5bfae',
        bgGradient: ['#003852', '#00f3ff'],
        icon: 'fa-mobile-screen-button',
        subComponents: ['Web App (React/Next.js)', 'Mobile Native (iOS/Android)', 'REST & GraphQL APIs', 'WhatsApp Business Bot'],
        yBase: 5.2
    }
]

function createLayerTopTexture(layer) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    const grad = ctx.createLinearGradient(0, 0, 1024, 1024)
    grad.addColorStop(0, layer.bgGradient[0])
    grad.addColorStop(1, layer.bgGradient[1])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1024, 1024)

    ctx.strokeStyle = layer.accentColor
    ctx.lineWidth = 16
    ctx.strokeRect(20, 20, 984, 984)

    ctx.fillStyle = '#ffffff'
    const cornerSize = 40
    ctx.fillRect(20, 20, cornerSize, cornerSize)
    ctx.fillRect(1024 - 20 - cornerSize, 20, cornerSize, cornerSize)
    ctx.fillRect(20, 1024 - 20 - cornerSize, cornerSize, cornerSize)
    ctx.fillRect(1024 - 20 - cornerSize, 1024 - 20 - cornerSize, cornerSize, cornerSize)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fillRect(60, 60, 180, 80)
    ctx.font = 'bold 48px "JetBrains Mono", sans-serif'
    ctx.fillStyle = layer.accentColor
    ctx.fillText(layer.number, 80, 118)

    ctx.save()
    ctx.translate(512, 512)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 24
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (layer.id === 'inf') {
        ctx.beginPath()
        ctx.moveTo(-110, 45)
        ctx.lineTo(110, 45)
        ctx.bezierCurveTo(155, 45, 175, 10, 160, -25)
        ctx.bezierCurveTo(175, -75, 130, -110, 85, -100)
        ctx.bezierCurveTo(65, -135, 15, -135, -10, -110)
        ctx.bezierCurveTo(-50, -130, -100, -90, -90, -45)
        ctx.bezierCurveTo(-140, -40, -155, 15, -110, 45)
        ctx.closePath()
        ctx.stroke()
    } else if (layer.id === 'dat') {
        for (let y of [-100, 0, 100]) {
            ctx.beginPath()
            ctx.ellipse(0, y, 140, 50, 0, 0, Math.PI * 2)
            ctx.stroke()
        }
        ctx.beginPath()
        ctx.moveTo(-140, -100); ctx.lineTo(-140, 100)
        ctx.moveTo(140, -100); ctx.lineTo(140, 100)
        ctx.stroke()
    } else if (layer.id === 'dom') {
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = 150 * Math.cos(angle)
            const y = 150 * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, 40, 0, Math.PI * 2)
        ctx.fillStyle = layer.accentColor
        ctx.fill()
    } else if (layer.id === 'app') {
        ctx.beginPath()
        ctx.rect(-120, -120, 240, 240)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, 60, 0, Math.PI * 2)
        ctx.stroke()
    } else if (layer.id === 'exp') {
        ctx.beginPath()
        ctx.rect(-140, -100, 280, 180)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(-60, 80); ctx.lineTo(60, 80)
        ctx.moveTo(0, 80); ctx.lineTo(0, 120)
        ctx.stroke()
    }
    ctx.restore()

    ctx.textAlign = 'center'
    ctx.font = 'bold 56px "Inter", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(layer.name, 512, 820)

    ctx.font = '500 32px "Inter", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText(layer.subtitle, 512, 880)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

function createSideLogoTexture(layer) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    // Fondo beige mate para el lateral del bloque
    ctx.fillStyle = '#c5bfae'
    ctx.fillRect(0, 0, 512, 256)

    ctx.save()
    ctx.translate(256, 128)
    ctx.scale(0.75, 0.75)

    // Gradiente metálico oscuro para el logo en relieve
    const metalGrad = ctx.createLinearGradient(-100, -100, 100, 100)
    metalGrad.addColorStop(0, '#273549')
    metalGrad.addColorStop(0.5, '#07111e')
    metalGrad.addColorStop(1, '#020617')
    ctx.fillStyle = metalGrad
    ctx.strokeStyle = '#020617'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (layer.id === 'inf') {
        ctx.beginPath()
        ctx.moveTo(-90, 35)
        ctx.lineTo(90, 35)
        ctx.bezierCurveTo(125, 35, 140, 10, 130, -15)
        ctx.bezierCurveTo(140, -55, 105, -85, 70, -75)
        ctx.bezierCurveTo(55, -105, 15, -105, -5, -85)
        ctx.bezierCurveTo(-35, -100, -75, -70, -70, -35)
        ctx.bezierCurveTo(-110, -30, -120, 10, -90, 35)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    } else if (layer.id === 'dat') {
        for (let y of [-60, 0, 60]) {
            ctx.beginPath()
            ctx.ellipse(0, y, 110, 35, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
        }
    } else if (layer.id === 'dom') {
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = 110 * Math.cos(angle)
            const y = 110 * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    } else if (layer.id === 'app') {
        ctx.beginPath()
        ctx.rect(-90, -90, 180, 180)
        ctx.fill()
        ctx.stroke()
    } else if (layer.id === 'exp') {
        ctx.beginPath()
        ctx.rect(-100, -70, 200, 130)
        ctx.fill()
        ctx.stroke()
    }

    ctx.restore()
    return new THREE.CanvasTexture(canvas)
}

export function createLayers(scene) {
    const layerMeshes = []

    const blockWidth = 7.5
    const blockHeight = 1.4
    const blockDepth = 7.5
    const radius = 0.4

    LAYERS_DATA.forEach((layerData, idx) => {
        const layerGroup = new THREE.Group()
        layerGroup.userData = { ...layerData, index: idx }

        const shape = new THREE.Shape()
        const w = blockWidth / 2
        const d = blockDepth / 2
        const r = radius

        shape.moveTo(-w + r, -d)
        shape.lineTo(w - r, -d)
        shape.quadraticCurveTo(w, -d, w, -d + r)
        shape.lineTo(w, d - r)
        shape.quadraticCurveTo(w, d, w - r, d)
        shape.lineTo(-w + r, d)
        shape.quadraticCurveTo(-w, d, -w, d - r)
        shape.lineTo(-w, -d + r)
        shape.quadraticCurveTo(-w, -d, -w + r, -d)

        const extrudeSettings = {
            steps: 1,
            depth: blockHeight,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3
        }

        const blockGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        blockGeo.rotateX(-Math.PI / 2)
        blockGeo.center()

        const topTexture = createLayerTopTexture(layerData)
        const sideLogoTexture = createSideLogoTexture(layerData)

        const materials = [
            new THREE.MeshStandardMaterial({
                color: 0xc5bfae,
                metalness: 0.05,
                roughness: 0.45,
                map: sideLogoTexture
            }),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.1,
                roughness: 0.3,
                map: topTexture
            })
        ]

        const blockMesh = new THREE.Mesh(blockGeo, materials)
        blockMesh.castShadow = true
        blockMesh.receiveShadow = true
        layerGroup.add(blockMesh)

        const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16)
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x07111e, metalness: 0.9, roughness: 0.1 })

        const leftHandle = new THREE.Mesh(handleGeo, handleMat)
        leftHandle.position.set(-w - 0.1, 0, 0)
        layerGroup.add(leftHandle)

        const rightHandle = new THREE.Mesh(handleGeo, handleMat)
        rightHandle.position.set(w + 0.1, 0, 0)
        layerGroup.add(rightHandle)

        const glowGeo = new THREE.PlaneGeometry(8.5, 8.5)
        const canvasGlow = document.createElement('canvas')
        canvasGlow.width = 256; canvasGlow.height = 256
        const gCtx = canvasGlow.getContext('2d')
        const gRad = gCtx.createRadialGradient(128, 128, 10, 128, 128, 128)
        gRad.addColorStop(0, '#08b8d8')
        gRad.addColorStop(0.5, '#08b8d855')
        gRad.addColorStop(1, 'transparent')
        gCtx.fillStyle = gRad
        gCtx.fillRect(0, 0, 256, 256)

        const glowTex = new THREE.CanvasTexture(canvasGlow)
        const glowMat = new THREE.MeshBasicMaterial({
            map: glowTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        const glowMesh = new THREE.Mesh(glowGeo, glowMat)
        glowMesh.rotation.x = -Math.PI / 2
        glowMesh.position.y = -blockHeight / 2 - 0.05
        layerGroup.add(glowMesh)

        layerGroup.position.set(0, layerData.yBase, 0)
        scene.add(layerGroup)
        layerMeshes.push(layerGroup)
    })

    return layerMeshes
}

export function updateLayersVisibility(layerMeshes, currentStep, explodeFactor) {
    layerMeshes.forEach((mesh, idx) => {
        const layerStep = idx + 1
        const isVisible = layerStep <= currentStep || currentStep >= 6

        let targetY = LAYERS_DATA[idx].yBase * (1 + explodeFactor)

        if (!isVisible) {
            targetY += 15
        }

        gsap.to(mesh.position, {
            y: targetY,
            duration: 0.8,
            ease: "power2.out"
        })

        mesh.visible = true
        mesh.children[0].material.forEach(mat => {
            mat.transparent = true
            gsap.to(mat, { opacity: isVisible ? 1 : 0.1, duration: 0.5 })
        })
    })
}
