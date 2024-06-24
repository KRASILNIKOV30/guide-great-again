import {Coordinate} from 'ol/coordinate'
import VectorSource from 'ol/source/Vector'
import {Feature} from 'ol'
import {Circle, LineString, Point} from 'ol/geom'
import {areBiomsEquals, Biom, getBiomSpeed,} from '../core/remap'
import {forEachCount, forEachReverse} from '../core/forEachReverse'
import {getLength} from "ol/sphere";

const DEFAULT_SPEED = 5
const DRAWING_ENABLED = true
const SPREAD_ANGLE = Math.PI / 3
const POINTS_NUMBER = 5
const START_RADIUS = 0

class Source {
    distance: number
    coef: number
    circle: Circle
    destination: Point
    parent?: Source
    parentCenter?: Coordinate
    vectorSource: VectorSource
    getBiom: (point: Coordinate) => Biom
    onAnotherBiomReached: (distance: number, point: Coordinate, source: Source) => void
    onFinish: () => void
    points: Feature<Point>[] = []
    biom: Biom
    speed: number
    parentBiom: Biom | null
    initial = false
    increasesNumber = 0

    constructor(
        distance: number,
        vectorSource: VectorSource,
        center: Coordinate,
        destination: Coordinate,
        getBiom: (point: Coordinate) => Uint8ClampedArray,
        onAnotherBiomReached: (distance: number, point: Coordinate, source: Source) => void,
        onFinish: () => void,
        parentCenter?: Coordinate,
        parent?: Source
    ) {
        this.distance = distance
        this.coef = distance / 200
        this.getBiom = getBiom
        this.parent = parent
        this.parentCenter = parentCenter
        this.vectorSource = vectorSource
        this.onAnotherBiomReached = onAnotherBiomReached
        this.onFinish = onFinish
        this.circle = this.createCircle(center)
        this.destination = new Point(destination)
        this.points = this.buildPoints()
        this.biom = this.getBiom(this.circle.getCenter())
        this.speed = getBiomSpeed(this.biom) || DEFAULT_SPEED * this.coef
        this.parentBiom = parentCenter ? getBiom(parentCenter) : null
        this.initial = !parentCenter
    }

    createCircle(center: Coordinate) {
        const feature = new Feature({
            geometry: new Circle(center, START_RADIUS)
        })

        this.vectorSource.addFeature(feature)

        return feature.getGeometry()!
    }

    deleteAll = () => {
        this.points.forEach(point => this.vectorSource.removeFeature(point))
        this.points.splice(0, this.points.length)
    }

    buildPoints() {
        const pointsNumber = !this.parentCenter ? 2 * POINTS_NUMBER : POINTS_NUMBER

        const [start, end] = this.parentCenter
            ? getAngleToSpread(this.parentCenter, this.circle.getCenter())
            : getAngleToSpread(this.circle.getCenter(), this.destination.getCoordinates())

        return Array.from(Array(pointsNumber).keys()).map(i => {
            const point = new Feature(new Point(getPoint(
                this.circle.getCenter(),
                this.circle.getRadius() + 1,
                getAngle(start, end, i, pointsNumber),
            )))
            if (DRAWING_ENABLED) {
                this.drawPoint(point)
            }

            return point
        })
    }

    drawPoint(point: Feature<Point>) {
        this.vectorSource.addFeature(point)
    }

    increase = () => new Promise((resolve) => {
        this.increasesNumber++

        if (!this.points.length) {
            resolve(undefined)
            return
        }

        this.circle.setRadius(this.circle.getRadius() + this.speed)

        this.points.forEach(point => movePoint(point.getGeometry()!, this.circle.getCenter(), this.speed))

        if (this.increasesNumber < 3) {
            resolve(undefined)
            return
        }

        forEachReverse(this.points, (pointFeature, i) => {
            const point = pointFeature.getGeometry()!
            if (this.isDestinationReached()) {
                this.onFinish()
                this.vectorSource.clear()
                this.drawRoute(this.destination)
                this.deleteAll()
                return false
            }
            const coords = point.getCoordinates()
            const biom = this.getBiom(coords)
            if (this.isAnotherBiomReached(biom)) {
                if (!this.isPointReached(point) && getBiomSpeed(biom) !== 0) {
                    this.onAnotherBiomReached(this.distance, coords, this)
                }
                this.points.splice(i, 1)
                this.anotherBiomReached()
                return false
            }
            return true
        })
        resolve(undefined)
    })

    anotherBiomReached = () => {
        forEachCount(this.points, 4, pointFeature => {
            const point = pointFeature.getGeometry()!
            const coords = point.getCoordinates()
            const biom = this.getBiom(coords)

            if (!this.isPointReached(point) && biom && getBiomSpeed(biom) !== 0) {
                this.onAnotherBiomReached(this.distance, coords, this)
            }
        })
        this.deleteAll()
    }

    isAnotherBiomReached = (biom: Biom) =>
        biom
        && this.biom
        && getBiomSpeed(biom) !== null
        && !areBiomsEquals(biom, this.biom)

    isPointReached(point: Point): boolean {
        return this.vectorSource.getFeaturesAtCoordinate(point.getCoordinates()).length > 1
    }

    isDestinationReached = () => {
        const destination = this.destination.getCoordinates()
        const distFromCenter = getLength(new LineString([this.circle.getCenter(), destination]))
        if (distFromCenter > this.circle.getRadius() * 1.05) {
            return false
        }
        const closestPoint = this.vectorSource.getClosestFeatureToCoordinate(this.destination.getCoordinates(), feature => (
            feature.getGeometry() instanceof Point && this.points.includes(feature as Feature<Point>)
        )) as Feature<Point>
        if (!closestPoint?.getGeometry()) {
            return false
        }
        const length = getLength(new LineString([this.destination.getCoordinates(), closestPoint.getGeometry()!.getCoordinates()]))

        return length < 10 * this.coef
    }

    drawRoute = (point: Point) => {
        const center = this.circle.getCenter()
        const line = new LineString([
            point.getCoordinates(),
            center,
        ])
        this.vectorSource.addFeature(new Feature(line))
        if (this.parent) {
            this.parent.drawRoute(new Point(center))
        }
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

export {
    Source,
}
