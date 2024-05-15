import type {Coordinate} from 'ol/coordinate'
import {Circle} from 'ol/geom'
import VectorLayer from "ol/layer/Vector";
import {Feature} from "ol";
import {map} from "./map";
import {memo, useEffect, useState} from 'react';
import VectorSource from 'ol/source/Vector';
import {useCircle} from '../core/hooks/useCircle';
import {OSM} from 'ol/source'
import TileLayer from 'ol/layer/Tile';

interface SourceProps {
    center: Coordinate,
}

const Source = memo((props: SourceProps) => {
    const {
        center,
    } = props

    const [circle] = useState(() => new Circle(center, 30))

    const [feature] = useState(() => new Feature({
        geometry: circle,
    }))

    const points = useCircle(feature.getGeometry()!, (e) => {
        // const data = osm.getData(e.pixel)
        circle.setRadius(circle.getRadius() + 1)
    })

    const [vectorLayer] = useState<VectorLayer<any>>(() => map.getLayers().item(1) as VectorLayer<any>)
    const [vectorSource] = useState<VectorSource>(() => (vectorLayer.getSource()))
    const [osm] = useState(() => map.getLayers().item(0) as TileLayer<OSM>)

    useEffect(() => {
        if (points) {
            points.forEach(point => {
                vectorSource.addFeature(new Feature({
                    geometry: point,
                }))
            })
        }
    }, [points])

    useEffect(() => {
        vectorSource.addFeature(feature)
    }, [])


    /*const f = async () => {
        for (let r = circle.getRadius(); r < 200; ++r) {
            circle.setRadius(r)

            const bbox = toBBox(circle.getExtent())
            const data = await fetchGetRequest(`https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`)
            console.log(data.children[0].children.length)
        }
    }

    useEffect(() => {
        f()
    }, [])*/


    //vectorLayer.setExtent(circle.getExtent())


    /*const osm = map.getLayers().item(0) as TileLayer<OSM>

    map.on('click', e => {
        const isInFeature = feature.getGeometry()?.intersectsCoordinate(e.coordinate)
        if (isInFeature) {
            const data = osm.getData(e.pixel)
            console.log(data)
        }
    })

    console.log(toBBox(circle.getExtent()))
    const bbox = toBBox(circle.getExtent())

    fetchGetRequest(`https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`)
        .then(console.log)*/

    map.on('click', e => {
        const isInFeature = feature.getGeometry()?.intersectsCoordinate(e.coordinate)
        if (isInFeature) {
            const data = osm.getData(e.pixel)
            console.log(data)
        }
    })

    return (<></>)
})

export {
    Source,
}