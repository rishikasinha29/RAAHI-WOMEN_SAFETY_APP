import { useEffect, useState } from "react"

export function useLiveLocation(enabled) {
  const [location, setLocation] =
    useState(null)

  const [error, setError] =
    useState(null)

  const [isTracking, setIsTracking] =
    useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsTracking(false)
      return undefined
    }

    if (!navigator.geolocation) {
      setError(
        new Error(
          "Geolocation is not supported by this browser."
        )
      )

      setIsTracking(false)

      return undefined
    }

    setError(null)
    setIsTracking(true)

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat:
              position.coords.latitude,

            lon:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,

            heading:
              position.coords.heading,

            speed:
              position.coords.speed,

            timestamp:
              position.timestamp,
          })

          setError(null)
        },

        (geoError) => {
          const messages = {
            1: "Location permission denied.",
            2: "Location is currently unavailable.",
            3: "Location request timed out.",
          }

          console.error("Live location error:", {
            code: geoError?.code,
            message: geoError?.message,
            description:
              messages[geoError?.code] ||
              "Unknown geolocation error.",
          })

          setError(geoError)
        },

        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000,
        }
      )

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      )

      setIsTracking(false)
    }
  }, [enabled])

  return {
    location,
    error,
    isTracking,
  }
}