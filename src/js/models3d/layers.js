// HOD Models 3D - layers.js
// Stack de 5 capas — estilo prototipo: cuerpo beige mate, tapa turquoise con
// cyber grid, badges de logo metálico en relieve en las 4 caras laterales.
// Narrativa bottom-up: se construye desde Infrastructure (abajo) hacia Experience (arriba)

import * as THREE from 'three'
import gsap from 'gsap'

export const LAYERS_DATA = [
    {
        id: 'inf',
        step: 1,
        number: '01',
        name: 'INFRASTRUCTURE',
        shortName: 'INFRASTRUCTURE',
        subtitle: 'Cloud, Contenedores & CI/CD',
        colorHex: 0x08b8d8,
        accentColor: '#08b8d8',
        sideLogoColor: '#c5bfae',
        yBase: -5.6,
        description: 'Aprovisionamiento de servidores, clústeres de orquestación, seguridad perimetral y pipelines automatizados.',
        techs: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Cloudflare', 'GitHub Actions'],
        metric1: '99.999%',
        metric2: 'Multi-Region'
    },
    {
        id: 'dat',
        step: 2,
        number: '02',
        name: 'DATA',
        shortName: 'DATA',
        subtitle: 'Persistencia, Búsqueda & Caché',
        colorHex: 0x08b8d8,
        accentColor: '#08b8d8',
        sideLogoColor: '#c5bfae',
        yBase: -2.8,
        description: 'Almacenamiento relacional y NoSQL, indexación de datos de alto rendimiento y capas de caché en memoria.',
        techs: ['PostgreSQL', 'Redis', 'Elasticsearch', 'MongoDB', 'DynamoDB', 'S3'],
        metric1: '4 ms',
        metric2: '99.999%'
    },
    {
        id: 'dom',
        step: 3,
        number: '03',
        name: 'DOMAIN',
        shortName: 'DOMAIN',
        subtitle: 'Reglas de Negocio & Lógica DDD',
        colorHex: 0x08b8d8,
        accentColor: '#08b8d8',
        sideLogoColor: '#c5bfae',
        yBase: 0.0,
        description: 'Núcleo puro de las reglas del negocio, entidades independientes de infraestructura y algoritmos centrales.',
        techs: ['Domain Driven Design', 'Event Sourcing', 'Clean Architecture', 'Core Engines'],
        metric1: '8 ms',
        metric2: '100%'
    },
    {
        id: 'app',
        step: 4,
        number: '04',
        name: 'APPLICATION',
        shortName: 'APPLICATION',
        subtitle: 'Flujos, Integraciones & Servicios',
        colorHex: 0x08b8d8,
        accentColor: '#08b8d8',
        sideLogoColor: '#c5bfae',
        yBase: 2.8,
        description: 'Orquestación de procesos de negocio, coordinación de microservicios, APIs RESTful y gestión de eventos.',
        techs: ['Node.js', 'Go', 'NestJS', 'Kafka', 'RabbitMQ', 'REST APIs'],
        metric1: '35 ms',
        metric2: '99.95%'
    },
    {
        id: 'exp',
        step: 5,
        number: '05',
        name: 'EXPERIENCE',
        shortName: 'EXPERIENCE',
        subtitle: 'Canales, UI/UX & API Gateway',
        colorHex: 0x08b8d8,
        accentColor: '#08b8d8',
        sideLogoColor: '#c5bfae',
        yBase: 5.6,
        description: 'Gestión de la interfaz del usuario final, optimización de renderizado, aplicaciones web/móviles y gateway de entrada.',
        techs: ['React', 'Next.js', 'React Native', 'Tailwind CSS', 'GraphQL', 'CDN Edge'],
        metric1: '14 ms',
        metric2: '99.99%'
    }
]

