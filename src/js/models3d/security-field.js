// HOD Models 3D - security-field.js
// Cúpula de seguridad: vidrio físico de alta resistencia envolviendo el stack,
// con rectángulos negros extendidos en los 4 laterales y patrón X en la tapa.

import * as THREE from 'three'

// Config de la cúpula — ajustar para retoque rápido
const SEC = {
    width: 9.2,
    depth: 9.2,
    height: 13.6,
    corner: 0.6,
    bevel: 0.15,
    bevelSegments: 4,
    faceOpacity: 0.85,
    topOpacity: 0.9
}

// Rectángulo negro vertical extendido de extremo a extremo
function createFacePatternTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 1024, 1024)

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 12
    ctx.strokeRect(60, 15, 904, 994)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
    texture.needsUpdate = true
    return texture
}

// X diagonal negra para la tapa
function createTopXTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 1024, 1024)

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(60, 60)
    ctx.lineTo(964, 964)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(964, 60)
    ctx.lineTo(60, 964)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

export function createSecurityField(scene) {
    const securityGroup = new THREE.Group()

    const w = SEC.width / 2
    const d = SEC.depth / 2
    const r = SEC.corner

    // Rectángulo redondeado (mismo lenguaje de forma que las capas)
    const shape = new THREE.Shape()
    shape.moveTo(-w + r, -d)
    shape.lineTo(w - r, -d)
    shape.quadraticCurveTo(w, -d, w, -d + r)
    shape.lineTo(w, d - r)
    shape.quadraticCurveTo(w, d, w - r, d)
    shape.lineTo(-w + r, d)
    shape.quadraticCurveTo(-w, d, -w, d - r)
    shape.lineTo(-w, -d + r)
    shape.quadraticCurveTo(-w, -d, -w + r, -d)

    const boxGeo = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        depth: SEC.height,
        bevelEnabled: true,
        bevelThickness: SEC.bevel,
        bevelSize: SEC.bevel,
        bevelSegments: SEC.bevelSegments
    })
    boxGeo.rotateX(-Math.PI / 2)
    boxGeo.center()

    // Vidrio físico de alta resistencia
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0.05,
        transmission: 0.95,
        ior: 1.5,
        thickness: 1.2,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthWrite: false
    })

    const glassMesh = new THREE.Mesh(boxGeo, glassMat)
    glassMesh.renderOrder = 9
    securityGroup.add(glassMesh)

    // Paneles laterales con el rectángulo negro (frente, derecha, atrás, izquierda)
    const faceTex = createFacePatternTexture()
    const facePlaneGeo = new THREE.PlaneGeometry(8.6, 13.4)
    const faceOffset = SEC.depth / 2 + 0.03

    const faceMat = new THREE.MeshBasicMaterial({
        map: faceTex,
        transparent: true,
        opacity: SEC.faceOpacity,
        depthWrite: false,
        side: THREE.DoubleSide
    })

    const frontFace = new THREE.Mesh(facePlaneGeo, faceMat)
    frontFace.position.set(0, 0, faceOffset)
    securityGroup.add(frontFace)

    const rightFace = new THREE.Mesh(facePlaneGeo, faceMat)
    rightFace.position.set(faceOffset, 0, 0)
    rightFace.rotation.y = Math.PI / 2
    securityGroup.add(rightFace)

    const backFace = new THREE.Mesh(facePlaneGeo, faceMat)
    backFace.position.set(0, 0, -faceOffset)
    backFace.rotation.y = Math.PI
    securityGroup.add(backFace)

    const leftFace = new THREE.Mesh(facePlaneGeo, faceMat)
    leftFace.position.set(-faceOffset, 0, 0)
    leftFace.rotation.y = -Math.PI / 2
    securityGroup.add(leftFace)

    // Tapa con la X diagonal
    const topXTex = createTopXTexture()
    const topPlaneGeo = new THREE.PlaneGeometry(8.6, 8.6)
    const topPlaneMesh = new THREE.Mesh(topPlaneGeo, new THREE.MeshBasicMaterial({
        map: topXTex,
        transparent: true,
        opacity: SEC.topOpacity,
        depthWrite: false,
        side: THREE.DoubleSide
    }))
    topPlaneMesh.rotation.x = -Math.PI / 2
    topPlaneMesh.position.set(0, SEC.height / 2 + 0.04, 0)
    securityGroup.add(topPlaneMesh)

    // La cúpula es decorativa: no intercepta el raycast (los clicks pasan a las capas)
    securityGroup.traverse(child => { child.raycast = () => {} })

    scene.add(securityGroup)
    return securityGroup
}
