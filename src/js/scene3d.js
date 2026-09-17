// HOD System Architecture - Three.js Scene Module
// Ported from /presentacion/HOD System Architecture.html

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

// Frames de cámara por defecto para cada slot (main = vista principal, mini = miniatura)
const FRAME3D_MAIN = {
    position: { x: 20, y: 20, z: 20 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1,
    autoRotate: false
}
const FRAME3D_MINI = {
    position: { x: 20, y: 20, z: 20 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1,
    autoRotate: true
}
const frame3DFor = (mode) => (mode === '3d' ? FRAME3D_MAIN : FRAME3D_MINI)

let currentFrame3D = FRAME3D_MAIN

const LAYERS_DATA = [
    {
        id: 'exp',
        step: 1,
        number: '01',
        name: 'EXPERIENCE',
        subtitle: 'Web · Mobile · API · WhatsApp',
        desc: 'Punto de contacto e interacción multicanal con usuarios y clientes finales.',
        relation: 'Interactúa directamente con la capa de Aplicación a través de contratos de API seguros.',
        colorHex: 0x00f3ff,
        accentColor: '#00f3ff',
        bgGradient: ['#003852', '#00f3ff'],
        icon: 'fa-mobile-screen-button',
        subComponents: ['Web App (React/Next.js)', 'Mobile Native (iOS/Android)', 'REST & GraphQL APIs', 'WhatsApp Business Bot'],
        yBase: 5.2
    },
    {
        id: 'app',
        step: 2,
        number: '02',
        name: 'APPLICATION',
        subtitle: 'Services · Workflows · Integrations',
        desc: 'Orquestación de procesos de negocio, comunicación asíncrona y microservicios.',
        relation: 'Ejecuta operaciones consultando las Reglas de Dominio y disparando eventos.',
        colorHex: 0x00d2ff,
        accentColor: '#00d2ff',
        bgGradient: ['#002244', '#0099ff'],
        icon: 'fa-gears',
        subComponents: ['Microservices Mesh', 'Workflow Orchestration', 'Event Bus / Webhooks', 'Third-party Integrations'],
        yBase: 2.6
    },
    {
        id: 'dom',
        step: 3,
        number: '03',
        name: 'DOMAIN',
        subtitle: 'Business Rules · Entities · Processes',
        desc: 'Núcleo de inteligencia operativa. Contiene el modelo de dominio agnóstico a la tecnología.',
        relation: 'Utiliza las abstracciones de persistencia de la capa de Datos para guardar estado.',
        colorHex: 0x10b981,
        accentColor: '#10b981',
        bgGradient: ['#023824', '#10b981'],
        icon: 'fa-diagram-project',
        subComponents: ['Core Entities', 'Domain Logic & Invariants', 'Business State Machines', 'Domain Events'],
        yBase: 0.0
    },
    {
        id: 'dat',
        step: 4,
        number: '04',
        name: 'DATA',
        subtitle: 'Database · Search · Storage · Cache',
        desc: 'Persistencia distribuida, almacenamiento relacional, búsquedas indexadas y caché rápido.',
        relation: 'Reside sobre la Infraestructura física o virtualizada para garantizar alta disponibilidad.',
        colorHex: 0x8b5cf6,
        accentColor: '#8b5cf6',
        bgGradient: ['#280f54', '#8b5cf6'],
        icon: 'fa-database',
        subComponents: ['PostgreSQL / Distributed DB', 'ElasticSearch / Vector DB', 'Object Storage (S3)', 'Redis Memory Cache'],
        yBase: -2.6
    },
    {
        id: 'inf',
        step: 5,
        number: '05',
        name: 'INFRASTRUCTURE',
        subtitle: 'Cloud · On-Prem · Hybrid · Edge',
        desc: 'Capa base que soporta la nube híbrida, cómputo distribuido y redes de baja latencia.',
        relation: 'Capa fundamental sobre la cual se despliegan todos los recursos de datos y cómputo.',
        colorHex: 0x0066ff,
        accentColor: '#0066ff',
        bgGradient: ['#001133', '#0066ff'],
        icon: 'fa-cloud',
        subComponents: ['AWS / GCP Multi-cloud', 'On-Premise Private Cluster', 'Edge Computing Nodes', 'Kubernetes Containers'],
        yBase: -5.2
    }
];

let scene, camera, renderer, controls;
let layerMeshes = [];
let securityGroup, aiNodeGroup, flowParticlesGroup;
let raycaster, mouse;

let currentStep = 1;
let explodeFactor = 0;
let isAutoRotating = false;
let showSecurity = true;
let showAI = true;
let showFlow = true;

export function initThree() {
    const container = document.getElementById('webgl-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.025);

    const rect = container.getBoundingClientRect();
    const cw = rect.width || window.innerWidth;
    const ch = rect.height || window.innerHeight;
    const aspect = cw / ch;
    const d = 11;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(cw, ch);
    renderer.domElement.classList.add('w-full', 'h-full');
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(15, 30, 20);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f3ff, 0.8);
    dirLight2.position.set(-20, 10, -15);
    scene.add(dirLight2);

    const bottomPointLight = new THREE.PointLight(0x0088ff, 1.5, 30);
    bottomPointLight.position.set(0, -8, 0);
    scene.add(bottomPointLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    createFloorGrid();
    createLayers();
    createSecurityField();
    createAINode();
    createDataFlowParticles();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onCanvasClick);

    bindAppEvents();

    animate();
}

function createLayerTopTexture(layer) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, layer.bgGradient[0]);
    grad.addColorStop(1, layer.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = layer.accentColor;
    ctx.lineWidth = 16;
    ctx.strokeRect(20, 20, 984, 984);

    ctx.fillStyle = '#ffffff';
    const cornerSize = 40;
    ctx.fillRect(20, 20, cornerSize, cornerSize);
    ctx.fillRect(1024 - 20 - cornerSize, 20, cornerSize, cornerSize);
    ctx.fillRect(20, 1024 - 20 - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(1024 - 20 - cornerSize, 1024 - 20 - cornerSize, cornerSize, cornerSize);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(60, 60, 180, 80);
    ctx.font = 'bold 48px "JetBrains Mono", sans-serif';
    ctx.fillStyle = layer.accentColor;
    ctx.fillText(layer.number, 80, 118);

    ctx.save();
    ctx.translate(512, 512);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (layer.id === 'inf') {
        ctx.beginPath();
        ctx.arc(-60, 20, 70, Math.PI * 0.8, Math.PI * 1.85);
        ctx.arc(40, -50, 90, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(120, 30, 60, Math.PI * 1.5, Math.PI * 0.4);
        ctx.lineTo(-120, 90);
        ctx.arc(-120, 30, 60, Math.PI * 0.5, Math.PI * 1.2);
        ctx.closePath();
        ctx.stroke();
    } else if (layer.id === 'dat') {
        for (let y of [-100, 0, 100]) {
            ctx.beginPath();
            ctx.ellipse(0, y, 140, 50, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-140, -100); ctx.lineTo(-140, 100);
        ctx.moveTo(140, -100); ctx.lineTo(140, 100);
        ctx.stroke();
    } else if (layer.id === 'dom') {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = 150 * Math.cos(angle);
            const y = 150 * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = layer.accentColor;
        ctx.fill();
    } else if (layer.id === 'app') {
        ctx.beginPath();
        ctx.rect(-120, -120, 240, 240);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.stroke();
    } else if (layer.id === 'exp') {
        ctx.beginPath();
        ctx.rect(-140, -100, 280, 180);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-60, 80); ctx.lineTo(60, 80);
        ctx.moveTo(0, 80); ctx.lineTo(0, 120);
        ctx.stroke();
    }
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = 'bold 56px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(layer.name, 512, 820);

    ctx.font = '500 32px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(layer.subtitle, 512, 880);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createSideGrillTexture(accentHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#161d2a';
    const numVents = 24;
    const ventWidth = 12;
    const gap = 8;
    const startX = 30;

    for (let i = 0; i < numVents; i++) {
        const x = startX + i * (ventWidth + gap);
        ctx.fillRect(x, 30, ventWidth, 196);

        ctx.fillStyle = accentHex;
        ctx.fillRect(x + 3, 30, 2, 196);
        ctx.fillStyle = '#161d2a';
    }

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(15, 15, 6, 0, Math.PI * 2);
    ctx.arc(497, 15, 6, 0, Math.PI * 2);
    ctx.arc(15, 241, 6, 0, Math.PI * 2);
    ctx.arc(497, 241, 6, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

function createFloorGrid() {
    const gridHelper = new THREE.GridHelper(30, 30, 0x00f3ff, 0x1e293b);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    const planeGeo = new THREE.PlaneGeometry(30, 30);
    const planeMat = new THREE.MeshBasicMaterial({
        color: 0x05070c,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(planeGeo, planeMat);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -8.05;
    scene.add(floor);
}

function createLayers() {
    const blockWidth = 7.5;
    const blockHeight = 1.4;
    const blockDepth = 7.5;
    const radius = 0.4;

    LAYERS_DATA.forEach((layerData, idx) => {
        const layerGroup = new THREE.Group();
        layerGroup.userData = { ...layerData, index: idx };

        const shape = new THREE.Shape();
        const w = blockWidth / 2;
        const d = blockDepth / 2;
        const r = radius;

        shape.moveTo(-w + r, -d);
        shape.lineTo(w - r, -d);
        shape.quadraticCurveTo(w, -d, w, -d + r);
        shape.lineTo(w, d - r);
        shape.quadraticCurveTo(w, d, w - r, d);
        shape.lineTo(-w + r, d);
        shape.quadraticCurveTo(-w, d, -w, d - r);
        shape.lineTo(-w, -d + r);
        shape.quadraticCurveTo(-w, -d, -w + r, -d);

        const extrudeSettings = {
            steps: 1,
            depth: blockHeight,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3
        };

        const blockGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        blockGeo.rotateX(-Math.PI / 2);
        blockGeo.center();

        const topTexture = createLayerTopTexture(layerData);
        const sideGrillTexture = createSideGrillTexture(layerData.accentColor);

        const materials = [
            new THREE.MeshStandardMaterial({
                color: 0x111622,
                metalness: 0.8,
                roughness: 0.2,
                map: sideGrillTexture
            }),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.1,
                roughness: 0.3,
                map: topTexture
            })
        ];

        const blockMesh = new THREE.Mesh(blockGeo, materials);
        blockMesh.castShadow = true;
        blockMesh.receiveShadow = true;
        layerGroup.add(blockMesh);

        const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.9, roughness: 0.1 });

        const leftHandle = new THREE.Mesh(handleGeo, handleMat);
        leftHandle.position.set(-w - 0.1, 0, 0);
        layerGroup.add(leftHandle);

        const rightHandle = new THREE.Mesh(handleGeo, handleMat);
        rightHandle.position.set(w + 0.1, 0, 0);
        layerGroup.add(rightHandle);

        const glowGeo = new THREE.PlaneGeometry(8.5, 8.5);
        const canvasGlow = document.createElement('canvas');
        canvasGlow.width = 256; canvasGlow.height = 256;
        const gCtx = canvasGlow.getContext('2d');
        const gRad = gCtx.createRadialGradient(128, 128, 10, 128, 128, 128);
        gRad.addColorStop(0, layerData.accentColor);
        gRad.addColorStop(0.5, layerData.accentColor + '55');
        gRad.addColorStop(1, 'transparent');
        gCtx.fillStyle = gRad;
        gCtx.fillRect(0, 0, 256, 256);

        const glowTex = new THREE.CanvasTexture(canvasGlow);
        const glowMat = new THREE.MeshBasicMaterial({
            map: glowTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.rotation.x = -Math.PI / 2;
        glowMesh.position.y = -blockHeight / 2 - 0.05;
        layerGroup.add(glowMesh);

        layerGroup.position.set(0, layerData.yBase, 0);
        scene.add(layerGroup);
        layerMeshes.push(layerGroup);
    });
}

function createSecurityField() {
    securityGroup = new THREE.Group();

    const boxGeo = new THREE.BoxGeometry(9.2, 13.5, 9.2);
    const wireGeo = new THREE.WireframeGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        linewidth: 2,
        transparent: true,
        opacity: 0.6
    });
    const wireframe = new THREE.LineSegments(wireGeo, lineMat);
    wireframe.position.y = 0;
    securityGroup.add(wireframe);

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.08,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 1.2
    });
    const glassMesh = new THREE.Mesh(boxGeo, glassMat);
    glassMesh.position.y = 0;
    securityGroup.add(glassMesh);

    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 13.5, 16);
    const pillarMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    const corners = [
        [-4.6, -4.6], [4.6, -4.6], [-4.6, 4.6], [4.6, 4.6]
    ];

    corners.forEach(([x, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 0, z);
        securityGroup.add(pillar);
    });

    const canvasSec = document.createElement('canvas');
    canvasSec.width = 512; canvasSec.height = 128;
    const sCtx = canvasSec.getContext('2d');
    sCtx.fillStyle = '#f59e0b';
    sCtx.font = 'bold 42px "JetBrains Mono", sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('SECURITY FIELD', 256, 75);
    sCtx.strokeStyle = '#f59e0b';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(10, 10, 492, 108);

    const labelTex = new THREE.CanvasTexture(canvasSec);
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide });
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), labelMat);
    labelMesh.position.set(0, 7.2, 4.7);
    securityGroup.add(labelMesh);

    scene.add(securityGroup);
}

