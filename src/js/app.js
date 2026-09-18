// HOD System Architecture - Alpine.js Application State & HTMX Bridge

import Alpine from 'alpinejs'
import htmx from 'htmx.org'

window.htmx = htmx

export default function architectureApp() {
    return {
        currentStep: 1,
        explodeFactor: 0,
        isAutoRotating: false,
        isAutoStory: false,
        autoStoryTimer: null,
        showSecurity: true,
        showAI: true,
        showFlow: true,
        drawerOpen: false,
        viewMode: '3d',
        canvas2dApi: null,

        steps: [
            { id: 1, number: '01', label: 'Experience Layer', shortLabel: 'Experience', file: 'layer-01-experience.html', desc: 'Punto de contacto e interacción multicanal con usuarios y clientes finales. Gestiona clientes Web, Móviles, APIs externas y canales directos como WhatsApp.' },
            { id: 2, number: '02', label: 'Application Layer', shortLabel: 'Application', file: 'layer-02-application.html', desc: 'Orquestación de procesos de negocio, comunicación asíncrona, integración de servicios externos y lógica de flujos de trabajo.' },
            { id: 3, number: '03', label: 'Domain Layer', shortLabel: 'Domain', file: 'layer-03-domain.html', desc: 'Núcleo de inteligencia operativa. Contiene el modelo de dominio agnóstico a la tecnología, reglas de negocio puras y procesos del core.' },
            { id: 4, number: '04', label: 'Data Layer', shortLabel: 'Data', file: 'layer-04-data.html', desc: 'Persistencia distribuida, almacenamiento relacional, motores de búsqueda semántica, caché en memoria y almacenamiento de objetos.' },
            { id: 5, number: '05', label: 'Infrastructure Layer', shortLabel: 'Infrastructure', file: 'layer-05-infrastructure.html', desc: 'Soporte físico y virtualizado. Nube híbrida, orquestación de contenedores y nodos perimetrales (Edge) para baja latencia.' },
            { id: 6, number: 'SEC', label: 'Security Field (Transversal)', shortLabel: 'Security', file: 'security-field.html', desc: 'Políticas de seguridad Zero-Trust transversales que envuelven toda la pila, desde la red perimetral hasta el cifrado en reposo.' },
            { id: 7, number: 'AI', label: 'AI Module (Selective)', shortLabel: 'AI', file: 'ai-module.html', desc: 'Capacidades de inteligencia artificial y aprendizaje automático integradas de manera selectiva y contextual ("when it makes sense").' },
            { id: 8, number: 'HOD', label: 'Arquitectura Completa', shortLabel: 'Arquitectura', file: 'architecture-complete.html', desc: 'La arquitectura de sistemas HOD está consolidada como un ecosistema cohesivo y escalable. Cada capa interactúa armónicamente garantizando robustez y alta disponibilidad.' }
        ],

        init() {
            this.$watch('currentStep', (val) => {
                this.loadStepContent(val);
                window.dispatchEvent(new CustomEvent('app-step-changed', { detail: { step: val } }));
            });

            this.$watch('explodeFactor', (val) => {
                window.dispatchEvent(new CustomEvent('app-explode-changed', { detail: { factor: val } }));
            });

            this.$watch('showSecurity', (val) => {
                window.dispatchEvent(new CustomEvent('app-security-toggle', { detail: { visible: val } }));
            });

            this.$watch('showAI', (val) => {
                window.dispatchEvent(new CustomEvent('app-ai-toggle', { detail: { visible: val } }));
            });

            this.$watch('showFlow', (val) => {
                window.dispatchEvent(new CustomEvent('app-flow-toggle', { detail: { visible: val } }));
            });

            this.$watch('isAutoRotating', (val) => {
                window.dispatchEvent(new CustomEvent('app-autospin-toggle', { detail: { active: val } }));
            });

            this.$watch('viewMode', (val) => {
                // Swap de slots main/mini y resize de ambos renderers
                window.dispatchEvent(new CustomEvent('app-view-changed', { detail: { mode: val } }));
            });

            window.addEventListener('3d-step-changed', (e) => {
                this.currentStep = e.detail.step;
            });

            this.loadStepContent(this.currentStep);
            window.dispatchEvent(new CustomEvent('app-view-changed', { detail: { mode: this.viewMode } }));
        },

        setStep(step) {
            this.currentStep = step;
        },

        prevStep() {
            let prev = this.currentStep - 1;
            if (prev < 1) prev = this.steps.length;
            this.currentStep = prev;
        },

        nextStep() {
            let next = this.currentStep + 1;
            if (next > this.steps.length) next = 1;
            this.currentStep = next;
        },

        loadStepContent(step) {
            const stepData = this.steps.find(s => s.id === step);
            if (!stepData) return;

            const container = document.getElementById('drawer-content');
            if (!container) return;

            htmx.ajax('GET', `/partials/${stepData.file}`, {
                target: '#drawer-content',
                swap: 'innerHTML'
            });

            this.drawerOpen = step <= 7;
        },

        togglePlayStory() {
            if (this.isAutoStory) {
                clearInterval(this.autoStoryTimer);
                this.isAutoStory = false;
            } else {
                this.isAutoStory = true;
                this.autoStoryTimer = setInterval(() => {
                    this.nextStep();
                }, 3500);
            }
        },

        resetCamera() {
            window.dispatchEvent(new CustomEvent('app-reset-camera'));
        },

        closeDrawer() {
            this.drawerOpen = false;
        }
    };
}

Alpine.data('architectureApp', architectureApp)