// HOD Models 3D - ai-node.js
// Gemini Core: núcleo de IA autónomo — aura pulsante, cristal cuántico,
// chispa interna, dos anillos neuronales en órbita, tubos conectores hacia
// las capas Data y Experience (entrando por el costado, del lado del nodo,
// fuera de la placa del logo) y plugs negros que disimulan la conexión.
// Tubos y plugs quedan anclados a las capas (posición fija en mundo) y se
// estiran/reposicionan siguiendo la flotación del core.

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
    endZ: 3.0,   // entrada sobre la cara lateral, del lado del nodo IA
                 // (fuera de la placa del logo, que ocupa z ∈ [-2.6, 2.6])
    bulge: 1.0,  // curvatura: apertura hacia afuera antes de doblar hacia la capa
    dip: 0.9,    // curvatura: swoosh direccional (sign según sentido del viaje)
    tubularSegments: 32,
    radialSegments: 8
}

// Config de los plugs (puertos de conexión negros en cada capa)
const PLUG = {
    radius: 0.075, // ≈ 1.5× el diámetro del tubo que recubren
    length: 0.4,
    protrude: 0.25, // cuánto sobresale de la cara
    faceX: 4.1,     // cara lateral del bloque (±4 + bevel 0.1)
    color: 0x000000
}

// Geometría del tubo en coords LOCALES del grupo.
// El extremo de la capa se calcula relativo a groupY (posición flotante del
// grupo) para que quede FIJO en mundo; el extremo del core (0,0,0) sigue al
// cristal y la curva absorbe el movimiento estirándose.
function buildTubeGeometry(targetYWorld, groupY) {
    const end = new THREE.Vector3(
        TUBES.endX - AI_POSITION.x,
        targetYWorld - groupY,
        TUBES.endZ - AI_POSITION.z
    )
    // Swoosh direccional: el signo depende del sentido del viaje,
    // así Data y Experience quedan como espejos inversos
    const mid = new THREE.Vector3(
        end.x / 2 + TUBES.bulge,
        end.y / 2 + Math.sign(end.y) * TUBES.dip,
        end.z / 2
    )

    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0), // centro del core (local)
        mid,
        end
    ])

    return new THREE.TubeGeometry(curve, TUBES.tubularSegments, TUBES.radius, TUBES.radialSegments, false)
}

function createConnectorTube(targetYWorld, color) {
    const tubeMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: TUBES.opacity
    })
    const tube = new THREE.Mesh(buildTubeGeometry(targetYWorld, AI_POSITION.y), tubeMat)
    tube.userData.isConnectorTube = true
    tube.userData.targetYWorld = targetYWorld
    return tube
}

// Plug: cilindro negro horizontal (eje x) que sobresale apenas de la cara
// lateral de la capa, centrado con el tubo — disimula la unión
function createConnectorPlug(targetYWorld) {
    const plugGeo = new THREE.CylinderGeometry(PLUG.radius, PLUG.radius, PLUG.length, 16)
    const plugMat = new THREE.MeshStandardMaterial({ color: PLUG.color, roughness: 0.45, metalness: 0.05 })
    const plug = new THREE.Mesh(plugGeo, plugMat)
    plug.rotation.z = Math.PI / 2 // eje a lo largo de x (horizontal)
    plug.position.set(
        PLUG.faceX + PLUG.protrude - PLUG.length / 2 - AI_POSITION.x,
        targetYWorld - AI_POSITION.y,
        TUBES.endZ - AI_POSITION.z
    )
    plug.userData.isConnectorPlug = true
    plug.userData.plugWorldY = targetYWorld
    return plug
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

    // Tubos + plugs: core -> capa Data y core -> capa Experience
    // (yBase dinámico desde LAYERS_DATA: si las capas se mueven, siguen solos)
    const yData = LAYERS_DATA.find(l => l.id === 'dat')?.yBase
    const yExperience = LAYERS_DATA.find(l => l.id === 'exp')?.yBase

    if (yData !== undefined) {
        aiNodeGroup.add(createConnectorTube(yData, TUBES.dataColor))
        aiNodeGroup.add(createConnectorPlug(yData))
    }
    if (yExperience !== undefined) {
        aiNodeGroup.add(createConnectorTube(yExperience, TUBES.experienceColor))
        aiNodeGroup.add(createConnectorPlug(yExperience))
    }

    aiNodeGroup.position.set(AI_POSITION.x, AI_POSITION.y, AI_POSITION.z)

    // El nodo es decorativo: no intercepta el raycast (los clicks pasan a las capas)
    aiNodeGroup.traverse(child => { child.raycast = () => {} })

    scene.add(aiNodeGroup)
    return aiNodeGroup
}

export function animateAINode(aiNodeGroup) {
    const time = Date.now() * 0.002

    // Flotación sutil (se setea ANTES de reconstruir tubos / anclar plugs)
    aiNodeGroup.position.y = AI_POSITION.y + Math.sin(time) * 0.25

    // Tubos: el extremo de la capa queda fijo en mundo; la curva absorbe el
    // movimiento estirándose. Plugs: contra-anclados a la capa (fijos en mundo)
    aiNodeGroup.children.forEach(child => {
        if (child.userData.isConnectorTube) {
            child.geometry.dispose()
            child.geometry = buildTubeGeometry(child.userData.targetYWorld, aiNodeGroup.position.y)
        } else if (child.userData.isConnectorPlug) {
            child.position.y = child.userData.plugWorldY - aiNodeGroup.position.y
        }
    })

    // Rotaciones propias
    aiNodeGroup.children[1].rotation.y += 0.012 // cristal
    aiNodeGroup.children[1].rotation.x += 0.008
    aiNodeGroup.children[3].rotation.z += 0.015 // anillo indigo
    aiNodeGroup.children[4].rotation.x -= 0.02 // anillo sky

    // Pulso del aura
    const pulse = 1 + Math.sin(time * 3) * 0.08
    aiNodeGroup.children[0].scale.set(pulse, pulse, pulse)
}
