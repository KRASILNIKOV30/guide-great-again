import React, {ReactElement, useEffect, useRef, useState} from 'react'
import './styles.css'
import 'ol/ol.css'
import Map from 'ol/Map'
import {map} from './components/map'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from "ol/source/Vector";
import {Source} from "./components/source";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import {Coordinate} from "ol/coordinate";
import {Point} from "ol/geom";
import {Feature} from "ol";

export function useMap(): Map {
    const mapRef = useRef<Map>()
    if (!mapRef.current) {
        mapRef.current = map
    }
    return mapRef.current ?? map
}

function App(): ReactElement {
    const mapRef = useRef<HTMLDivElement>(null)
    const map = useMap()
    const [vectorLayer] = useState<VectorLayer<any>>(() => map.getLayers().item(1) as VectorLayer<any>)
    const [vectorSource] = useState<VectorSource>(() => (vectorLayer.getSource()))
    const [osm] = useState(() => map.getLayers().item(0) as TileLayer<OSM>)

    const sources: Source[] = []

    const destination: Coordinate = [5304434.782384094, 7603452.257958593]
    vectorSource.addFeature(new Feature(new Point(destination)))

    const onFinish = () => sources.splice(0, sources.length)

    const createSource = (center: Coordinate, parentCenter?: Coordinate, parent?: Source) => {
        return new Source(
            vectorSource,
            center,
            destination,
            (point: Coordinate) => {
                return osm.getData(map.getPixelFromCoordinate(point)) as Uint8ClampedArray
            },
            (point: Coordinate, source: Source) => {
                sources.push(createSource(point, center, source))
            },
            onFinish,
            parentCenter,
            parent,
        )
    }

    map.on('click', e => sources.push(createSource(e.coordinate)))

    for (let i = 0; i < 10000; ++i) {
        setTimeout(() => {
            sources.forEach(source => {
                source.increase()
            })
        }, i * 100)
    }

    useEffect(() => {
        if (mapRef.current) {
            map.setTarget(mapRef.current)
            map.updateSize()
        }
    }, [map])

    return (
        <div className="App">
            <div className="map-container">
                <div id="map" ref={mapRef}></div>
            </div>
        </div>
    )
}

export {
    App
}
