import { useEffect } from "react"
import { useMap } from "react-leaflet"

function MapController({
  selectedRoute,
  navigationActive,
  liveLocation,
  followUser,
  onUserInteraction,
}) {
  const map = useMap()

  /*
   * Normal route-planning mode:
   * fit the complete selected route.
   */
  useEffect(() => {
    if (
      navigationActive ||
      !selectedRoute ||
      !selectedRoute.coordinates ||
      selectedRoute.coordinates.length === 0
    ) {
      return
    }

    const bounds =
      selectedRoute.coordinates.reduce(
        (bounds, coordinate) => {
          bounds.extend(coordinate)
          return bounds
        },
        map.getBounds()
      )

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
    navigationActive,
    map,
  ])

  /*
   * Navigation mode:
   * continuously follow the live GPS position.
   */
  useEffect(() => {
    if (
      !navigationActive ||
      !liveLocation ||
      !followUser
    ) {
      return
    }

    map.setView(
      [
        liveLocation.lat,
        liveLocation.lon,
      ],
      Math.max(
        map.getZoom(),
        17
      ),
      {
        animate: true,
        duration: 0.35,
      }
    )
  }, [
    liveLocation,
    navigationActive,
    followUser,
    map,
  ])

  /*
   * If the user manually drags the map,
   * stop automatic following.
   */
  useEffect(() => {
    if (!navigationActive) {
      return undefined
    }

    function handleDragStart() {
      onUserInteraction(false)
    }

    map.on(
      "dragstart",
      handleDragStart
    )

    return () => {
      map.off(
        "dragstart",
        handleDragStart
      )
    }
  }, [
    map,
    navigationActive,
    onUserInteraction,
  ])

  return null
}

export default MapController