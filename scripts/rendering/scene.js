import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene() {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("#262837");
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(15, 12, -12);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance=10;
    controls.maxDistance=25;
    controls.minPolarAngle=0.5;
    controls.maxPolarAngle=1.5;
    controls.autoRotate=false;
    controls.target = new THREE.Vector3(3.2,2,5.4);

    return { scene, camera, renderer, controls };
}