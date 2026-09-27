import {
  LocateFixed,
} from "lucide-react"

import { useMap } from "react-leaflet"

function RecenterButton({
  location,
  onRecenter,
}) {
  const map = useMap()

  if (!location) {
    return null
  }

  function handleRecenter() {
    onRecenter()

    map.setView(
      [location.lat, location.lon],
      17,
      {
        animate: true,
        duration: 0.5,
      }
    )
  }

  return (
    <button
      onClick={handleRecenter}
      className="
        absolute
        bottom-28
        right-6
        z-[1000]
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-white
        text-blue-600
        shadow-xl
        transition
        hover:bg-gray-50
        active:scale-95
      "
      aria-label="Recenter on current location"
      title="Recenter"
    >
      <LocateFixed size={22} />
    </button>
  )
}

export default RecenterButton