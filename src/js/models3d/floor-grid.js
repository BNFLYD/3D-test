// HOD Models 3D - floor-grid.js
// Grid de referencia del escenario (estilo prototipo)

import * as THREE from 'three'

export function createFloorGrid(scene) {
    const gridHelper = new THREE.GridHelper(36, 36, 0x00f3ff, 0x1e293b)
    gridHelper.position.y = -9
    scene.add(gridHelper)
}
