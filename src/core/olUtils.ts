import type {Coordinate} from 'ol/coordinate'
import * as olProj from 'ol/proj'
import {Extent} from "ol/extent";

function toGeo(coords: Coordinate): number[] {
    return olProj.transform(coords, "EPSG:3857", "EPSG:4326")
}

function toBBox(extent: Extent): string {
    const [minX, minY] = toGeo([extent[0], extent[1]])
    const [maxX, maxY] = toGeo([extent[2], extent[3]])

    return `${minX},${minY},${maxX},${maxY}`
}

export {
    toGeo,
    toBBox,
}