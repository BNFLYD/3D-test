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
            { id: 1, number: '01', label: '01 Experience Layer', shortLabel: 'Experience', file: 'layer-01-experience.html' },
            { id: 2, number: '02', label: '02 Application Layer', shortLabel: 'Application', file: 'layer-02-application.html' },
            { id: 3, number: '03', label: '03 Domain Layer', shortLabel: 'Domain', file: 'layer-03-domain.html' },
            { id: 4, number: '04', label: '04 Data Layer', shortLabel: 'Data', file: 'layer-04-data.html' },
            { id: 5, number: '05', label: '05 Infrastructure Layer', shortLabel: 'Infrastructure', file: 'layer-05-infrastructure.html' },
            { id: 6, number: 'SEC', label: 'Security Field (Transversal)', shortLabel: 'Security', file: 'security-field.html' },
            { id: 7, number: 'AI', label: 'AI Module (Selective)', shortLabel: 'AI', file: 'ai-module.html' },
            { id: 8, number: 'HOD', label: 'Arquitectura Completa', shortLabel: 'Arquitectura', file: 'architecture-complete.html' }
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