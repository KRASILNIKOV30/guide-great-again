import {Coordinate} from 'ol/coordinate';
import VectorSource from 'ol/source/Vector';
import {Feature} from 'ol';
import {Circle, Point} from 'ol/geom';
import {areBiomsEquals, Biom, remapColorToSpeed} from "../core/remap";
import {forEachReverse} from "../core/forEachReverse";

const BETWEEN_POINTS = 50
const RADIUS_INCREASE = 1
const DRAWING_ENABLED = true
const SPREAD_ANGLE = Math.PI / 3

class Source {
    circle: Circle
    parentCenter?: Coordinate
    vectorSource: VectorSource
    getData: (point: Coordinate) => Uint8ClampedArray
    onAnotherBiomReached: (point: Coordinate) => void
    points: Point[] = []
    biom: Biom;

    constructor(
        vectorSource: VectorSource,
        center: Coordinate,
        getData: (point: Coordinate) => Uint8ClampedArray,
        onAnotherBiomReached: (point: Coordinate) => void,
        parentCenter?: Coordinate
    ) {
        this.getData = getData
        this.parentCenter = parentCenter
        this.vectorSource = vectorSource
        this.onAnotherBiomReached = onAnotherBiomReached
        this.circle = this.createCircle(center)
        this.points = this.addPoints()
        this.biom = this.getData(this.circle.getCenter())
    }

    createCircle(center: Coordinate) {
        const feature = new Feature({
            geometry: new Circle(center, 1)
        })

        this.vectorSource.addFeature(feature)

        return feature.getGeometry()!
    }

    addPoints() {
        const pointsNumber = !!this.parentCenter ? 5 : 10

        const [start, end] = this.parentCenter
            ? getAngleToSpread(this.parentCenter, this.circle.getCenter())
            : [0, 2 * Math.PI]

        return Array.from(Array(pointsNumber).keys()).map(i => {
            const point = new Point(getPoint(this.circle.getCenter(), this.circle.getRadius(), getAngle(start, end, i, pointsNumber)))
            if (DRAWING_ENABLED) {
                this.vectorSource.addFeature(
                    new Feature({
                        geometry: point
                    })
                )
            }
            return point
        })
    }

    increase() {
        this.circle.setRadius(this.circle.getRadius() + RADIUS_INCREASE)

        forEachReverse(this.points, (point, i, points) => {
            movePoint(point, this.circle.getCenter(), RADIUS_INCREASE)
            const coords = point.getCoordinates()
            const biom = this.getData(coords)
            if (remapColorToSpeed(biom) !== null && !areBiomsEquals(this.getData(coords), this.biom)) {
                this.onAnotherBiomReached(coords)
                points.splice(i, 1)
            }
        })
    }
}

const movePoint = (point: Point, center: Coordinate, speed: number) => {
    const [x, y] = point.getCoordinates()
    const angle = Math.atan2(y - center[1], x - center[0]) + 2 * Math.PI
    point.setCoordinates([x + speed * Math.cos(angle), y + speed * Math.sin(angle)])
}

const getAngleToSpread = (parent: Coordinate, current: Coordinate) => {
    const angle = Math.atan2(current[1] - parent[1], current[0] - parent[0]) + 2 * Math.PI

    return [
        angle - SPREAD_ANGLE,
        angle + SPREAD_ANGLE,
    ]
}

const getAngle = (start: number, end: number, i: number, n: number) => {
    return start + (end - start) * i / n
}

const getPoint = ([x, y]: Coordinate, radius: number, angle: number): Coordinate => (
    [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]
)

/*const getPointsNumber = (radius: number, full: boolean) => Math.floor(
    2 * (full ? Math.PI : SPREAD_ANGLE) * radius / BETWEEN_POINTS
)*/

export {
    Source,
}