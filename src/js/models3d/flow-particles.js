// HOD Models 3D - flow-particles.js
// Partículas ambientales flotando por la escena (estilo prototipo: rotación lenta)

import * as THREE from 'three'

export function createFlowParticles(scene) {
    const flowParticlesGroup = new THREE.Group()
    const particleCount = 200
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const pMat = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5
    })

    const particles = new THREE.Points(geo, pMat)
    flowParticlesGroup.add(particles)
    scene.add(flowParticlesGroup)

    return flowParticlesGroup
}

export function animateFlowParticles(flowParticlesGroup) {
    flowParticlesGroup.rotation.y += 0.0005
}