function createLayerTopTexture(layer) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    // Base turquoise sólida
    ctx.fillStyle = '#08b8d8'
    ctx.fillRect(0, 0, 1024, 1024)

    // Borde de contraste
    ctx.strokeStyle = '#02242e'
    ctx.lineWidth = 28
    ctx.strokeRect(28, 28, 968, 968)

    // Cyber grid overlay
    ctx.strokeStyle = 'rgba(2, 36, 46, 0.22)'
    ctx.lineWidth = 4
    for (let i = 80; i < 1024; i += 80) {
        ctx.beginPath()
        ctx.moveTo(i, 0); ctx.lineTo(i, 1024)
        ctx.moveTo(0, i); ctx.lineTo(1024, i)
        ctx.stroke()
    }

    // Badge círculo con número
    ctx.fillStyle = '#02242e'
    ctx.beginPath()
    ctx.arc(140, 140, 60, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 50px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(layer.number, 140, 140)

    // Nombre de la capa
    ctx.fillStyle = '#02242e'
    ctx.font = '900 68px sans-serif'
    ctx.fillText(layer.shortName || layer.name, 512, 780)

    // Subtítulo
    ctx.font = 'bold 36px sans-serif'
    ctx.fillStyle = '#05475a'
    ctx.fillText(layer.subtitle, 512, 850)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

function createSideLogoTexture(layer) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 320
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, 1024, 320)

    // Gradiente metálico oscuro (steel graphite) para el logo
    const logoGradient = ctx.createLinearGradient(400, 40, 624, 280)
    logoGradient.addColorStop(0, '#273549')
    logoGradient.addColorStop(0.3, '#0f172a')
    logoGradient.addColorStop(0.7, '#020617')
    logoGradient.addColorStop(1, '#1e293b')

    ctx.save()
    ctx.translate(512, 160)

    ctx.strokeStyle = logoGradient
    ctx.fillStyle = logoGradient
    ctx.lineWidth = 18
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Drop shadow para efecto relieve metálico
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 5

    if (layer.id === 'exp') {
        // Experience: monitor de escritorio + dispositivo móvil
        ctx.strokeRect(-120, -70, 140, 95)
        ctx.beginPath()
        ctx.moveTo(-50, 25); ctx.lineTo(-50, 60)
        ctx.moveTo(-85, 60); ctx.lineTo(-15, 60)
        ctx.stroke()

        ctx.fillRect(35, -45, 65, 110)
        ctx.strokeRect(35, -45, 65, 110)
        ctx.beginPath()
        ctx.arc(67, 50, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#64748b'
        ctx.fill()
    } else if (layer.id === 'app') {
        // Application: nodos de microservicios interconectados
        ctx.beginPath()
        ctx.arc(-55, -20, 52, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(-55, -20, 20, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(55, 20, 40, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(55, 20, 15, 0, Math.PI * 2)
        ctx.fill()
    } else if (layer.id === 'dom') {
        // Domain: modelo core hexagonal
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = 75 * Math.cos(angle)
            const y = 75 * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(0, 0, 24, 0, Math.PI * 2)
        ctx.fill()
    } else if (layer.id === 'dat') {
        // Data: cilindros de BD multi-tier
        for (let y of [-50, 0, 50]) {
            ctx.beginPath()
            ctx.ellipse(0, y, 95, 26, 0, 0, Math.PI * 2)
            ctx.stroke()
        }
        ctx.beginPath()
        ctx.moveTo(-95, -50); ctx.lineTo(-95, 50)
        ctx.moveTo(95, -50); ctx.lineTo(95, 50)
        ctx.stroke()
    } else if (layer.id === 'inf') {
        // Infrastructure: cloud computing — silueta alta y equilibrada
        ctx.beginPath()
        ctx.moveTo(-90, 45)
        ctx.lineTo(90, 45)
        ctx.bezierCurveTo(125, 45, 120, -20, 60, -20)
        ctx.bezierCurveTo(50, -85, -20, -85, -35, -25)
        ctx.bezierCurveTo(-90, -25, -125, 45, -90, 45)
        ctx.closePath()
        ctx.stroke()
    }

    ctx.restore()

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

export function createLayers(scene) {
    const layerMeshes = []

    const blockWidth = 8, blockHeight = 1.3, blockDepth = 8
    const bevelSize = 0.1, bevelThickness = 0.1

    LAYERS_DATA.forEach((layerData, idx) => {
        const layerGroup = new THREE.Group()
        layerGroup.userData = { ...layerData, index: idx }

        // Rectángulo redondeado
        const shape = new THREE.Shape()
        const w = blockWidth / 2, d = blockDepth / 2, r = 0.5

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
            bevelThickness: bevelThickness,
            bevelSize: bevelSize,
            bevelSegments: 4
        }

        const blockGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        blockGeo.rotateX(-Math.PI / 2)
        blockGeo.center()

        // Cuerpo: beige mate / tapa: turquoise base
        const sideMat = new THREE.MeshStandardMaterial({
            color: 0xc5bfae,
            metalness: 0.05,
            roughness: 0.5
        })

        const topBaseMat = new THREE.MeshStandardMaterial({
            color: 0x08b8d8,
            metalness: 0.1,
            roughness: 0.3
        })

        const blockMesh = new THREE.Mesh(blockGeo, [topBaseMat, sideMat])
        blockMesh.castShadow = true
        blockMesh.receiveShadow = true
        layerGroup.add(blockMesh)

        // Overlay de la cara superior (textura nítida por encima del bloque)
        const topTexture = createLayerTopTexture(layerData)
        const topPlaneGeo = new THREE.PlaneGeometry(blockWidth - 0.2, blockDepth - 0.2)
        const topPlaneMat = new THREE.MeshStandardMaterial({
            map: topTexture,
            transparent: true,
            roughness: 0.3,
            metalness: 0.1
        })
        const topPlaneMesh = new THREE.Mesh(topPlaneGeo, topPlaneMat)
        topPlaneMesh.rotation.x = -Math.PI / 2
        topPlaneMesh.position.y = blockHeight / 2 + bevelThickness + 0.005
        layerGroup.add(topPlaneMesh)

        // Badges de logo laterales (frente, derecha, atrás, izquierda)
        const sideLogoTex = createSideLogoTexture(layerData)
        const logoBadgeGeo = new THREE.PlaneGeometry(5.2, 1.15)
        const logoBadgeMat = new THREE.MeshBasicMaterial({
            map: sideLogoTex,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        })

        const faceOffset = blockDepth / 2 + bevelSize + 0.02

        const frontLogo = new THREE.Mesh(logoBadgeGeo, logoBadgeMat)
        frontLogo.position.set(0, 0, faceOffset)
        layerGroup.add(frontLogo)

        const rightLogo = new THREE.Mesh(logoBadgeGeo, logoBadgeMat)
        rightLogo.position.set(faceOffset, 0, 0)
        rightLogo.rotation.y = Math.PI / 2
        layerGroup.add(rightLogo)

        const backLogo = new THREE.Mesh(logoBadgeGeo, logoBadgeMat)
        backLogo.position.set(0, 0, -faceOffset)
        backLogo.rotation.y = Math.PI
        layerGroup.add(backLogo)

        const leftLogo = new THREE.Mesh(logoBadgeGeo, logoBadgeMat)
        leftLogo.position.set(-faceOffset, 0, 0)
        leftLogo.rotation.y = -Math.PI / 2
        layerGroup.add(leftLogo)

        layerGroup.position.set(0, layerData.yBase, 0)
        scene.add(layerGroup)
        layerMeshes.push(layerGroup)
    })

    return layerMeshes
}

function forEachMaterial(object3D, fn) {
    const seen = new Set()
    object3D.traverse(child => {
        if (!child.material) return
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach(mat => {
            if (!seen.has(mat)) {
                seen.add(mat)
                fn(mat)
            }
        })
    })
}

export function updateLayersVisibility(layerMeshes, currentStep, explodeFactor) {
    layerMeshes.forEach((mesh, idx) => {
        const layerStep = idx + 1
        const isVisible = layerStep <= currentStep || currentStep >= 6
        mesh.userData.shown = isVisible

        const targetY = LAYERS_DATA[idx].yBase * (1 + explodeFactor)

        if (isVisible) {
            if (!mesh.visible) {
                // Efecto "drop": aparece desde arriba y se acopla
                mesh.visible = true
                mesh.position.y = targetY + 4
            }
            gsap.to(mesh.position, { y: targetY, duration: 0.6, ease: 'back.out(1.2)', overwrite: 'auto' })

            forEachMaterial(mesh, mat => {
                mat.transparent = true
                gsap.to(mat, { opacity: 1, duration: 0.4, overwrite: 'auto' })
            })
        } else {
            gsap.to(mesh.position, { y: targetY + 5, duration: 0.4, ease: 'power2.in', overwrite: 'auto' })

            forEachMaterial(mesh, mat => {
                mat.transparent = true
                gsap.to(mat, {
                    opacity: 0,
                    duration: 0.3,
                    overwrite: 'auto',
                    onComplete: () => { if (!mesh.userData.shown) mesh.visible = false }
                })
            })
        }
    })
}
