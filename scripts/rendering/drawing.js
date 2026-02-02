import * as THREE from 'three';
import { isIntersecting } from '../utils/intersection.js';

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitEdges = new THREE.EdgesGeometry(unitBox);

export class OctreeVisualizer {
    constructor(colorMap) {
        this.group = new THREE.Group();
        this.materials = Object.keys(colorMap).reduce((acc, level) => {
            acc[level] = new THREE.LineBasicMaterial({ color: colorMap[level] });
            return acc;
        }, {});
    }

    update(pos, node, threshold) {
        this.clear();
        this._drawRecursive(pos, node, threshold, 0);
    }

    clear() {
        while (this.group.children.length > 0) {
            const child = this.group.children[0];
            this.group.remove(child);
        }
    }

    _drawRecursive(pos, node, threshold, level) {
        if (!node || !isIntersecting(pos, node.bounds, threshold)) return;

        const [xl, xr, yt, yb, zf, zb] = node.bounds;
        const w = xr - xl, h = yt - yb, d = zb - zf;

        const line = new THREE.LineSegments(unitEdges, this.materials[level]);
        line.scale.set(w, h, d);
        line.position.set(xl + w/2, yb + h/2, zf + d/2);
        this.group.add(line);

        for (const child of node.children) {
            this._drawRecursive(pos, child, threshold, level + 1);
        }
    }
}