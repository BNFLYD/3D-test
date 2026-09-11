import './style.css'
import Alpine from 'alpinejs'
import './js/app.js'
import { initThree } from './js/scene3d.js'
import { initCanvasVisualizer } from './js/architecture/canvas-visualizer.js'

window.Alpine = Alpine
Alpine.start()

window.onload = () => {
    initThree()

    // Inicializar visualizador Canvas 2D (sincronizado con el estado Alpine via eventos)
    const container2d = document.getElementById('canvas2d-container')
    const canvas2d = document.getElementById('canvas2d')
    if (container2d && canvas2d) {
        const api = initCanvasVisualizer({ container: container2d, canvas: canvas2d })
        const appEl = document.querySelector('[x-data]')
        if (appEl && appEl.__x) {
            appEl.__x.$data.canvas2dApi = api
        }
    }
}

// Navegación de pasos con la rueda del mouse (el canvas 2D intercepta su propio wheel)
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