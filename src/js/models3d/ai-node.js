// HOD Models 3D - ai-node.js
// Gemini Core: núcleo de IA autónomo — aura pulsante, cristal cuántico,
// chispa interna, dos anillos neuronales en órbita y tubos conectores
// hacia las capas Data y Experience.

import * as THREE from 'three'
import { LAYERS_DATA } from './layers.js'

// Posición del nodo en la escena (al costado del stack de capas)
const AI_POSITION = { x: 8, y: 2.5, z: 2 }

// Config de los tubos conectores — ajustar para retoque rápido
const TUBES = {
    radius: 0.05,
    opacity: 0.8,
    dataColor: 0x38bdf8,
    experienceColor: 0x818cf8,
    endX: 3.8,   // penetración de la punta dentro del bloque (x mundo)
    endZ: 0.5    // desplazamiento z de la punta (mundo)
}

// Tubo conector en coordenadas LOCALES del grupo: del centro del core a la capa destino.
// (Los tubos viejos fallaban porque usaban coordenadas de mundo siendo hijos
// del grupo posicionado — quedaban duplicados en el offset. Esto lo corrige.)
function createConnectorTube(targetYWorld, color) {
    const end = new THREE.Vector3(
        TUBES.endX - AI_POSITION.x,
        targetYWorld - AI_POSITION.y,
        TUBES.endZ - AI_POSITION.z
    )
    const mid = new THREE.Vector3(end.x / 2, end.y / 2, end.z / 2)

    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0), // centro del core (local)
        mid,
        end
    ])

    const tubeGeo = new THREE.TubeGeometry(curve, 32, TUBES.radius, 8, false)
    const tubeMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: TUBES.opacity
    })
    return new THREE.Mesh(tubeGeo, tubeMat)
}

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

    // Tubos conectores: core -> capa Data y core -> capa Experience
    // (yBase dinámico desde LAYERS_DATA: si las capas se mueven, los tubos siguen)
    const yData = LAYERS_DATA.find(l => l.id === 'dat')?.yBase
    const yExperience = LAYERS_DATA.find(l => l.id === 'exp')?.yBase

    if (yData !== undefined) {
        aiNodeGroup.add(createConnectorTube(yData, TUBES.dataColor)) // children[5]
    }
    if (yExperience !== undefined) {
        aiNodeGroup.add(createConnectorTube(yExperience, TUBES.experienceColor)) // children[6]
    }

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
