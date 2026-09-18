// HOD Models 3D - ai-node.js
// Nodo central de IA: icosaedro pulsing + anillo torus + 3 tubos conectores

import * as THREE from 'three'

export function createAINode(scene) {
    const aiNodeGroup = new THREE.Group()

    const coreGeo = new THREE.IcosahedronGeometry(0.9, 2)
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xec4899,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        wireframe: true
    })
    const aiCore = new THREE.Mesh(coreGeo, coreMat)
    aiNodeGroup.add(aiCore)

    const ringGeo = new THREE.TorusGeometry(1.5, 0.04, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 3
    aiNodeGroup.add(ring)

    aiNodeGroup.position.set(8, 2.5, 2)

    const targetYPositions = [5.2, 2.6, -2.6]
    const colors = [0x00f3ff, 0x00d2ff, 0x8b5cf6]

    targetYPositions.forEach((yPos, i) => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(8, 2.5, 2),
            new THREE.Vector3(5, (2.5 + yPos) / 2, 1),
            new THREE.Vector3(3.8, yPos, 0)
        ])

        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.05, 8, false)
        const tubeMat = new THREE.MeshBasicMaterial({
            color: colors[i],
            transparent: true,
            opacity: 0.8
        })
        const tube = new THREE.Mesh(tubeGeo, tubeMat)
        aiNodeGroup.add(tube)
    })

    const canvasAI = document.createElement('canvas')
    canvasAI.width = 512; canvasAI.height = 128
    const aCtx = canvasAI.getContext('2d')
    aCtx.fillStyle = '#ec4899'
    aCtx.font = 'bold 38px "JetBrains Mono", sans-serif'
    aCtx.textAlign = 'center'
    aCtx.fillText('AI MODULE', 256, 50)
    aCtx.fillStyle = '#ffffff'
    aCtx.font = '24px "Inter", sans-serif'
    aCtx.fillText('When It Makes Sense', 256, 90)

    const aiLabelTex = new THREE.CanvasTexture(canvasAI)
    const aiLabelMat = new THREE.MeshBasicMaterial({ map: aiLabelTex, transparent: true, side: THREE.DoubleSide })
    const aiLabelMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.88), aiLabelMat)
    aiLabelMesh.position.set(0, 1.8, 0)
    aiNodeGroup.add(aiLabelMesh)

    scene.add(aiNodeGroup)
    return aiNodeGroup
}

export function animateAINode(aiNodeGroup) {
    aiNodeGroup.position.y = 2.5 + Math.sin(Date.now() * 0.002) * 0.3
    aiNodeGroup.children[0].rotation.y += 0.01
    aiNodeGroup.children[1].rotation.z += 0.015
}