function createAINode() {
    aiNodeGroup = new THREE.Group();

    const coreGeo = new THREE.IcosahedronGeometry(0.9, 2);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xec4899,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        wireframe: true
    });
    const aiCore = new THREE.Mesh(coreGeo, coreMat);
    aiNodeGroup.add(aiCore);

    const ringGeo = new THREE.TorusGeometry(1.5, 0.04, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    aiNodeGroup.add(ring);

    aiNodeGroup.position.set(8, 2.5, 2);

    const targetYPositions = [5.2, 2.6, -2.6];
    const colors = [0x00f3ff, 0x00d2ff, 0x8b5cf6];

    targetYPositions.forEach((yPos, i) => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(8, 2.5, 2),
            new THREE.Vector3(5, (2.5 + yPos) / 2, 1),
            new THREE.Vector3(3.8, yPos, 0)
        ]);

        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.05, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: colors[i],
            transparent: true,
            opacity: 0.8
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        aiNodeGroup.add(tube);
    });

    const canvasAI = document.createElement('canvas');
    canvasAI.width = 512; canvasAI.height = 128;
    const aCtx = canvasAI.getContext('2d');
    aCtx.fillStyle = '#ec4899';
    aCtx.font = 'bold 38px "JetBrains Mono", sans-serif';
    aCtx.textAlign = 'center';
    aCtx.fillText('AI MODULE', 256, 50);
    aCtx.fillStyle = '#ffffff';
    aCtx.font = '24px "Inter", sans-serif';
    aCtx.fillText('When It Makes Sense', 256, 90);

    const aiLabelTex = new THREE.CanvasTexture(canvasAI);
    const aiLabelMat = new THREE.MeshBasicMaterial({ map: aiLabelTex, transparent: true, side: THREE.DoubleSide });
    const aiLabelMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.88), aiLabelMat);
    aiLabelMesh.position.set(0, 1.8, 0);
    aiNodeGroup.add(aiLabelMesh);

    scene.add(aiNodeGroup);
}

