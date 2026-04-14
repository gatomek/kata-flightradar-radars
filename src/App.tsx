import {GeoJSON, MapContainer, TileLayer} from 'react-leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import {computeDestinationPoint} from 'geolib';
import type {Feature, FeatureCollection, Position} from 'geojson';
import L, {type LatLng, type LatLngLiteral} from 'leaflet';
import hash from 'object-hash';
import {coordList} from "./data.ts";

// This is the workaround of workaround for dev because leaflet have a bad concatenation
if (import.meta.env.DEV) {
    L.Icon.Default.imagePath = '';
}

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow
});

const center: LatLngLiteral = {lat: 52.162, lng: 20.96};
const distance = 250 * 1852; // in meters

const getRadarRanges = (coords: LatLngLiteral, distance: number): FeatureCollection => {
    const radar: Feature = {
        type: 'Feature',
        properties: {
            radar: true
        },
        geometry: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
        }
    };

    const points: Position[] = [];
    for (let bearing = 0; bearing <= 360; bearing++) {
        const destination = computeDestinationPoint(coords, distance, bearing);
        points.push([destination.longitude, destination.latitude]);
    }

    const radarRange: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: points
        }
    };

    return {
        type: 'FeatureCollection',
        features: [radar, radarRange]
    };
};

const pointToLayer = (feature: Feature, latLng: LatLng) => {
    const props = feature.properties;
    return props?.radar === true
        ? L.marker(latLng)
        : L.circleMarker(latLng, {
              radius: 1
          });
};

const geoJsonData: FeatureCollection[] = coordList.map((coords) => getRadarRanges(coords, distance));

const geoData = geoJsonData.map((d) => <GeoJSON key={hash(d)} data={d} pointToLayer={pointToLayer} />);

function App() {
    return (
        <MapContainer center={center} zoom={5} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            />
            {geoData}
        </MapContainer>
    );
}

export default App;
