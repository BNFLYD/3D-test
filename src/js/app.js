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
        canvas2dView: 'iso',
        canvas2dApi: null,

        steps: [
            { id: 1, label: '01 Experience Layer', file: 'layer-01-experience.html' },
            { id: 2, label: '02 Application Layer', file: 'layer-02-application.html' },
            { id: 3, label: '03 Domain Layer', file: 'layer-03-domain.html' },
            { id: 4, label: '04 Data Layer', file: 'layer-04-data.html' },
            { id: 5, label: '05 Infrastructure Layer', file: 'layer-05-infrastructure.html' },
            { id: 6, label: 'Security Field (Transversal)', file: 'security-field.html' },
            { id: 7, label: 'AI Module (Selective)', file: 'ai-module.html' },
            { id: 8, label: 'Arquitectura Completa', file: 'architecture-complete.html' }
        ],

        init() {
            this.$watch('currentStep', (val) => {
                this.loadStepContent(val);
                window.dispatchEvent(new CustomEvent('app-step-changed', { detail: { step: val } }));
                this.updateStepUI();
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
                if (val === '2d') {
                    // Forzar resize del canvas 2D cuando se vuelve visible
                    window.dispatchEvent(new Event('resize'));
                }
            });

            window.addEventListener('3d-step-changed', (e) => {
                this.currentStep = e.detail.step;
            });

            this.loadStepContent(this.currentStep);
        },

        setStep(step) {
            this.currentStep = step;
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

        updateStepUI() {
            this.steps.forEach(s => {
                const btn = document.getElementById(`step-btn-${s.id}`);
                if (btn) {
                    if (s.id === this.currentStep) {
                        btn.classList.add('active');
                        btn.querySelector('i').classList.replace('text-slate-600', 'text-cyan-400');
                    } else {
                        btn.classList.remove('active');
                        btn.querySelector('i').classList.replace('text-cyan-400', 'text-slate-600');
                    }
                }
            });
        },

        togglePlayStory() {
            if (this.isAutoStory) {
                clearInterval(this.autoStoryTimer);
                this.isAutoStory = false;
            } else {
                this.isAutoStory = true;
                this.autoStoryTimer = setInterval(() => {
                    let next = this.currentStep + 1;
                    if (next > 8) next = 1;
                    this.setStep(next);
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