import {Coordinate} from 'ol/coordinate';
import VectorSource from 'ol/source/Vector';
import {Feature} from 'ol';
import {Circle, Point} from 'ol/geom';
import {colors, remapColorToSpeed} from "../core/remap";

const BETWEEN_POINTS = 50
const RADIUS_INCREASE = 10
const DRAWING_ENABLED = true
const SPREAD_ANGLE = Math.PI / 3

type SourceProps = {
    vectorSource: VectorSource,
    center: Coordinate,
    getData: (point: Coordinate) => Uint8ClampedArray,
    onAnotherBiomReached: (point: Coordinate) => void,
    parentCenter?: Coordinate
}

const Source = {
    create: (props: SourceProps) => {
        const {
            vectorSource,
            center,
            getData,
            onAnotherBiomReached,
            parentCenter
        } = props
        const circle = createCircle(vectorSource, center)

        return () => {
            vectorSource.clear()
            increaseCircle(vectorSource, circle, getData, onAnotherBiomReached, parentCenter)
        }
    }
}

const createCircle = (vectorSource: VectorSource, center: Coordinate) => {
    const feature = new Feature({
        geometry: new Circle(center, 0)
    })

    return feature.getGeometry()!
}

const increaseCircle = (
    vectorSource: VectorSource,
    circle: Circle,
    getData: (point: Coordinate) => Uint8ClampedArray,
    onAnotherBiomReached: (point: Coordinate) => void,
    parentCenter?: Coordinate,
) => {
    addCircle(vectorSource, increase(circle), parentCenter).forEach(point => {
        const centerSpeed = remapColorToSpeed(getData(circle.getCenter())) ?? colors.scrub
        const speed = remapColorToSpeed(getData(point))
        if (speed !== null && centerSpeed !== speed) {
            onAnotherBiomReached(point)
        }
    })
}

const increase = (circle: Circle) => {
    circle.setRadius(circle.getRadius() + RADIUS_INCREASE)
    return circle
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

const addPoints = (vectorSource: VectorSource, circle: Circle, parentCenter?: Coordinate) => {
    const pointsNumber = getPointsNumber(circle.getRadius(), !parentCenter)

    const [start, end] = parentCenter
        ? getAngleToSpread(parentCenter, circle.getCenter())
        : [0, 2 * Math.PI]

    const points = Array.from(Array(pointsNumber).keys()).map(i => (
        getPoint(circle.getCenter(), circle.getRadius(), getAngle(start, end, i, pointsNumber))
    ))
    if (DRAWING_ENABLED) {
        points.forEach(point => {
            vectorSource.addFeature(new Feature({
                geometry: new Point(point),
                circle,
            }))
        })
    }

    return points
}

const getPoint = ([x, y]: Coordinate, radius: number, angle: number): Coordinate => (
    [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]
)

const getPointsNumber = (radius: number, full: boolean) => Math.floor(
    2 * (full ? Math.PI : SPREAD_ANGLE) * radius / BETWEEN_POINTS
)

const addCircle = (vectorSource: VectorSource, circle: Circle, parentCenter?: Coordinate) => {
    const feature = new Feature({
        geometry: circle
    })
    vectorSource.addFeature(feature)

    return addPoints(vectorSource, feature.getGeometry()!, parentCenter)
}

export {
    Source,
}