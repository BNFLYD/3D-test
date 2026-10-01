// HOD Models 3D - ai-node.js
// Gemini Core: núcleo de IA autónomo — aura pulsante, cristal cuántico,
// chispa interna y dos anillos neuronales en órbita.

import * as THREE from 'three'

// Posición del nodo en la escena (al costado del stack de capas)
const AI_POSITION = { x: 8, y: 2.5, z: 2 }

export function createAINode(scene) {
    const aiNodeGroup = new THREE.Group()

    // Aura: campo de energía etéreo (wireframe pulsante)
    const auraGeo = new THREE.SphereGeometry(1.6, 32, 32)
    const auraMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    })
    const auraMesh = new THREE.Mesh(auraGeo, auraMat)
    aiNodeGroup.add(auraMesh) // children[0]

    // Cristal cuántico central
    const coreGeo = new THREE.IcosahedronGeometry(0.95, 0)
    const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
        transmission: 0.6,
        ior: 2.2,
        transparent: true,
        opacity: 0.95
    })
    const aiCore = new THREE.Mesh(coreGeo, coreMat)
    aiNodeGroup.add(aiCore) // children[1]

    // Chispa de inteligencia interna
    const sparkGeo = new THREE.SphereGeometry(0.35, 16, 16)
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat)
    aiNodeGroup.add(sparkMesh) // children[2]

    // Anillos neuronales en órbita
    const ringGeo1 = new THREE.TorusGeometry(1.8, 0.035, 16, 100)
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.8 })
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI / 3
    aiNodeGroup.add(ring1) // children[3]

    const ringGeo2 = new THREE.TorusGeometry(2.2, 0.03, 16, 100)
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.y = Math.PI / 4
    aiNodeGroup.add(ring2) // children[4]

    aiNodeGroup.position.set(AI_POSITION.x, AI_POSITION.y, AI_POSITION.z)

    // El nodo es decorativo: no intercepta el raycast (los clicks pasan a las capas)
    aiNodeGroup.traverse(child => { child.raycast = () => {} })

    scene.add(aiNodeGroup)
    return aiNodeGroup
}

export function animateAINode(aiNodeGroup) {
    const time = Date.now() * 0.002

    // Flotación sutil
    aiNodeGroup.position.y = AI_POSITION.y + Math.sin(time) * 0.25

    // Rotaciones propias
    aiNodeGroup.children[1].rotation.y += 0.012 // cristal
    aiNodeGroup.children[1].rotation.x += 0.008
    aiNodeGroup.children[3].rotation.z += 0.015 // anillo indigo
    aiNodeGroup.children[4].rotation.x -= 0.02 // anillo sky

    // Pulso del aura
    const pulse = 1 + Math.sin(time * 3) * 0.08
    aiNodeGroup.children[0].scale.set(pulse, pulse, pulse)
}
