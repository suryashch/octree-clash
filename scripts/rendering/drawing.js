import * as THREE from 'three';
import { isIntersecting } from '../utils/intersection.js';

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitEdges = new THREE.EdgesGeometry(unitBox);
const box_material = new THREE.LineBasicMaterial({
    color: '#8f8c8c'
});
const line = new THREE.LineSegments(unitEdges, box_material);

const mesh = new THREE.InstancedMesh(line, box_material, 100)

let index_ctr = 0

export function drawCube(bounds, line_color) {
    const [xl, xr, yt, yb, zf, zb] = bounds;
    const w = xr - xl, h = yt - yb, d = zb - zf;

    const position = new THREE.Vector3(xl + w/2, yb + h/2, zf + d/2);
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3(w, h, d);

    const trans_matrix = new THREE.Matrix4;
    trans_matrix.compose(position, rotation, scale);

    mesh.setMatrixAt(index_ctr, trans_matrix);
    mesh.setColorAt(index_ctr, new THREE.Color(line_color));

    mesh.instanceMatrix.needsUpdate = true 
    
    index_ctr++;

    return mesh
}

export class OctreeVisualizer {
    constructor(colorMap) {
        this.group = new THREE.Group();

        this.materials = colorMap;
    }

    update(pos, node, threshold) {
        this.final_bounds = [];
        this.clear();
        this._drawRecursive(pos, node, threshold, 0);
        return this.final_bounds;
    }

    clear() {
        while (this.group.children.length > 0) {
            const child = this.group.children[0];
            this.group.remove(child);
        }
        index_ctr = 0;
    }

    _drawRecursive(pos, node, threshold, level) {
        if (!node || !isIntersecting(pos, node.bounds, threshold)) return;

        this.group.add(drawCube(node.bounds, this.materials[level]));

        if (node.children === null){
            this.final_bounds.push(node.bounds);
            return
        }

        for (const child of node.children) {
            this._drawRecursive(pos, child, threshold, level + 1);
        }
    }
}