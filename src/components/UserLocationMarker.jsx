import {
  Circle,
  CircleMarker,
  Popup,
} from "react-leaflet"

function UserLocationMarker({
  location,
}) {
  if (!location) {
    return null
  }

  const position = [
    location.lat,
    location.lon,
  ]

  return (
    <>
      <Circle
        center={position}
        radius={
          Math.max(
            Number(location.accuracy) || 0,
            8
          )
        }
        pathOptions={{
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.12,
          weight: 1,
        }}
      />

      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: "#2563eb",
          fillOpacity: 1,
        }}
      >
        <Popup>
          <strong>
            Your current location
          </strong>
        </Popup>
      </CircleMarker>
    </>
  )
}

export default UserLocationMarker