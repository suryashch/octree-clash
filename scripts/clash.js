import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeOctree } from './octree/octree.js';
import { OctreeVisualizer } from './rendering/drawing.js';
import { createScene } from './rendering/scene.js';
import { initControls } from './utils/controls.js';
import { PerformanceMonitor } from './utils/performancemonitor.js';

const colorMap = {
    0: '#ffffff',
    1: '#2217b9',
    2: '#2217b9',
    3: '#2217b9',
    4: '#8f8c8c'
};

const state = { 
    radius: 0.5,
    mesh_pos: [3,3,3]
};

const count = 10
const ot_dimensions = 8
const ot_depth = 4

// const perfMonitor = new PerformanceMonitor()

let input_bounds = [0,ot_dimensions,ot_dimensions,0,0,ot_dimensions];
let final_bounds = null

let mesh = null;

const { scene, camera, renderer, controls } = createScene();
const ot = makeOctree(input_bounds, ot_depth);

const visualizer = new OctreeVisualizer(colorMap);
scene.add(visualizer.group);

document.body.appendChild(renderer.domElement);

controls.update()

const light_1 = new THREE.HemisphereLight(0xffffff, 0.25);
light_1.position.set(10,10,10)
scene.add(light_1);

const loader = new GLTFLoader().setPath('/public/models/');
loader.load('classic_roblox_rubber_duckie.glb', (gltf) => {
    mesh = gltf.scene;
    mesh.position.set(3, 3, 3);
    scene.add(mesh);
})

const loader_2 = new GLTFLoader().setPath('/public/models/');
loader_2.load('human-foot.glb', (gltf) => {

    gltf.scene.traverse((child) => {
        if (child.isMesh){
            const mesh_obj = new THREE.InstancedMesh(child.geometry, new THREE.MeshStandardMaterial(), count);
            scene.add(mesh_obj);

            const matrix = new THREE.Matrix4();
            for (let i = 0; i < count; i++){
                matrix.setPosition(
                    Math.round(Math.random() * ot_dimensions),
                    Math.round(Math.random() * ot_dimensions),
                    Math.round(Math.random() * ot_dimensions)
                );
                mesh_obj.setMatrixAt(i, matrix);
            }
            mesh_obj.instanceMatrix.needsUpdate = true;
            console.log(mesh_obj);
        }
    })
})

final_bounds = visualizer.update(state.mesh_pos, ot, state.radius);

initControls(state.mesh_pos, state, () => {
    final_bounds = visualizer.update(state.mesh_pos, ot, state.radius);
    if (mesh) mesh.position.fromArray(state.mesh_pos);
});

console.log(final_bounds)

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // perfMonitor.update(renderer, scene);
};

animate();