export function isIntersecting(pos, bounds, radius) {
    const [px, py, pz] = pos;
    const [xl, xr, yt, yb, zf, zb] = bounds;

    const dx = Math.max(xl - px, 0, px - xr);
    const dy = Math.max(yb - py, 0, py - yt);
    const dz = Math.max(zf - pz, 0, pz - zb);

    return (dx * dx + dy * dy + dz * dz) < (radius * radius);
}