import {MapBrowserEvent} from 'ol'
import {useCallback, useEffect, useState} from 'react'
import {map} from '../../components/map'
import {Circle, Point} from "ol/geom";
import type {Coordinate} from "ol/coordinate";

const useCircle = (
    circle: Circle,
    onClick: (e: MapBrowserEvent<any>) => void
): Point[] => {
    const getPoint = ([x, y]: Coordinate, radius: number, angle: number) => (
        [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]
    )

    const getCirclePoints = (circle: Circle): Coordinate[] => {
        const pointsNumber = Math.floor(circle.getRadius() / 5)

        return Array.from(Array(pointsNumber).keys()).map(i => (
            getPoint(circle.getCenter(), circle.getRadius(), 2 * Math.PI / pointsNumber * i)
        ))
    }

    const [points, setPoints] = useState<Coordinate[]>(() => getCirclePoints(circle))

    const onMapClick = useCallback((e: MapBrowserEvent<any>) => {
        const isInFeature = circle.intersectsCoordinate(e.coordinate)
        if (isInFeature) {
            onClick(e)
        }
    }, [onClick])


    useEffect(() => {
        map.on('click', onMapClick)
        const updatePoints = () => setPoints([...getCirclePoints(circle)])
        circle.on('change', updatePoints)

        return () => {
            map.un('click', onMapClick)
            circle.un('change', updatePoints)
        }
    })

    return points.map(point => new Point(point))
}

export {
    useCircle,
}