/**
 * Initializes UI listeners for the Octree visualization.
 * @param {Array} meshPos - Reference to the [x, y, z] position array.
 * @param {Object} state - Object containing 'radius' and other mutable state.
 * @param {Function} onUpdate - Callback function to trigger a re-render/update.
 */
export function initControls(meshPos, state, onUpdate) {
    const sliders = {
        x: { 
            input: document.getElementById('x-slider'), 
            val: document.getElementById('x-value'), 
            idx: 0 
        },
        y: { 
            input: document.getElementById('y-slider'), 
            val: document.getElementById('y-value'), 
            idx: 2 // Mapping Y slider to Z coordinate based on your original code
        },
        z: { 
            input: document.getElementById('z-slider'), 
            val: document.getElementById('z-value'), 
            idx: 1 // Mapping Z slider to Y coordinate based on your original code
        },
        r: { 
            input: document.getElementById('r-slider'), 
            val: document.getElementById('r-value') 
        }
    };

    // Position Sliders (X, Y, Z)
    ['x', 'y', 'z'].forEach(axis => {
        const { input, val, idx } = sliders[axis];
        if (!input) return;

        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            meshPos[idx] = value;
            if (val) val.textContent = value.toFixed(1);
            onUpdate();
        });
    });

    // Radius Slider
    if (sliders.r.input) {
        sliders.r.input.addEventListener('input', (e) => {
            state.radius = parseFloat(e.target.value);
            if (sliders.r.val) sliders.r.val.textContent = state.radius;
            onUpdate();
        });
    }
}
