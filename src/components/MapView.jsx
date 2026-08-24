import {
  MapContainer,
  TileLayer,
  Polyline,
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

import { routes } from "../data/routes"
import { hazards } from "../data/hazards"

import HazardMarker from "./HazardMarker"
import MapClickHandler from "./MapClickHandler"

function MapView({
  selectedRoute,
  onRouteSelect,
  onMapClick,
}) {
  const center = [23.2599, 77.4126]

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler
        onMapClick={onMapClick}
      />

      {routes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.coordinates}
          pathOptions={{
            color: route.color,
            weight:
              selectedRoute === route.id
                ? 8
                : 5,
            opacity:
              selectedRoute === route.id
                ? 1
                : 0.55,
          }}
          eventHandlers={{
            click: () => {
              onRouteSelect(route.id)
            },
          }}
        />
      ))}

      {hazards.map((hazard) => (
        <HazardMarker
          key={hazard.id}
          hazard={hazard}
        />
      ))}
    </MapContainer>
  )
}

export default MapView