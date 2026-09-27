import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet"

import {
  LocateFixed,
  Plus,
  Minus,
} from "lucide-react"

import MapController from "./MapController"
import HazardMarker from "./HazardMarker"
import UserLocationMarker from "./UserLocationMarker"
import OfficialCrimeLayer from "./OfficialCrimeLayer"

import "leaflet/dist/leaflet.css"


/* ==================================================
   GEOMETRY
================================================== */

function geometryToPositions(geometry) {
  if (!geometry) {
    return []
  }

  if (
    geometry.type === "LineString" &&
    Array.isArray(geometry.coordinates)
  ) {
    return geometry.coordinates
      .filter(
        (point) =>
          Array.isArray(point) &&
          point.length >= 2 &&
          Number.isFinite(Number(point[0])) &&
          Number.isFinite(Number(point[1]))
      )
      .map(
        ([longitude, latitude]) => [
          Number(latitude),
          Number(longitude),
        ]
      )
  }

  if (Array.isArray(geometry)) {
    return geometry
      .filter(
        (point) =>
          Array.isArray(point) &&
          point.length >= 2 &&
          Number.isFinite(Number(point[0])) &&
          Number.isFinite(Number(point[1]))
      )
      .map(
        ([latitude, longitude]) => [
          Number(latitude),
          Number(longitude),
        ]
      )
  }

  if (
    Array.isArray(geometry.coordinates)
  ) {
    return geometry.coordinates
      .filter(
        (point) =>
          Array.isArray(point) &&
          point.length >= 2 &&
          Number.isFinite(Number(point[0])) &&
          Number.isFinite(Number(point[1]))
      )
      .map(
        ([longitude, latitude]) => [
          Number(latitude),
          Number(longitude),
        ]
      )
  }

  return []
}


/* ==================================================
   SAFETY COLOR
================================================== */

function getSafetyColor(segment) {
  const score = Number(
    segment?.safetyScore ??
    segment?.score
  )

  if (Number.isFinite(score)) {
    if (score < 40) {
      return "#dc2626"
    }

    if (score < 65) {
      return "#ea580c"
    }

    if (score < 80) {
      return "#ca8a04"
    }

    return "#16a34a"
  }

  const classification =
    String(
      segment?.classification || ""
    ).toLowerCase()

  if (
    classification === "red" ||
    classification.includes("high")
  ) {
    return "#dc2626"
  }

  if (
    classification === "orange" ||
    classification.includes("elevated")
  ) {
    return "#ea580c"
  }

  if (
    classification === "yellow" ||
    classification.includes("moderate")
  ) {
    return "#ca8a04"
  }

  if (
    classification === "green" ||
    classification.includes("safe")
  ) {
    return "#16a34a"
  }

  return "#64748b"
}


/* ==================================================
   SAFETY LEGEND
================================================== */

function SafetyLegend() {
  return (
    <div className="map-safety-legend">

      <div className="map-legend-title">
        Route Safety
      </div>

      <div className="map-legend-item">
        <span className="legend-line green" />
        Safer
      </div>

      <div className="map-legend-item">
        <span className="legend-line yellow" />
        Moderate
      </div>

      <div className="map-legend-item">
        <span className="legend-line orange" />
        Elevated risk
      </div>

      <div className="map-legend-item">
        <span className="legend-line red" />
        High risk
      </div>

      <div className="map-legend-item">
        <span className="legend-line gray" />
        Insufficient data
      </div>

    </div>
  )
}


/* ==================================================
   ROUTE SEGMENTS
================================================== */

