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

const getBiomSpeed = (biom: Biom) => {
    if (!biom) {
        return null
    }

    if (areBiomsEquals(biom, bioms.scrub)) {
        return 7
    }
    if (areBiomsEquals(biom, bioms.wood)) {
        return 5
    }
    if (areBiomsEquals(biom, bioms.sand)) {
        return 10
    }
    if (areBiomsEquals(biom, bioms.water)) {
        return 0
    }

    return null
}

export {
    getBiomSpeed,
    bioms,
    Biom,
    areBiomsEquals
}