function createDataFlowParticles() {
    flowParticlesGroup = new THREE.Group();
    const particleCount = 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 6;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        speeds[i] = 0.03 + Math.random() * 0.05;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
        color: 0x00f3ff,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geo, pMat);
    particles.userData = { speeds };
    flowParticlesGroup.add(particles);
    scene.add(flowParticlesGroup);
}

function onWindowResize() {
    const container = document.getElementById('webgl-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const aspect = rect.width / rect.height;
    const d = 11;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
}

function onCanvasClick(event) {
    if (event.target.closest('.pointer-events-auto')) return;
    if (event.target !== renderer.domElement) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let hitObject = intersects[0].object;
        while (hitObject.parent && !hitObject.userData.step && hitObject.parent !== scene) {
            hitObject = hitObject.parent;
        }

        if (hitObject.userData && hitObject.userData.step) {
            const layer = hitObject.userData;
            window.dispatchEvent(new CustomEvent('3d-step-changed', { detail: { step: layer.step } }));

            gsap.to(hitObject.scale, { x: 1.08, z: 1.08, duration: 0.2, yoyo: true, repeat: 1 });
        }
    }
}

function updateLayerVisibility() {
    layerMeshes.forEach((mesh, idx) => {
        const layerStep = idx + 1;
        const isVisible = layerStep <= currentStep || currentStep >= 6;

        let targetY = LAYERS_DATA[idx].yBase * (1 + explodeFactor);

        if (!isVisible) {
            targetY += 15;
        }

        gsap.to(mesh.position, {
            y: targetY,
            duration: 0.8,
            ease: "power2.out"
        });

        mesh.visible = true;
        mesh.children[0].material.forEach(mat => {
            mat.transparent = true;
            gsap.to(mat, { opacity: isVisible ? 1 : 0.1, duration: 0.5 });
        });
    });

    if (securityGroup) {
        const secVisible = showSecurity && (currentStep >= 6);
        gsap.to(securityGroup.scale, {
            x: secVisible ? 1 : 0.001,
            y: secVisible ? 1 : 0.001,
            z: secVisible ? 1 : 0.001,
            duration: 0.6,
            ease: "back.out(1.7)"
        });
    }

    if (aiNodeGroup) {
        const aiVisible = showAI && (currentStep >= 7);
        gsap.to(aiNodeGroup.scale, {
            x: aiVisible ? 1 : 0.001,
            y: aiVisible ? 1 : 0.001,
            z: aiVisible ? 1 : 0.001,
            duration: 0.6,
            ease: "back.out(1.7)"
        });
    }
}

