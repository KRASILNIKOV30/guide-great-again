const colors = {
    scrub: new Uint8ClampedArray([200, 215, 171, 255]),
    wood: new Uint8ClampedArray([173, 209, 158, 255]),
    sand: new Uint8ClampedArray([245, 233, 198, 255]),
    water: new Uint8ClampedArray([170, 211, 223, 255]),
}

const areEquals = (left: Uint8ClampedArray, right: Uint8ClampedArray) => (
    left[0] === right[0] && left[1] === right[1] && left[2] === right[2] && left[3] === right[3]
)

const remapColorToSpeed = (color: Uint8ClampedArray) => {
    if (!color) {
        return null
    }

    if (areEquals(color, colors.scrub)) {
        return 10
    }
    if (areEquals(color, colors.wood)) {
        return 5
    }
    if (areEquals(color, colors.sand)) {
        return 15
    }
    if (areEquals(color, colors.water)) {
        return 0
    }

    return null
}

export {
    remapColorToSpeed,
    colors,
}