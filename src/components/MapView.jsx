
import {
  MapContainer,
  TileLayer,
  Polyline,
} from "react-leaflet"

import MapController from "./MapController"
import HazardMarker from "./HazardMarker"

import "leaflet/dist/leaflet.css"


function MapView({
  selectedRoute,
  onRouteSelect,
  hazards,
  routes = [],
}) {

  const center = [
    23.2599,
    77.4126,
  ]


  return (

    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
    >

      {/* ------------------------------------------
          MAP CONTROLLER
      ------------------------------------------- */}

      <MapController />


      {/* ------------------------------------------
          OPEN STREET MAP
      ------------------------------------------- */}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {/* ------------------------------------------
          ACTUAL OSRM ROUTES
      ------------------------------------------- */}

      {routes.map((route) => {

        const isSelected =
          selectedRoute === route.id

        return (

          <Polyline
            key={route.id}

            positions={
              route.coordinates
            }

            pathOptions={{

              /*
               * Selected route:
               * strong green
               */

              color:
                isSelected
                  ? "#16a34a"
                  : "#64748b",

              weight:
                isSelected
                  ? 7
                  : 4,

              opacity:
                isSelected
                  ? 1
                  : 0.45,

              lineCap: "round",
              lineJoin: "round",

            }}

            eventHandlers={{
              click: () =>
                onRouteSelect(
                  route.id
                ),
            }}

          />

        )
      })}


      {/* ------------------------------------------
          HAZARD MARKERS
      ------------------------------------------- */}

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

