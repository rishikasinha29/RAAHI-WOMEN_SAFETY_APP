
import { useState } from "react"

import MapView from "./components/MapView"
import SOSButton from "./components/SOSButton"
import RoutePanel from "./components/RoutePanel"
import RouteSearch from "./components/RouteSearch"
import FlagLocationModal from "./components/FlagLocationModal"

import { getRoutes } from "./services/routingService"
import { geocodeLocation } from "./services/geocodingService"

import { hazards as initialHazards } from "./data/hazards"


function App() {

  // --------------------------------------------------
  // ROUTE STATE
  // --------------------------------------------------

  const [selectedRoute, setSelectedRoute] =
    useState(null)

  const [isRoutePanelOpen, setIsRoutePanelOpen] =
    useState(true)

  const [routes, setRoutes] =
    useState([])


  // --------------------------------------------------
  // HAZARD STATE
  // --------------------------------------------------

  const [hazards, setHazards] =
    useState(initialHazards)


  // --------------------------------------------------
  // FLAG MODAL STATE
  // --------------------------------------------------

  const [showFlagModal, setShowFlagModal] =
    useState(false)


  // --------------------------------------------------
  // REPORT STATE
  // --------------------------------------------------

  const [reports, setReports] =
    useState([])


  // --------------------------------------------------
  // ROUTE SEARCH
  // --------------------------------------------------

  async function handleRouteSearch(
    source,
    destination
  ) {

    try {

      const calculatedRoutes =
        await getRoutes(
          source,
          destination
        )


      const formattedRoutes =
        calculatedRoutes.map(
          (route, index) => ({

            id: `route-${index}`,

            name:
              index === 0
                ? "Recommended Route"
                : `Alternative ${index}`,

            coordinates:
              route.geometry.coordinates.map(
                ([lon, lat]) => [
                  lat,
                  lon,
                ]
              ),

            distance:
              (route.distance / 1000)
                .toFixed(1),

            duration:
              Math.round(
                route.duration / 60
              ),

            rawRoute: route,
          })
        )


      setRoutes(formattedRoutes)


      // Select first route
      setSelectedRoute(
        formattedRoutes[0]?.id || null
      )


      // Open route panel
      setIsRoutePanelOpen(true)

    } catch (error) {

      console.error(
        "Routing error:",
        error
      )

      alert(
        `Unable to calculate a route. Please check the source and destination. : ${error.message}`
      )
    }
  }


  // --------------------------------------------------
  // FLAG UNSAFE AREA
  // --------------------------------------------------

  async function handleFlagSubmit(report) {

    try {

      // ----------------------------------------------
      // Convert address → latitude / longitude
      // ----------------------------------------------

      const location =
        await geocodeLocation(
          report.location
        )


      // ----------------------------------------------
      // Create new hazard
      // ----------------------------------------------

      const newHazard = {

        id: Date.now(),

        type:
          report.category,

        description:
          report.description ||
          "User reported issue.",

        time: "Just now",

        position: [
          location.latitude,
          location.longitude,
        ],

        address:
          location.displayName,

        anonymous:
          report.anonymous,
      }


      // ----------------------------------------------
      // Store report
      // ----------------------------------------------

      setReports(
        (previousReports) => [
          ...previousReports,

          {
            ...report,

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            address:
              location.displayName,
          },
        ]
      )


      // ----------------------------------------------
      // Add hazard to map
      // ----------------------------------------------

      setHazards(
        (previousHazards) => [
          ...previousHazards,
          newHazard,
        ]
      )


      // ----------------------------------------------
      // Close modal
      // ----------------------------------------------

      setShowFlagModal(false)


      console.log(
        "New report:",
        report
      )

    } catch (error) {

      console.error(
        "Flag location error:",
        error
      )

      alert(
        "Unable to find this location. Please enter a valid address or road name."
      )
    }
  }


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div
      className="
        relative
        h-screen
        w-screen
        overflow-hidden
      "
    >

      {/* --------------------------------------------
          MAP
      --------------------------------------------- */}

      <MapView
        selectedRoute={selectedRoute}
        onRouteSelect={setSelectedRoute}
        hazards={hazards}
        routes={routes}
      />


      {/* --------------------------------------------
          SOURCE + DESTINATION SEARCH
      --------------------------------------------- */}

      <RouteSearch
        onRouteSearch={handleRouteSearch}
      />


      {/* --------------------------------------------
          ROUTE SIDEBAR
      --------------------------------------------- */}

      <RoutePanel
        routes={routes}
        selectedRoute={selectedRoute}
        onRouteSelect={setSelectedRoute}
        isOpen={isRoutePanelOpen}
        onClose={() =>
          setIsRoutePanelOpen(false)
        }
      />


      {/* --------------------------------------------
          SOS BUTTON
      --------------------------------------------- */}

      <SOSButton
        onFlagLocation={() =>
          setShowFlagModal(true)
        }
      />


      {/* --------------------------------------------
          FLAG UNSAFE AREA MODAL
      --------------------------------------------- */}

      <FlagLocationModal
        isOpen={showFlagModal}

        onClose={() =>
          setShowFlagModal(false)
        }

        onSubmit={handleFlagSubmit}
      />


      {/* --------------------------------------------
          TEMPORARY REPORT COUNTER
      --------------------------------------------- */}

      {reports.length > 0 && (

        <div
          className="
            absolute
            bottom-6
            left-6
            z-[1000]
            rounded-xl
            bg-white
            px-4
            py-3
            text-sm
            shadow-lg
          "
        >

          Reports submitted:{" "}

          <strong>
            {reports.length}
          </strong>

        </div>

      )}


      {/* --------------------------------------------
          SHOW ROUTES BUTTON
      --------------------------------------------- */}

      {!isRoutePanelOpen && (

        <button
          onClick={() =>
            setIsRoutePanelOpen(true)
          }

          className="
            absolute
            left-5
            top-24
            z-[1000]
            rounded-xl
            bg-white
            px-4
            py-3
            text-sm
            font-semibold
            shadow-lg
            transition
            hover:bg-gray-50
          "
        >
          Show Routes
        </button>

      )}

    </div>
  )
}


export default App

