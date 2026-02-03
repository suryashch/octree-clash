export function makeOctree(bounds, depth) {
    const node = {
        bounds,
        children: null
    };

    if (depth === 0) return node;

    const [x_l, x_r, y_t, y_b, z_f, z_b] = bounds;
    const midX = (x_l + x_r) / 2;
    const midY = (y_t + y_b) / 2;
    const midZ = (z_f + z_b) / 2;

    node.children = [];

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