import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor("#262837");
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = false;
controls.enablePan = false;
controls.minDistance=10;
controls.maxDistance=25;
controls.minPolarAngle=0.5;
controls.maxPolarAngle=1.5;
controls.autoRotate=false;
controls.target = new THREE.Vector3(3.2,2,5.4);

const ot_dimensions = 16;
const max_depth = 4;

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

    scene.add(line);
};

function makeOctree(bounds, object_dict, depth){
    
    const ot = new Map();
    ot.set('bounds', bounds);
    const [ x_l, x_r, y_t, y_b, z_f, z_b ] = bounds;

    if (depth === 0){
        let lst_objs = [];
        
        object_dict.forEach(( value, key ) => {
            
            if (
                (x_l <= value.x && value.x <= x_r) &&
                (y_b <= value.y && value.y <= y_t) &&
                (z_f <= value.z && value.z <= z_b)
            ) {
                lst_objs.push( key )
            }
            
        });

        ot.set( 'objects', lst_objs );

        return ot;
    };

    ot.set(0, makeOctree([x_l, x_r - (x_r - x_l)/2, y_t - (y_t - y_b)/2, y_b, z_f, z_b - (z_b - z_f)/2], object_dict, depth-1));
    ot.set(1, makeOctree([x_r - (x_r - x_l)/2, x_r, y_t - (y_t - y_b)/2, y_b, z_f, z_b - (z_b - z_f)/2], object_dict, depth-1));
    ot.set(2, makeOctree([x_l, x_r - (x_r - x_l)/2, y_t, y_t - (y_t - y_b)/2, z_f, z_b - (z_b - z_f)/2], object_dict, depth-1));
    ot.set(3, makeOctree([x_r - (x_r - x_l)/2, x_r, y_t, y_t - (y_t - y_b)/2, z_f, z_b - (z_b - z_f)/2], object_dict, depth-1));
    ot.set(4, makeOctree([x_l, x_r - (x_r - x_l)/2, y_t - (y_t - y_b)/2, y_b, z_b - (z_b - z_f)/2, z_b], object_dict, depth-1));
    ot.set(5, makeOctree([x_r - (x_r - x_l)/2, x_r, y_t - (y_t - y_b)/2, y_b, z_b - (z_b - z_f)/2, z_b], object_dict, depth-1));
    ot.set(6, makeOctree([x_l, x_r - (x_r - x_l)/2, y_t, y_t - (y_t - y_b)/2, z_b - (z_b - z_f)/2, z_b], object_dict, depth-1));
    ot.set(7, makeOctree([x_r - (x_r - x_l)/2, x_r, y_t, y_t - (y_t - y_b)/2, z_b - (z_b - z_f)/2, z_b], object_dict, depth-1));

    return ot;
}

function isIntersecting( pos, bounds, threshold ) {
    const camera_x = pos.x;
    const camera_y = pos.y;
    const camera_z = pos.z;

    const [x_l, x_r, y_t, y_b, z_f, z_b] = bounds;

    let closest_x = Math.max(x_l, Math.min(camera_x, x_r));
    let closest_y = Math.max(y_b, Math.min(camera_y, y_t));
    let closest_z = Math.max(z_f, Math.min(camera_z, z_b));

    const curr_distance = (closest_x - camera_x)**2 + (closest_y - camera_y)**2 + (closest_z - camera_z)**2;

    return (curr_distance <= threshold**2);
}

function octreeSearch( ot, camera_pos, radius, objects_lst, depth ) {
    if (depth === 0) {
        if (ot.get("objects").size > 0){
            objects_lst.push( ot.get("objects") );
            
            return;
        };
        return;
    };

    if ( isIntersecting( camera_pos, ot.get("bounds"), radius )) {
        for ( let i = 0; i < 8; i++ ) {
            console.log(ot);

            if ( ot.has(i) ) {

                octreeSearch( ot.get(i), camera_pos, radius, objects_lst, depth-1);

            };
            
        }
    };

    return objects_lst;
}

const count = 10;
const object_dictionary = new Map();

let ot = null

const loader = new GLTFLoader().setPath('/public/models/');
loader.load('human-foot.glb', (gltf) => {

    const geometry = gltf.scene.children[0].geometry;
    const material = new THREE.MeshBasicMaterial();
    const obj = new THREE.Mesh( geometry, material )

    // const bounding_max = gltf.scene.children[0].geometry.boundingBox.max;
    // const bounding_min = gltf.scene.children[0].geometry.boundingBox.min;

    for ( let i = 0; i < count; i++ ){

        const foot = obj.clone();

        const position = new THREE.Vector3(
            Math.round( Math.random() * ot_dimensions ),
            Math.round( Math.random() * ot_dimensions ),
            Math.round( Math.random() * ot_dimensions )
        );
        
        foot.position.copy( position );

        // let x_l = bounding_min.x;
        // let y_b = bounding_min.y;
        // let z_f = bounding_min.z;
        // let x_r = bounding_max.x;
        // let y_t = bounding_max.y;
        // let z_b = bounding_max.z;
        
        object_dictionary.set( i, position ); // [ x_l, x_r, y_t, y_b, z_f, z_b ]

        scene.add( foot );
        ot = makeOctree( [ 0, ot_dimensions, ot_dimensions, 0, 0, ot_dimensions ], object_dictionary, max_depth );
        let near_objects = [];
        const results = octreeSearch( ot, camera.position, 4, near_objects, max_depth);
        console.log( results );
    };  
    // console.log( ot );
});


// console.log(object_dictionary);

function animate() {
    controls.update();
    renderer.render( scene, camera );

}
renderer.setAnimationLoop( animate );