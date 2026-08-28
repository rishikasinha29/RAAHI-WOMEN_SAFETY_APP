
import { useState } from "react"

import {
  MapPin,
  Search,
  Navigation,
  LoaderCircle,
} from "lucide-react"

import { searchLocation } from "../services/geocodingService"


function RouteSearch({
  onRouteSearch,
}) {

  const [source, setSource] =
    useState("")

  const [destination, setDestination] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")


  // --------------------------------------------------
  // SEARCH ROUTE
  // --------------------------------------------------

  async function handleSearch(event) {

    event.preventDefault()

    if (!source.trim()) {

      setError(
        "Please enter a source location."
      )

      return
    }

    if (!destination.trim()) {

      setError(
        "Please enter a destination."
      )

      return
    }


    setLoading(true)
    setError("")


    try {

      // ----------------------------------------------
      // Search source
      // ----------------------------------------------

      const sourceResults =
        await searchLocation(source)


      if (sourceResults.length === 0) {

        throw new Error(
          "Source location could not be found."
        )
      }


      // ----------------------------------------------
      // Search destination
      // ----------------------------------------------

      const destinationResults =
        await searchLocation(
          destination
        )


      if (destinationResults.length === 0) {

        throw new Error(
          "Destination location could not be found."
        )
      }


      // ----------------------------------------------
      // Use first matching location
      // ----------------------------------------------

      const sourceLocation =
        sourceResults[0]

      const destinationLocation =
        destinationResults[0]


      console.log(
        "Source location:",
        sourceLocation
      )

      console.log(
        "Destination location:",
        destinationLocation
      )


      // ----------------------------------------------
      // Calculate route
      // ----------------------------------------------

      await onRouteSearch(
        sourceLocation,
        destinationLocation
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


  // --------------------------------------------------
  // CURRENT LOCATION
  // --------------------------------------------------

  function useCurrentLocation() {

    if (!navigator.geolocation) {

      setError(
        "Geolocation is not supported by this browser."
      )

      return
    }


    setLoading(true)
    setError("")


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          // ------------------------------------------
          // Current location
          // ------------------------------------------

          const currentLocation = {

            lat:
              position.coords.latitude,

            lon:
              position.coords.longitude,

            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            displayName:
              "Current Location",

          }


          setSource(
            "Current Location"
          )


          // ------------------------------------------
          // Destination required
          // ------------------------------------------

          if (!destination.trim()) {

            setError(
              "Now enter a destination."
            )

            return
          }


          // ------------------------------------------
          // Search destination
          // ------------------------------------------

          const destinationResults =
            await searchLocation(
              destination
            )


          if (
            destinationResults.length === 0
          ) {

            throw new Error(
              "Destination location could not be found."
            )
          }


          const destinationLocation =
            destinationResults[0]


          console.log(
            "Current location:",
            currentLocation
          )

          console.log(
            "Destination location:",
            destinationLocation
          )


          // ------------------------------------------
          // Calculate route
          // ------------------------------------------

          await onRouteSearch(
            currentLocation,
            destinationLocation
          )

        } catch (error) {

          console.error(
            "Current location routing error:",
            error
          )

          setError(
            error.message ||
            "Unable to find destination."
          )

        } finally {

          setLoading(false)

        }
      },


      () => {

        setLoading(false)

        setError(
          "Unable to access your current location."
        )

      }

    )
  }


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div
      className="
        absolute
        left-1/2
        top-4
        z-[1000]
        w-[calc(100%-32px)]
        max-w-xl
        -translate-x-1/2
      "
    >

      <form
        onSubmit={handleSearch}
        className="
          rounded-2xl
          bg-white
          p-3
          shadow-xl
        "
      >

        {/* ------------------------------------------
            SOURCE
        ------------------------------------------- */}

        <div
          className="
            flex
            items-center
            gap-3
            px-2
            py-2
          "
        >

          <MapPin
            size={20}
            className="text-green-600"
          />


          <input
            value={source}

            onChange={(event) =>
              setSource(
                event.target.value
              )
            }

            placeholder="From: source location"

            className="
              w-full
              bg-transparent
              text-sm
              outline-none
            "
          />


          <button
            type="button"

            onClick={
              useCurrentLocation
            }

            title="Use current location"

            className="
              rounded-lg
              p-2
              hover:bg-gray-100
            "
          >

            <Navigation
              size={18}
              className="text-blue-600"
            />

          </button>

        </div>


        <div
          className="
            mx-2
            border-t
          "
        />


        {/* ------------------------------------------
            DESTINATION
        ------------------------------------------- */}

        <div
          className="
            flex
            items-center
            gap-3
            px-2
            py-2
          "
        >

          <Search
            size={20}
            className="text-red-600"
          />


          <input
            value={destination}

            onChange={(event) =>
              setDestination(
                event.target.value
              )
            }

            placeholder="To: destination"

            className="
              w-full
              bg-transparent
              text-sm
              outline-none
            "
          />

        </div>


        {/* ------------------------------------------
            FIND ROUTE
        ------------------------------------------- */}

        <button
          type="submit"

          disabled={loading}

          className="
            mt-2
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-black
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-gray-800
            disabled:opacity-60
          "
        >

          {loading ? (

            <>

              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              Finding route...

            </>

          ) : (

            <>

              <Navigation
                size={18}
              />

              Find Safe Route

            </>

          )}

        </button>


        {/* ------------------------------------------
            ERROR
        ------------------------------------------- */}

        {error && (

          <p
            className="
              px-2
              pt-2
              text-sm
              text-red-600
            "
          >
            {error}
          </p>

        )}

      </form>

    </div>
  )
}


export default RouteSearch

