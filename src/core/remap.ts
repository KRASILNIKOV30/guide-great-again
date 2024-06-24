class Biom extends Uint8ClampedArray {
}

const bioms: Record<string, [Biom, number]> = {
    scrub: [new Biom([200, 215, 171, 255]), 7],
    forest: [new Biom([173, 209, 158, 255]), 5],
    sand: [new Biom([245, 233, 198, 255]), 10],
    water: [new Biom([170, 211, 223, 255]), 0],
    meadow: [new Biom([242, 239, 233, 255]), 15],
    grass: [new Biom([205, 235, 176, 255]), 12],
    road: [new Biom([249, 178, 156, 255]), 20],
    town: [new Biom([224, 223, 223, 255]), 20],
    closedTown: [new Biom([245, 220, 186, 255]), 20],
    farmLand: [new Biom([238, 240, 213, 255]), 15],
    closetForest: [new Biom([200, 250, 204, 255]), 5],
    deposit: [new Biom([197, 195, 195, 255]), 0],
    building: [new Biom([217, 208, 201, 255]), 0],
    garden: [new Biom([201, 225, 191, 255]), 12],
    townRoad: [new Biom([255, 255, 255, 255]), 20],
    buildingComplex: [new Biom([226, 203, 222, 255]), 0],
    goodRoad: [new Biom([252, 214, 164, 255]), 20],
    middleRoad: [new Biom([247, 250, 191, 255]), 20],
}

const areBiomsEquals = (left: Biom, right: Biom) => (
    left[0] === right[0] && left[1] === right[1] && left[2] === right[2] && left[3] === right[3]
)

const getBiomSpeed = (value: Biom) => {
    for (const [biom, speed] of Object.values(bioms)) {
        if (areBiomsEquals(value, biom)) {
            return speed
        }
    }
    return null
}

const setBiomSpeed = (biom: string, speed: number) => (
    bioms[biom][1] = speed
)

export {
    getBiomSpeed,
    bioms,
    Biom,
    areBiomsEquals,
    setBiomSpeed
}
