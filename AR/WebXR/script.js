import * as THREE from 'https://threejs.org/build/three.module.js'; 

let scene, camera, renderer;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Enable WebXR
    document.body.appendChild(renderer.domElement);

    // Add your 3D model loading and positioning logic here (See Step 4)

    let animate = function () {
        requestAnimationFrame(animate);
        renderer.setAnimationLoop(render); 
    };

    function render() { 
        renderer.render(scene, camera);
    }

    animate();
}

init(); 

const loader = new THREE.GLTFLoader();
loader.load('https://lovebarnowls.github.io/AR/Mosque.glb', (gltf) => {
    let model = gltf.scene; 
    scene.add(model); 
    model.position.set(0, 0, -2); // Adjust position as needed
});
