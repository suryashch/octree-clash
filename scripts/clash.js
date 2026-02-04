import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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

let index_ctr = 0

// const perfMonitor = new PerformanceMonitor()

let input_bounds = [0,ot_dimensions,ot_dimensions,0,0,ot_dimensions];
let final_bounds = null

let mesh = null;

const { scene, camera, renderer, controls } = createScene();

function makeOctree(bounds, depth) {
    const node = {
        bounds,
        children: null
    };

    if (depth === 0) return node;
    
    node.children = [];

    const [x_l, x_r, y_t, y_b, z_f, z_b] = bounds;
    const midX = (x_l + x_r) / 2;
    const midY = (y_t + y_b) / 2;
    const midZ = (z_f + z_b) / 2;

    const childBounds = [
        [x_l, midX, midY, y_b, z_f, midZ], [midX, x_r, midY, y_b, z_f, midZ],
        [x_l, midX, y_t, midY, z_f, midZ], [midX, x_r, y_t, midY, z_f, midZ],
        [x_l, midX, midY, y_b, midZ, z_b], [midX, x_r, midY, y_b, midZ, z_b],
        [x_l, midX, y_t, midY, midZ, z_b], [midX, x_r, y_t, midY, midZ, z_b]
    ];

    for (let i = 0; i < 8; i++) {
        node.children.push(makeOctree(childBounds[i], depth - 1));
    }

    return node;
}

function drawCube(bounds, line_color) {
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const unitEdges = new THREE.EdgesGeometry(unitBox);
    const box_material = new THREE.LineBasicMaterial({
        color: line_color
    });
    const line = new THREE.LineSegments(unitEdges, box_material);
    
    const [xl, xr, yt, yb, zf, zb] = bounds;
    const w = xr - xl, h = yt - yb, d = zb - zf;

    line.position.set(xl + w/2, yb + h/2, zf + d/2);
    line.scale.set(w, h, d);

    scene.add(line)
}

function isIntersecting(pos, bounds, radius) {
    const [px, py, pz] = pos;
    const [xl, xr, yt, yb, zf, zb] = bounds;

    const dx = Math.max(xl - px, 0, px - xr);
    const dy = Math.max(yb - py, 0, py - yt);
    const dz = Math.max(zf - pz, 0, pz - zb);

    return (dx * dx + dy * dy + dz * dz) < (radius * radius);
}

function otVisualizer(pos, node, radius, level) {
    if (node.children === null || !isIntersecting(pos, node.bounds, radius)) return

    for (let i=0; i<8; i++){
        drawCube(node.children[i].bounds, colorMap[level]);
        otVisualizer(pos, node.children[i], radius, level + 1)
    }
    
}

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

const ot = makeOctree(input_bounds, ot_depth);

otVisualizer(state.mesh_pos, ot, state.radius, 0)

// const loader_2 = new GLTFLoader().setPath('/public/models/');
// loader_2.load('human-foot.glb', (gltf) => {

//     gltf.scene.traverse((child) => {
//         if (child.isMesh){
//             const mesh_obj = new THREE.InstancedMesh(child.geometry, new THREE.MeshStandardMaterial(), count);
//             scene.add(mesh_obj);

//             const matrix = new THREE.Matrix4();
//             for (let i = 0; i < count; i++){
//                 matrix.setPosition(
//                     Math.round(Math.random() * ot_dimensions),
//                     Math.round(Math.random() * ot_dimensions),
//                     Math.round(Math.random() * ot_dimensions)
//                 );
//                 mesh_obj.setMatrixAt(i, matrix);
//             }
//             mesh_obj.instanceMatrix.needsUpdate = true;
//             console.log(mesh_obj);
//         }
//     })
// })

// final_bounds = visualizer.update(state.mesh_pos, ot, state.radius);

// initControls(state.mesh_pos, state, () => {
//     final_bounds = visualizer.update(state.mesh_pos, ot, state.radius);
//     if (mesh) mesh.position.fromArray(state.mesh_pos);
// });

// console.log(final_bounds)

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // perfMonitor.update(renderer, scene);
};

animate();