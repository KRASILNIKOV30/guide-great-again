import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import {OSM, Vector} from 'ol/source'
import {defaults as defaultControls} from 'ol/control'
import {defaults as defaultInteractions} from 'ol/interaction'
import View from 'ol/View'
import VectorLayer from "ol/layer/Vector";

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            visible: true,
            source: new OSM(),
        }),
        new VectorLayer({
            source: new Vector()
        }),
    ],
    view: new View({
        center: [5304435.777900918, 7603452.921222763],
        zoom: 18,
    }),
    controls: defaultControls(),
    interactions: defaultInteractions({})
})

export {
    map
}
