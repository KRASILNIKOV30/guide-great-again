import {Coordinate} from 'ol/coordinate';
import VectorSource from 'ol/source/Vector';
import {Feature} from 'ol';
import {Circle, Point} from 'ol/geom';
import {areBiomsEquals, Biom, remapBiomToSpeed} from "../core/remap";
import {forEachReverse} from "../core/forEachReverse";

const BETWEEN_POINTS = 10
const DRAWING_ENABLED = true
const SPREAD_ANGLE = Math.PI / 3
const DEFAULT_SPEED = 10

class Source {
    circle: Circle
    parentCenter?: Coordinate
    vectorSource: VectorSource
    getData: (point: Coordinate) => Biom
    onAnotherBiomReached: (point: Coordinate) => void
    points: Point[] = []
    biom: Biom;
    speed: number
    parentBiom: Biom | null;

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
        this.speed = remapBiomToSpeed(this.biom) ?? DEFAULT_SPEED
        this.parentBiom = parentCenter ? getData(parentCenter) : null
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
            const point = new Point(getPoint(this.circle.getCenter(), this.circle.getRadius() + 1, getAngle(start, end, i, pointsNumber)))
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
        this.circle.setRadius(this.circle.getRadius() + this.speed)
        this.points.forEach(point => movePoint(point, this.circle.getCenter(), this.speed))
        if (this.parentCenter) {
            this.checkBounds()
        }

        forEachReverse(this.points, (point, i, points) => {
            const coords = point.getCoordinates()
            const biom = this.getData(coords)
            if (remapBiomToSpeed(biom) !== null && !areBiomsEquals(this.getData(coords), this.biom)) {
                if (!this.isPointReached(point)) {
                    this.onAnotherBiomReached(coords)
                }
                points.splice(i, 1)
            }
        })
    }

    checkBounds() {
        this.checkPoint(this.points[0], false)
        this.checkPoint(this.points[this.points.length - 1], true)
    }

    remove(last: boolean) {
        if (last) {
            this.points.pop()
        } else {
            this.points.shift()
        }
    }

    add(point: Point, last: boolean) {
        if (last) {
            this.points.push(point)
        } else {
            this.points.unshift(point)
        }
    }

    checkPoint(point: Point, last: boolean) {
        if (!areBiomsEquals(this.getData(point.getCoordinates()), this.biom)) {
            this.remove(last)
            return
        }

        const neighbour = last
            ? nextPoint(this.circle.getRadius(), this.circle.getCenter(), point.getCoordinates())
            : prevPoint(this.circle.getRadius(), this.circle.getCenter(), point.getCoordinates())

        const newPoint = new Point(neighbour)
        this.add(newPoint, last)
        this.checkPoint(newPoint, last)
    }

    isPointReached(point: Point): boolean {
        return this.vectorSource.getFeaturesAtCoordinate(point.getCoordinates()).length > 1
    }
}

const movePoint = (point: Point, center: Coordinate, speed: number) => {
    const [x, y] = point.getCoordinates()
    const angle = Math.atan2(y - center[1], x - center[0]) + 2 * Math.PI
    point.setCoordinates([x + speed * Math.cos(angle), y + speed * Math.sin(angle)])
}

const getAngleToSpread = (parent: Coordinate, current: Coordinate) => {
    const angle = calcAngle(parent, current)

    return [
        angle - SPREAD_ANGLE,
        angle + SPREAD_ANGLE,
    ]
}

const getAngle = (start: number, end: number, i: number, n: number) => (
    start + (end - start) * i / n
)

const calcAngle = ([x1, y1]: Coordinate, [x2, y2]: Coordinate) => (
    Math.atan2(y2 - y1, x2 - x1) + 2 * Math.PI
)

const getPoint = ([x, y]: Coordinate, radius: number, angle: number): Coordinate => (
    [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]
)

const nextPoint = (radius: number, center: Coordinate, point: Coordinate) => (
    getPoint(center, radius, calcAngle(center, point) + BETWEEN_POINTS / radius)
)

const prevPoint = (radius: number, center: Coordinate, point: Coordinate) => (
    getPoint(center, radius, calcAngle(center, point) - BETWEEN_POINTS / radius)
)

/*const getPointsNumber = (radius: number, full?: boolean) => Math.floor(
    2 * Math.PI * radius / BETWEEN_POINTS
)*/

export {
    Source,
}