function SafetyRouteSegments({
  route,
  isSelected,
  navigationActive,
  onRouteSelect,
}) {
  const segments =
    Array.isArray(route?.segments)
      ? route.segments
      : []

  if (!segments.length) {
    return null
  }

  return (
    <>
      {segments.map(
        (segment, index) => {
          const positions =
            geometryToPositions(
              segment?.geometry
            )

          if (positions.length < 2) {
            return null
          }

          const color =
            getSafetyColor(segment)

          return (
            <Polyline
              key={`${route.id}-segment-${index}`}
              positions={positions}
              pathOptions={{
                color,
                weight:
                  isSelected ? 7 : 4,
                opacity:
                  isSelected ? 1 : 0.35,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={{
                click: () => {
                  if (
                    !navigationActive &&
                    onRouteSelect
                  ) {
                    onRouteSelect(
                      route.id
                    )
                  }
                },
              }}
            />
          )
        }
      )}
    </>
  )
}


/* ==================================================
   MAP CONTROLS
================================================== */

function MapControls({
  liveLocation,
  onRecenter,
}) {
  const map = useMap()

  function zoomIn() {
    map.zoomIn()
  }

  function zoomOut() {
    map.zoomOut()
  }

  function recenter() {
    if (
      liveLocation &&
      Number.isFinite(
        Number(liveLocation.lat)
      ) &&
      Number.isFinite(
        Number(liveLocation.lon)
      )
    ) {
      map.flyTo(
        [
          Number(liveLocation.lat),
          Number(liveLocation.lon),
        ],
        Math.max(
          map.getZoom(),
          15
        ),
        {
          duration: 0.7,
        }
      )

      if (onRecenter) {
        onRecenter()
      }

      return
    }

    map.flyTo(
      [
        23.2599,
        77.4126,
      ],
      14,
      {
        duration: 0.7,
      }
    )
  }

  return (
    <div className="map-controls">

      <button
        type="button"
        onClick={zoomIn}
        title="Zoom in"
        aria-label="Zoom in"
        className="map-control-button"
      >
        <Plus size={19} />
      </button>

      <div className="map-control-divider" />

      <button
        type="button"
        onClick={zoomOut}
        title="Zoom out"
        aria-label="Zoom out"
        className="map-control-button"
      >
        <Minus size={19} />
      </button>

      <div className="map-control-divider" />

      <button
        type="button"
        onClick={recenter}
        title="Recenter map"
        aria-label="Recenter map"
        className="map-control-button recenter"
      >
        <LocateFixed size={18} />
      </button>

    </div>
  )
}


/* ==================================================
   MAP VIEW
================================================== */

function MapView({
  selectedRoute,
  onRouteSelect,
  hazards = [],
  routes = [],
  navigationActive = false,
  liveLocation = null,
  followUser = true,
  onUserInteraction,
  onRecenter,
  officialCrimeData = null,
}) {
  const center = [
    23.2599,
    77.4126,
  ]

  const selectedRouteObject =
    routes.find(
      (route) =>
        route.id === selectedRoute
    ) || null

  return (
    <div className="map-view-root">

      <MapContainer
        center={center}
        zoom={14}
        minZoom={3}
        maxZoom={20}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        className="anzen-leaflet-map"
      >

        <MapController
          selectedRoute={
            selectedRouteObject
          }

          navigationActive={
            navigationActive
          }

          liveLocation={
            liveLocation
          }

          followUser={
            followUser
          }

          onUserInteraction={
            onUserInteraction
          }
        />


        <MapControls
          liveLocation={
            liveLocation
          }
          onRecenter={
            onRecenter
          }
        />


        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {officialCrimeData && (
          <OfficialCrimeLayer
            data={
              officialCrimeData
            }
          />
        )}


        {routes.map(
          (route) => {
            const isSelected =
              route.id === selectedRoute

            const positions =
              geometryToPositions(
                route?.geometry
              )

            const hasSegments =
              Array.isArray(
                route?.segments
              ) &&
              route.segments.some(
                (segment) =>
                  geometryToPositions(
                    segment?.geometry
                  ).length >= 2
              )

            if (hasSegments) {
              return (
                <SafetyRouteSegments
                  key={route.id}
                  route={route}
                  isSelected={
                    isSelected
                  }
                  navigationActive={
                    navigationActive
                  }
                  onRouteSelect={
                    onRouteSelect
                  }
                />
              )
            }

            if (positions.length < 2) {
              return null
            }

            return (
              <Polyline
                key={route.id}
                positions={positions}
                pathOptions={{
                  color:
                    isSelected
                      ? "#2563eb"
                      : "#64748b",

                  weight:
                    isSelected
                      ? 7
                      : 4,

                  opacity:
                    isSelected
                      ? 1
                      : 0.4,

                  lineCap:
                    "round",

                  lineJoin:
                    "round",
                }}

                eventHandlers={{
                  click: () => {
                    if (
                      !navigationActive &&
                      onRouteSelect
                    ) {
                      onRouteSelect(
                        route.id
                      )
                    }
                  },
                }}
              />
            )
          }
        )}


        {Array.isArray(hazards) &&
          hazards.map(
            (hazard) => (
              <HazardMarker
                key={hazard.id}
                hazard={hazard}
              />
            )
          )}


        {navigationActive &&
          liveLocation && (
            <UserLocationMarker
              location={
                liveLocation
              }
            />
          )}

      </MapContainer>


      {routes.length > 0 && (
        <SafetyLegend />
      )}

    </div>
  )
}


export default MapView