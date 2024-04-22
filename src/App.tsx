import React, { ReactElement, useEffect, useRef } from 'react'
import './styles.css'
import 'ol/ol.css'
import Map from 'ol/Map'
import { map } from './map'

export function useMap (): Map {
    const mapRef = useRef<Map>()
    if (mapRef.current == null) {
        mapRef.current = map
    }
    return mapRef.current ?? map
}

function App (): ReactElement {
    const mapRef = useRef<HTMLDivElement>(null)
    const map = useMap()

    useEffect(() => {
        if (mapRef.current != null) {
            map.setTarget(mapRef.current)
            map.updateSize()
        }
    }, [map])

    return (
        <div className="App">
            <h1>Open Layers React+TS Starter</h1>
            <div className="map-container">
                <div id="map" ref={mapRef}></div>
            </div>
        </div>
    )
}

export {
    App
}
