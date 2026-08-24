import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import {
  AlertTriangle,
  Clock,
} from "lucide-react"

function HazardMarker({ hazard }) {
  const hazardIcon = L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #dc2626;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        "
      >
        <span style="
          color: white;
          font-size: 18px;
          font-weight: bold;
        ">!</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })

  return (
    <Marker
      position={hazard.position}
      icon={hazardIcon}
    >
      <Popup>
        <div className="min-w-[220px]">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-red-600"
            />

            <h3 className="font-bold text-gray-900">
              {hazard.type}
            </h3>
          </div>

          <p className="mb-3 text-sm text-gray-600">
            {hazard.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={14} />

            <span>
              {hazard.time}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default HazardMarker