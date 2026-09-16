import './style.css'
import Alpine from 'alpinejs'
import './js/app.js'
import { initThree } from './js/scene3d.js'
import { initCanvasVisualizer } from './js/architecture/canvas-visualizer.js'

window.Alpine = Alpine
Alpine.start()

// Mueve los contenedores de render entre el slot principal y la miniatura
function syncViewSlots(mode) {
    const mainSlot = document.getElementById('main-viewport')
    const miniSlot = document.getElementById('mini-viewport')
    const webgl = document.getElementById('webgl-container')
    const canvas2d = document.getElementById('canvas2d-container')
    if (!mainSlot || !miniSlot || !webgl || !canvas2d) return

    if (mode === '2d') {
        mainSlot.appendChild(canvas2d)
        miniSlot.appendChild(webgl)
        webgl.classList.add('pointer-events-none')
        webgl.firstElementChild?.classList.remove('cursor-grab')
        canvas2d.classList.remove('pointer-events-none')
    } else {
        mainSlot.appendChild(webgl)
        miniSlot.appendChild(canvas2d)
        webgl.classList.remove('pointer-events-none')
        canvas2d.classList.add('pointer-events-none')
    }

    // Ambos renderers re-miden su tamaño en su nuevo contenedor
    window.dispatchEvent(new Event('resize'))
}

window.addEventListener('app-view-changed', (e) => syncViewSlots(e.detail.mode))

window.onload = () => {
    // Orden inicial: 3D en main, 2D en miniatura dentro de la card
    syncViewSlots('3d')

    initThree()

    const canvas2dContainer = document.getElementById('canvas2d-container')
    const canvas2d = document.getElementById('canvas2d')
    if (canvas2dContainer && canvas2d) {
        const api = initCanvasVisualizer({ container: canvas2dContainer, canvas: canvas2d })
        const appEl = document.querySelector('[x-data]')
        if (appEl && appEl.__x) {
            appEl.__x.$data.canvas2dApi = api
        }
    }
}

// Navegación de pasos con la rueda del mouse
let scrollCoolDown = false
window.addEventListener('wheel', (event) => {
    if (scrollCoolDown) return
    scrollCoolDown = true
    setTimeout(() => { scrollCoolDown = false }, 300)

    const app = document.querySelector('[x-data]')?.__x?.$data
    if (!app) return
    if (event.deltaY > 0) {
        if (app.currentStep < 8) app.setStep(app.currentStep + 1)
    } else {
        if (app.currentStep > 1) app.setStep(app.currentStep - 1)
    }
}, { passive: false })