
import { useEffect } from "react"
import { useMap } from "react-leaflet"


function MapController({
  selectedRoute,
}) {

  const map = useMap()


  useEffect(() => {

    if (
      !selectedRoute ||
      !selectedRoute.coordinates ||
      selectedRoute.coordinates.length === 0
    ) {
      return
    }


    // Create Leaflet bounds from route coordinates
    const bounds =
      selectedRoute.coordinates.reduce(
        (bounds, coordinate) => {
          bounds.extend(coordinate)

          return bounds
        },
        map.getBounds()
      )


    // Fit the map to the complete route
    map.fitBounds(
      bounds,
      {
        padding: [80, 80],
        maxZoom: 15,
        animate: true,
        duration: 1,
      }
    )

  }, [
    selectedRoute,
    map,
  ])


  return null
}


export default MapController
