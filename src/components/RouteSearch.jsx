import { useState } from "react"

import {
  MapPin,
  Search,
  Navigation,
  LoaderCircle,
} from "lucide-react"

import { searchLocations } from "../services/api"


function RouteSearch({
  onRouteSearch,
}) {
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  async function handleSearch(event) {
    event.preventDefault()

    const sourceQuery = source.trim()
    const destinationQuery = destination.trim()

    if (!sourceQuery) {
      setError("Please enter a source location.")
      return
    }

    if (!destinationQuery) {
      setError("Please enter a destination.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const sourceResults =
        await searchLocations(sourceQuery)

      if (
        !Array.isArray(sourceResults) ||
        sourceResults.length === 0
      ) {
        throw new Error(
          "Source location could not be found."
        )
      }

      const destinationResults =
        await searchLocations(destinationQuery)

      if (
        !Array.isArray(destinationResults) ||
        destinationResults.length === 0
      ) {
        throw new Error(
          "Destination location could not be found."
        )
      }

      await onRouteSearch(
        sourceResults[0],
        destinationResults[0]
      )

    } catch (error) {
      console.error(
        "Route search error:",
        error
      )

      setError(
        error.message ||
        "Unable to find route."
      )

    } finally {
      setLoading(false)
    }
  }


  function getCurrentPosition(options) {
    return new Promise(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          options
        )
      }
    )
  }


  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      )
      return
    }

    if (!destination.trim()) {
      setError("Now enter a destination.")
      return
    }

    setLoading(true)
    setError("")

    try {
      let position

      try {
        /*
         * First attempt:
         * Use the browser's normal location provider.
         * This is generally faster on desktop systems.
         */
        position =
          await getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000,
          })
      } catch (firstError) {
        console.warn(
          "Normal location request failed. Retrying with high accuracy.",
          firstError
        )

        /*
         * Second attempt:
         * Request a more accurate location.
         */
        position =
          await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          })
      }

      const latitude =
        position.coords.latitude

      const longitude =
        position.coords.longitude

      const accuracy =
        position.coords.accuracy

      console.log(
        "[RouteSearch] Current location:",
        {
          latitude,
          longitude,
          accuracy,
        }
      )

      const currentLocation = {
        lat: latitude,
        lon: longitude,
        latitude,
        longitude,
        displayName: "Current Location",
        accuracy,
      }

      setSource("Current Location")

      const destinationQuery =
        destination.trim()

      const destinationResults =
        await searchLocations(
          destinationQuery
        )

      if (
        !Array.isArray(destinationResults) ||
        destinationResults.length === 0
      ) {
        throw new Error(
          "Destination location could not be found."
        )
      }

      await onRouteSearch(
        currentLocation,
        destinationResults[0]
      )

    } catch (error) {
      console.error(
        "Current location routing error:",
        error
      )

      if (
        error &&
        typeof error.code === "number"
      ) {
        switch (error.code) {
          case 1:
            setError(
              "Location permission was denied. Please allow location access for ANZEN."
            )
            break

          case 2:
            setError(
              "Your location could not be determined. Please try again."
            )
            break

          case 3:
            setError(
              "Location request timed out. Please try again."
            )
            break

          default:
            setError(
              "Unable to access your current location."
            )
        }
      } else {
        setError(
          error.message ||
          "Unable to find destination."
        )
      }

    } finally {
      setLoading(false)
    }
  }


  return (
    <form
      onSubmit={handleSearch}
      className="route-search-card"
    >

      <div className="route-search-field">

        <div className="route-search-icon from">
          <MapPin size={18} />
        </div>

        <div className="route-search-field-content">
          <span>FROM</span>

          <input
            value={source}
            onChange={(event) =>
              setSource(event.target.value)
            }
            placeholder="Enter starting point"
            autoComplete="off"
          />
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          title="Use current location"
          className="route-current-button"
        >
          <Navigation size={17} />
        </button>

      </div>


      <div className="route-search-connector" />


      <div className="route-search-field">

        <div className="route-search-icon to">
          <Search size={18} />
        </div>

        <div className="route-search-field-content">
          <span>TO</span>

          <input
            value={destination}
            onChange={(event) =>
              setDestination(event.target.value)
            }
            placeholder="Enter destination"
            autoComplete="off"
          />
        </div>

      </div>


      <button
        type="submit"
        disabled={loading}
        className="route-search-submit"
      >

        {loading ? (
          <>
            <LoaderCircle
              size={17}
              className="animate-spin"
            />

            Finding route...
          </>
        ) : (
          <>
            <Navigation size={17} />

            Find Safe Route
          </>
        )}

      </button>


      {error && (
        <div className="route-search-error">
          {error}
        </div>
      )}

    </form>
  )
}


export default RouteSearch