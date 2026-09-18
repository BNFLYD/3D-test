// HOD Models 3D - layers.js
// El stack de 5 capas: geometría, texturas, glow, handles y visibilidad por etapa

import * as THREE from 'three'
import gsap from 'gsap'

export const LAYERS_DATA = [
    {
        id: 'exp',
        step: 1,
        number: '01',
        name: 'EXPERIENCE',
        subtitle: 'Web · Mobile · API · WhatsApp',
        desc: 'Punto de contacto e interacción multicanal con usuarios y clientes finales.',
        relation: 'Interactúa directamente con la capa de Aplicación a través de contratos de API seguros.',
        colorHex: 0x00f3ff,
        accentColor: '#00f3ff',
        bgGradient: ['#003852', '#00f3ff'],
        icon: 'fa-mobile-screen-button',
        subComponents: ['Web App (React/Next.js)', 'Mobile Native (iOS/Android)', 'REST & GraphQL APIs', 'WhatsApp Business Bot'],
        yBase: 5.2
    },
    {
        id: 'app',
        step: 2,
        number: '02',
        name: 'APPLICATION',
        subtitle: 'Services · Workflows · Integrations',
        desc: 'Orquestación de procesos de negocio, comunicación asíncrona y microservicios.',
        relation: 'Ejecuta operaciones consultando las Reglas de Dominio y disparando eventos.',
        colorHex: 0x00d2ff,
        accentColor: '#00d2ff',
        bgGradient: ['#002244', '#0099ff'],
        icon: 'fa-gears',
        subComponents: ['Microservices Mesh', 'Workflow Orchestration', 'Event Bus / Webhooks', 'Third-party Integrations'],
        yBase: 2.6
    },
    {
        id: 'dom',
        step: 3,
        number: '03',
        name: 'DOMAIN',
        subtitle: 'Business Rules · Entities · Processes',
        desc: 'Núcleo de inteligencia operativa. Contiene el modelo de dominio agnóstico a la tecnología.',
        relation: 'Utiliza las abstracciones de persistencia de la capa de Datos para guardar estado.',
        colorHex: 0x10b981,
        accentColor: '#10b981',
        bgGradient: ['#023824', '#10b981'],
        icon: 'fa-diagram-project',
        subComponents: ['Core Entities', 'Domain Logic & Invariants', 'Business State Machines', 'Domain Events'],
        yBase: 0.0
    },
    {
        id: 'dat',
        step: 4,
        number: '04',
        name: 'DATA',
        subtitle: 'Database · Search · Storage · Cache',
        desc: 'Persistencia distribuida, almacenamiento relacional, búsquedas indexadas y caché rápido.',
        relation: 'Reside sobre la Infraestructura física o virtualizada para garantizar alta disponibilidad.',
        colorHex: 0x8b5cf6,
        accentColor: '#8b5cf6',
        bgGradient: ['#280f54', '#8b5cf6'],
        icon: 'fa-database',
        subComponents: ['PostgreSQL / Distributed DB', 'ElasticSearch / Vector DB', 'Object Storage (S3)', 'Redis Memory Cache'],
        yBase: -2.6
    },
    {
        id: 'inf',
        step: 5,
        number: '05',
        name: 'INFRASTRUCTURE',
        subtitle: 'Cloud · On-Prem · Hybrid · Edge',
        desc: 'Capa base que soporta la nube híbrida, cómputo distribuido y redes de baja latencia.',
        relation: 'Capa fundamental sobre la cual se despliegan todos los recursos de datos y cómputo.',
        colorHex: 0x0066ff,
        accentColor: '#0066ff',
        bgGradient: ['#001133', '#0066ff'],
        icon: 'fa-cloud',
        subComponents: ['AWS / GCP Multi-cloud', 'On-Premise Private Cluster', 'Edge Computing Nodes', 'Kubernetes Containers'],
        yBase: -5.2
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
        ctx.arc(-60, 20, 70, Math.PI * 0.8, Math.PI * 1.85)
        ctx.arc(40, -50, 90, Math.PI * 1.1, Math.PI * 1.9)
        ctx.arc(120, 30, 60, Math.PI * 1.5, Math.PI * 0.4)
        ctx.lineTo(-120, 90)
        ctx.arc(-120, 30, 60, Math.PI * 0.5, Math.PI * 1.2)
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

function createSideGrillTexture(accentHex) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#0a0d14'
    ctx.fillRect(0, 0, 512, 256)

    ctx.fillStyle = '#161d2a'
    const numVents = 24
    const ventWidth = 12
    const gap = 8
    const startX = 30

    for (let i = 0; i < numVents; i++) {
        const x = startX + i * (ventWidth + gap)
        ctx.fillRect(x, 30, ventWidth, 196)

        ctx.fillStyle = accentHex
        ctx.fillRect(x + 3, 30, 2, 196)
        ctx.fillStyle = '#161d2a'
    }

    ctx.fillStyle = '#334155'
    ctx.beginPath()
    ctx.arc(15, 15, 6, 0, Math.PI * 2)
    ctx.arc(497, 15, 6, 0, Math.PI * 2)
    ctx.arc(15, 241, 6, 0, Math.PI * 2)
    ctx.arc(497, 241, 6, 0, Math.PI * 2)
    ctx.fill()

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
        const sideGrillTexture = createSideGrillTexture(layerData.accentColor)

        const materials = [
            new THREE.MeshStandardMaterial({
                color: 0x111622,
                metalness: 0.8,
                roughness: 0.2,
                map: sideGrillTexture
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
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.9, roughness: 0.1 })

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
        gRad.addColorStop(0, layerData.accentColor)
        gRad.addColorStop(0.5, layerData.accentColor + '55')
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
