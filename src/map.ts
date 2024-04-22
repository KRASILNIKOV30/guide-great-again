import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source'
import {defaults as defaultControls} from 'ol/control'
import {defaults as defaultInteractions} from 'ol/interaction'
import View from 'ol/View'

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            visible: true,
            source: new OSM()
        })
    ],
    view: new View({
        center: [0, 0],
        zoom: 2
    }),
    controls: defaultControls(),
    interactions: defaultInteractions({})
})

export {
    map
}
