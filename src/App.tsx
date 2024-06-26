import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react'
import './styles.css'
import 'ol/ol.css'
import olMap from 'ol/Map'
import {map} from './components/map'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from "ol/source/Vector";
import {Source} from "./components/source";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import {Coordinate} from "ol/coordinate";
import {LineString, Point} from "ol/geom";
import {getUid} from 'ol/util';
import {getLength} from "ol/sphere";
import {Sidebar} from "./components/sidebar/Sidebar";
import {setBiomSpeed} from "./core/remap";
import {Feature, MapBrowserEvent} from "ol";

export function useMap(): olMap {
    const mapRef = useRef<olMap>()
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
    const sources = new Map<string, Source>([])
    const [destination, setDestination] = useState<Coordinate | null>(null)
    const onFinish = () => {
        sources.clear()
    }

    const createSource = useCallback((distance: number, center: Coordinate, parentCenter?: Coordinate, parent?: Source) => {
        return new Source(
            distance,
            vectorSource,
            center,
            destination!,
            (point: Coordinate) => {
                return osm.getData(map.getPixelFromCoordinate(point)) as Uint8ClampedArray
            },
            (distance: number, point: Coordinate, source: Source) => {
                sources.delete(getUid(source))
                const newSource = createSource(distance, point, center, source)
                sources.set(getUid(newSource), newSource)
            },
            onFinish,
            parentCenter,
            parent,
        )
    }, [destination])

    const onClick = useCallback((e: MapBrowserEvent<any>) => {
        if (!destination) {
            setDestination([...e.coordinate])
            vectorSource.addFeature(new Feature(new Point(e.coordinate)))
        }
        else {
            const distance = getLength(new LineString([destination, e.coordinate]))
            const newSource = createSource(distance, e.coordinate)
            sources.set(getUid(newSource), newSource)
            for (let i = 0; i < 10000; i++) {
                setTimeout(async () => {
                    for (const [, source] of sources) {
                        await source.increase();
                    }
                }, i)
            }
        }
    }, [destination])

    useEffect(() => {
        map.on('click', onClick)

        return () => {
            map.un('click', onClick)
        }
    }, [onClick]);


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
            <Sidebar
                onWaterChange={(n) => {setBiomSpeed('water', n)}}
                onForestChange={(n) => {setBiomSpeed('forest', n)}}
                onScrubChange={(n) => {setBiomSpeed('scrub', n)}}
                onSandChange={(n) => {setBiomSpeed('sand', n)}}
            />
        </div>
    )
}

export {
    App
}
