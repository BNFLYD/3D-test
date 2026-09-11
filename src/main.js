import './style.css'
import Alpine from 'alpinejs'
import './js/app.js'
import { initThree } from './js/scene3d.js'

window.Alpine = Alpine
Alpine.start()

// Initialize Three.js scene on window load
window.onload = () => {
    initThree()
}

// Handle scroll wheel navigation for steps
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