class Biom extends Uint8ClampedArray {
}

const bioms = {
    scrub: new Biom([200, 215, 171, 255]),
    wood: new Biom([173, 209, 158, 255]),
    sand: new Biom([245, 233, 198, 255]),
    water: new Biom([170, 211, 223, 255]),
}

const areBiomsEquals = (left: Biom, right: Biom) => (
    left[0] === right[0] && left[1] === right[1] && left[2] === right[2] && left[3] === right[3]
)

const remapBiomToSpeed = (color: Biom) => {
    if (!color) {
        return null
    }

    if (areBiomsEquals(color, bioms.scrub)) {
        return 4
    }
    if (areBiomsEquals(color, bioms.wood)) {
        return 3
    }
    if (areBiomsEquals(color, bioms.sand)) {
        return 3
    }
    if (areBiomsEquals(color, bioms.water)) {
        return 1
    }

    return null
}

export {
    remapBiomToSpeed,
    bioms,
    Biom,
    areBiomsEquals
}