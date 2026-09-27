// 1. Scene & Renderer Initialization
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030305, 0.03);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// 2. Interactive Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.maxPolarAngle = Math.PI / 2.05; // Lock camera from going below floor

// 3. Realistic Studio Lighting Setup
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const keyLight = new THREE.SpotLight(0xfff5e6, 4);
keyLight.position.set(5, 12, 6);
keyLight.castShadow = true;
scene.add(keyLight);

const goldAccent = new THREE.PointLight(0xe5b842, 3, 12);
goldAccent.position.set(-4, 3, 2);
scene.add(goldAccent);

const redRim = new THREE.PointLight(0xff0022, 4, 10);
redRim.position.set(0, 2, -4);
scene.add(redRim);

// 4. Mirror Floor Floor Grid
const floorGeo = new THREE.PlaneGeometry(60, 60);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x08080c, roughness: 0.15, metalness: 0.85 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(40, 50, 0xe5b842, 0x222222);
grid.position.y = 0.01;
scene.add(grid);

// 5. Load Photorealistic 3D Car Mesh (.glb)
const carGroup = new THREE.Group();
scene.add(carGroup);

const loader = new THREE.GLTFLoader();
loader.load(
    'https://threejs.org/examples/models/gltf/ferrari.glb', // Default High-Res Ferrari GLB Model Asset
    function (gltf) {
        const model = gltf.scene;
        model.scale.set(0.85, 0.85, 0.85);

        // Custom Physical Metallic Paint Shader
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.name.includes('body')) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xba0012,
                        metalness: 0.9,
                        roughness: 0.1,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.03
                    });
                }
            }
        });

        carGroup.add(model);
        
        // Hide Loader once mesh is loaded
        document.getElementById('loader').style.display = 'none';
    },
    undefined,
    function (error) {
        console.error("Error loading 3D Car Asset:", error);
    }
);

// 6. Scroll Engine (360 Degree Smooth Rotation)
window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = window.scrollY / maxScroll;

    carGroup.rotation.y = scrollPercent * Math.PI * 2.5;
    camera.position.y = 1.2 + Math.sin(scrollPercent * Math.PI) * 0.4;
});

// Window Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();


