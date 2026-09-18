// HOD Models 3D - floor-grid.js
// Plano base del escenario: grid de referencia + plano oscuro

import * as THREE from 'three'

export function createFloorGrid(scene) {
    const gridHelper = new THREE.GridHelper(30, 30, 0x00f3ff, 0x1e293b)
    gridHelper.position.y = -8
    scene.add(gridHelper)

    const planeGeo = new THREE.PlaneGeometry(30, 30)
    const planeMat = new THREE.MeshBasicMaterial({
        color: 0x05070c,
        side: THREE.DoubleSide
    })
    const floor = new THREE.Mesh(planeGeo, planeMat)
    floor.rotation.x = Math.PI / 2
    floor.position.y = -8.05
    scene.add(floor)
}
