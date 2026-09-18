// HOD Models 3D - flow-particles.js
// Partículas de dataflow que fluyen verticalmente en el escenario

import * as THREE from 'three'

export function createFlowParticles(scene) {
    const flowParticlesGroup = new THREE.Group()
    const particleCount = 60
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 6
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6
        speeds[i] = 0.03 + Math.random() * 0.05
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const pMat = new THREE.PointsMaterial({
        color: 0x00f3ff,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geo, pMat)
    particles.userData = { speeds }
    flowParticlesGroup.add(particles)
    scene.add(flowParticlesGroup)

    return flowParticlesGroup
}

export function animateFlowParticles(flowParticlesGroup) {
    const particles = flowParticlesGroup.children[0]
    const positions = particles.geometry.attributes.position.array
    const speeds = particles.userData.speeds

    for (let i = 0; i < speeds.length; i++) {
        positions[i * 3 + 1] += speeds[i]
        if (positions[i * 3 + 1] > 7) {
            positions[i * 3 + 1] = -7
        }
    }
    particles.geometry.attributes.position.needsUpdate = true
}
