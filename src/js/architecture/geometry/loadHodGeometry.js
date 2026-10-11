// Carga el SVG del logo HOD y lo extruye a geometría 3D
// Copiado de la web canónica: hod-software/src/components/architecture/geometry/loadHodGeometry.js

import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

export const HOD_SHAPE_COUNT = 11
export const HOD_SOURCE_BOUNDS = {
  minX: 0,
  minY: 0,
  maxX: 740.8834263204472,
  maxY: 868.8000667282035,
}

const HOD_FILL = '#08b8d8'

function pathFill(path) {
  const fill = path.userData?.style?.fill
  if (typeof fill === 'string') return fill.toLowerCase()
  return path.color ? `#${path.color.getHexString()}` : ''
}

function boundsToObject(box) {
  return {
    minX: box.min.x,
    minY: box.min.y,
    maxX: box.max.x,
    maxY: box.max.y,
    width: box.max.x - box.min.x,
    height: box.max.y - box.min.y,
  }
}

function assertBounds(bounds) {
  const tolerance = 0.1
  const expected = HOD_SOURCE_BOUNDS
  const valid = (
    Math.abs(bounds.minX - expected.minX) <= tolerance &&
    Math.abs(bounds.minY - expected.minY) <= tolerance &&
    Math.abs(bounds.maxX - expected.maxX) <= tolerance &&
    Math.abs(bounds.maxY - expected.maxY) <= tolerance
  )

  if (!valid) {
    throw new Error(`HOD SVG bounds changed: ${JSON.stringify(bounds)}`)
  }
}

export async function loadHodGeometry({
  depth = 54,
  bevelSize = 0.7,
  bevelThickness = 1,
} = {}) {
  const loader = new SVGLoader()
  const response = await fetch('/logo-nobg.svg')
  if (!response.ok) throw new Error(`Unable to load HOD SVG (${response.status})`)
  const source = (await response.text()).replace(/\sfilter="[^"]*"/, '')
  const svg = loader.parse(source)
  const paths = svg.paths.filter((path) => pathFill(path) === HOD_FILL)
  const shapes = paths.flatMap((path) => path.toShapes())

  if (paths.length !== HOD_SHAPE_COUNT || shapes.length !== HOD_SHAPE_COUNT) {
    throw new Error(`Expected ${HOD_SHAPE_COUNT} HOD shapes, received ${paths.length} paths and ${shapes.length} shapes`)
  }

  shapes.forEach((shape) => {
    shape.autoClose = true
  })

  const planarBounds = new THREE.Box3()
  shapes.forEach((shape) => {
    const planar = new THREE.ShapeGeometry(shape)
    planar.computeBoundingBox()
    planarBounds.union(planar.boundingBox)
    planar.dispose()
  })

  const sourceBounds = boundsToObject(planarBounds)
  assertBounds(sourceBounds)

  const geometries = shapes.map((shape) => {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      curveSegments: 1,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize,
      bevelThickness,
    })
    geometry.computeVertexNormals()
    return geometry
  })

  const volumeBounds = new THREE.Box3()
  geometries.forEach((geometry) => {
    geometry.computeBoundingBox()
    volumeBounds.union(geometry.boundingBox)
  })

  const center = volumeBounds.getCenter(new THREE.Vector3())
  geometries.forEach((geometry) => {
    geometry.translate(-center.x, -center.y, -center.z)
  })

  return {
    geometries,
    shapeCount: shapes.length,
    sourceBounds,
    volumeBounds: boundsToObject(volumeBounds),
  }
}
