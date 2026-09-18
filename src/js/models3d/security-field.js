// HOD Models 3D - security-field.js
// Paralelepípedo wireframe amber que envuelve transversalmente toda la pila

import * as THREE from 'three'

export function createSecurityField(scene) {
    const securityGroup = new THREE.Group()

    const boxGeo = new THREE.BoxGeometry(9.2, 13.5, 9.2)
    const wireGeo = new THREE.WireframeGeometry(boxGeo)
    const lineMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        linewidth: 2,
        transparent: true,
        opacity: 0.6
    })
    const wireframe = new THREE.LineSegments(wireGeo, lineMat)
    wireframe.position.y = 0
    securityGroup.add(wireframe)

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.08,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 1.2
    })
    const glassMesh = new THREE.Mesh(boxGeo, glassMat)
    glassMesh.position.y = 0
    securityGroup.add(glassMesh)

    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 13.5, 16)
    const pillarMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b })

    const corners = [
        [-4.6, -4.6], [4.6, -4.6], [-4.6, 4.6], [4.6, 4.6]
    ]

    corners.forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat)
        pillar.position.set(x, 0, z)
        securityGroup.add(pillar)
    })

    const canvasSec = document.createElement('canvas')
    canvasSec.width = 512; canvasSec.height = 128
    const sCtx = canvasSec.getContext('2d')
    sCtx.fillStyle = '#f59e0b'
    sCtx.font = 'bold 42px "JetBrains Mono", sans-serif'
    sCtx.textAlign = 'center'
    sCtx.fillText('SECURITY FIELD', 256, 75)
    sCtx.strokeStyle = '#f59e0b'
    sCtx.lineWidth = 6
    sCtx.strokeRect(10, 10, 492, 108)

    const labelTex = new THREE.CanvasTexture(canvasSec)
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide })
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), labelMat)
    labelMesh.position.set(0, 7.2, 4.7)
    securityGroup.add(labelMesh)

    scene.add(securityGroup)
    return securityGroup
}
