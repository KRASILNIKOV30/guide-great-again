import {Coordinate} from 'ol/coordinate'
import VectorSource from 'ol/source/Vector'
import {Feature} from 'ol'
import {Circle, LineString, Point} from 'ol/geom'
import {areBiomsEquals, Biom, getBiomSpeed,} from '../core/remap'
import {forEachReverse} from '../core/forEachReverse'


const BETWEEN_POINTS = 20
const DRAWING_ENABLED = false
const SPREAD_ANGLE = Math.PI / 2
const DEFAULT_SPEED = 10
const POINTS_NUMBER = 5
const START_RADIUS = 20

class Source {
    circle: Circle
    destination: Point
    parent?: Source
    parentCenter?: Coordinate
    vectorSource: VectorSource
    getBiom: (point: Coordinate) => Biom
    onAnotherBiomReached: (point: Coordinate, source: Source) => void
    onFinish: () => void
    points: Feature<Point>[] = []
    biom: Biom
    speed: number
    parentBiom: Biom | null
    initial = false
    extremePointsNumber = 0

    constructor(
        vectorSource: VectorSource,
        center: Coordinate,
        destination: Coordinate,
        getBiom: (point: Coordinate) => Uint8ClampedArray,
        onAnotherBiomReached: (point: Coordinate, source: Source) => void,
        onFinish: () => void,
        parentCenter?: Coordinate,
        parent?: Source
    ) {
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
        this.speed = getBiomSpeed(this.biom) ?? DEFAULT_SPEED
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

    getPointsNumber = () => Math.floor(this.getCircumference() / BETWEEN_POINTS)

    deleteAll = () => {
        this.points.forEach(point => this.vectorSource.removeFeature(point))
        this.points.splice(0, this.points.length)
    }

    buildPoints() {
        this.deleteAll()

        const pointsNumber = this.getPointsNumber()

        const [start, end] = this.parentCenter
            ? getAngleToSpread(this.parentCenter, this.circle.getCenter())
            : [0, 2 * Math.PI]

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

    shouldIncreasePointsNumber = () => {
        return this.getCircumference() / this.points.length > 2 * BETWEEN_POINTS
    }

    increase() {
        if (!this.points.length) {
            return
        }

        /*if (this.shouldIncreasePointsNumber()) {
            this.points.forEach(point => {
                const newPoint = new Feature(new Point(nextPoint(
                    this.circle.getRadius(),
                    this.circle.getCenter(),
                    point.getGeometry()!.getCoordinates(),
                )))
                this.points.push(newPoint)
                if (DRAWING_ENABLED) {
                    this.drawPoint(newPoint)
                }
            })
        }*/

        this.circle.setRadius(this.circle.getRadius() + this.speed)

        this.points.forEach(point => movePoint(point.getGeometry()!, this.circle.getCenter(), this.speed))
        /*if (this.shouldCheckBounds()) {
            this.checkBounds()
        }*/

        forEachReverse(this.points, (pointFeature, i, points) => {
            const point = pointFeature.getGeometry()!
            if (this.isDestinationReached()) {
                this.onFinish()
                this.drawRoute(this.destination)
            }
            const coords = point.getCoordinates()
            const biom = this.getBiom(coords)
            if (this.isAnotherBiomReached(biom)) {
                if (!this.isPointReached(point) && getBiomSpeed(biom) !== 0) {
                    this.onAnotherBiomReached(coords, this)
                }
                this.points.splice(i, 1)
            }
        })
    }

    isAnotherBiomReached = (biom: Biom) => biom && getBiomSpeed(biom) !== null && !areBiomsEquals(biom, this.biom)

    shouldCheckBounds = () => !!this.parentCenter && this.getCircumference() > BETWEEN_POINTS * 4

    getCircumference = () => 2 * Math.PI * this.circle.getRadius()

    checkBounds() {
        this.checkExtremePoint(true)
        this.checkExtremePoint(false)
    }

    checkExtremePoint(first: boolean) {
        const point = this.getExtremePoint(first)
        const neighbour = this.getNeighbour(first)

        if (!point || !neighbour) {
            return
        }

        if (this.isInParentBiom(point)) {
            if (this.isInParentBiom(neighbour)) {
                this.removeExtremePoint(first)
            }
            return;
        }

        if (this.extremePointsNumber < POINTS_NUMBER) {
            this.createExtremePoint(first)
        }
    }

    createExtremePoint(first: boolean) {
        ++this.extremePointsNumber
        const newPoint = this.createNeighbour(first)
        if (DRAWING_ENABLED) {
            this.drawPoint(newPoint)
        }
        this.addExtremePoint(newPoint, first)
        this.checkExtremePoint(first)
    }

    getLastPoint = () => this.points[this.points.length - 1].getGeometry()!
    getFirstPoint = () => this.points[0].getGeometry()!

    removeExtremePoint = (first: boolean) => first
        ? this.points.shift()
        : this.points.pop()

    addExtremePoint = (point: Feature<Point>, first: boolean) => first
        ? this.points.unshift(point)
        : this.points.push(point)

    getExtremePoint = (first: boolean) => first
        ? this.getFirstPoint()
        : this.getLastPoint()

    isPointReached(point: Point): boolean {
        return this.vectorSource.getFeaturesAtCoordinate(point.getCoordinates()).length > 1
    }

    createNeighbour = (first: boolean) => new Feature(new Point(first
        ? prevPoint(this.circle.getRadius(), this.circle.getCenter(), this.getFirstPoint().getCoordinates())
        : nextPoint(this.circle.getRadius(), this.circle.getCenter(), this.getLastPoint().getCoordinates())
    ))

    getNeighbour = (first: boolean) => first
        ? this.points[1].getGeometry()!
        : this.points[this.points.length - 2].getGeometry()!

    isInParentBiom = (point: Point) => this.parentBiom && this.isInBiom(point, this.parentBiom)

    isInBiom = (point: Point, biom: Biom) => (
        areBiomsEquals(this.getBiom(point.getCoordinates()), biom)
    )

    isDestinationReached = () => this.isPointReached(this.destination)

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