function applyFrame3D(f) {
    currentFrame3D = f;
    gsap.to(camera.position, { x: f.position.x, y: f.position.y, z: f.position.z, duration: 0.8, ease: 'power2.inOut' });
    gsap.to(controls.target, { x: f.target.x, y: f.target.y, z: f.target.z, duration: 0.8, ease: 'power2.inOut' });
    gsap.to(camera, { zoom: f.zoom, duration: 0.8, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() });
    controls.autoRotate = f.autoRotate;
    controls.autoRotateSpeed = 2.0;
}

function bindAppEvents() {
    window.addEventListener('app-step-changed', (e) => {
        currentStep = e.detail.step;
        updateLayerVisibility();
    });

    window.addEventListener('app-explode-changed', (e) => {
        explodeFactor = e.detail.factor;
        updateLayerVisibility();
    });

    window.addEventListener('app-security-toggle', (e) => {
        showSecurity = e.detail.visible;
        updateLayerVisibility();
    });

    window.addEventListener('app-ai-toggle', (e) => {
        showAI = e.detail.visible;
        updateLayerVisibility();
    });

    window.addEventListener('app-flow-toggle', (e) => {
        showFlow = e.detail.visible;
        if (flowParticlesGroup) flowParticlesGroup.visible = showFlow;
    });

    window.addEventListener('app-autospin-toggle', (e) => {
        isAutoRotating = e.detail.active;
        controls.autoRotate = isAutoRotating;
        controls.autoRotateSpeed = 2.0;
    });

    window.addEventListener('app-view-changed', (e) => {
        applyFrame3D(frame3DFor(e.detail?.mode ?? '3d'));
    });

    window.addEventListener('app-reset-camera', () => {
        applyFrame3D(currentFrame3D);
    });
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    if (aiNodeGroup && showAI) {
        aiNodeGroup.position.y = 2.5 + Math.sin(Date.now() * 0.002) * 0.3;
        aiNodeGroup.children[0].rotation.y += 0.01;
        aiNodeGroup.children[1].rotation.z += 0.015;
    }

    if (flowParticlesGroup && showFlow) {
        const particles = flowParticlesGroup.children[0];
        const positions = particles.geometry.attributes.position.array;
        const speeds = particles.userData.speeds;

        for (let i = 0; i < speeds.length; i++) {
            positions[i * 3 + 1] += speeds[i];
            if (positions[i * 3 + 1] > 7) {
                positions[i * 3 + 1] = -7;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

window.initThree = initThree