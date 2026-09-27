import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Flag,
  ShieldCheck,
  Database,
  Settings,
  LogOut,
  ChevronRight,
  Navigation,
  MapPinned,
  CircleDot,
} from "lucide-react"

import MapView from "./components/MapView"
import SOSButton from "./components/SOSButton"
import RoutePanel from "./components/RoutePanel"
import RouteSearch from "./components/RouteSearch"
import FlagLocationModal from "./components/FlagLocationModal"
import NavigationOverlay from "./components/NavigationOverlay"
import MyReportsPanel from "./components/MyReportsPanel"

import { getRoutes } from "./services/routingService"
import { geocodeLocation } from "./services/geocodingService"

import {
  getHazards,
  getOfficialCrimeAreas,
  submitReport,
  getMyReports,
  deleteReport,
} from "./services/api"

import { useLiveLocation } from "./hooks/useLiveLocation"
import { getNavigationMetrics } from "./utils/navigation"

import "./App.css"


/* =========================================================
   ANZEN LOGO
========================================================= */

function AnzenLogo() {
  return (
    <div className="anzen-brand">
      <div className="anzen-brand-mark">
        <ShieldCheck
          size={21}
          strokeWidth={2.5}
        />
      </div>

      <div className="anzen-brand-copy">
        <strong>ANZEN</strong>
        <span>Safe Navigation</span>
      </div>
    </div>
  )
}


/* =========================================================
   ROUTE FORMATTER
========================================================= */

function formatRoute(route, index) {
  const geometry = route?.geometry || null

  const coordinates =
    geometry &&
    geometry.type === "LineString" &&
    Array.isArray(geometry.coordinates)
      ? geometry.coordinates.map(
          ([lon, lat]) => [lat, lon]
        )
      : []

  return {
    geometry,
    coordinates,

    id:
      route?.id ||
      `route-${index}`,

    name:
      route?.name ||
      (
        index === 0
          ? "Recommended Route"
          : `Alternative Route ${index}`
      ),

    distance:
      Number(route?.distance) || 0,

    duration:
      Number(route?.duration) || 0,

    score:
      Number.isFinite(
        Number(route?.score)
      )
        ? Number(route.score)
        : null,

    classification:
      route?.classification || null,

    risk:
      route?.risk ?? null,

    safetyScore:
      Number.isFinite(
        Number(route?.safetyScore)
      )
        ? Number(route.safetyScore)
        : null,

    safetyRiskScore:
      Number.isFinite(
        Number(route?.safetyRiskScore)
      )
        ? Number(route.safetyRiskScore)
        : null,

    hazardCount:
      Number(route?.hazardCount) || 0,

    hazards:
      Array.isArray(route?.hazards)
        ? route.hazards
        : [],

    crime:
      route?.crime || {
        incidentCount: 0,
        riskScore: 0,
        normalizedRisk: 0,
        incidents: [],
      },

    safetyHazards:
      route?.safetyHazards || {
        count: 0,
        riskScore: 0,
      },

    safetyWeights:
      route?.safetyWeights || null,

    steps:
      Array.isArray(route?.steps)
        ? route.steps
        : [],

    segments:
      Array.isArray(route?.segments)
        ? route.segments.map(
            (segment) => ({
              ...segment,

              geometry:
                segment?.geometry ||
                null,

              score:
                Number.isFinite(
                  Number(segment?.score)
                )
                  ? Number(segment.score)
                  : null,

              safetyScore:
                Number.isFinite(
                  Number(
                    segment?.safetyScore
                  )
                )
                  ? Number(
                      segment.safetyScore
                    )
                  : null,

              risk:
                Number.isFinite(
                  Number(segment?.risk)
                )
                  ? Number(segment.risk)
                  : null,

              classification:
                segment?.classification ||
                null,

              crime:
                segment?.crime || {
                  incidentCount: 0,
                  riskScore: 0,
                  normalizedRisk: 0,
                  incidents: [],
                },

              hazards:
                Array.isArray(
                  segment?.hazards
                )
                  ? segment.hazards
                  : [],

              safetyHazards:
                segment?.safetyHazards || {
                  count: 0,
                  riskScore: 0,
                  details: [],
                },
            })
          )
        : [],

    rawRoute: route,
  }
}


/* =========================================================
   APP
========================================================= */

function App({
  user,
  onLogout,
}) {

  /* =======================================================
     ROUTE STATE
  ======================================================= */

  const [
    selectedRoute,
    setSelectedRoute,
  ] = useState(null)

  const [
    routes,
    setRoutes,
  ] = useState([])

  const [
    isRoutePanelOpen,
    setIsRoutePanelOpen,
  ] = useState(true)

  const [
    navigationDestination,
    setNavigationDestination,
  ] = useState(null)


  /* =======================================================
     NAVIGATION STATE
  ======================================================= */

  const [
    navigationActive,
    setNavigationActive,
  ] = useState(false)

  const [
    navigationMetrics,
    setNavigationMetrics,
  ] = useState(null)

  const [
    followUser,
    setFollowUser,
  ] = useState(true)

  const [
    isRerouting,
    setIsRerouting,
  ] = useState(false)

  const lastRerouteRef =
    useRef(0)


  /* =======================================================
     LIVE LOCATION
  ======================================================= */

  const {
    location: liveLocation,
    error: locationError,
  } = useLiveLocation(
    navigationActive
  )


  /* =======================================================
     HAZARDS
  ======================================================= */

  const [
    hazards,
    setHazards,
  ] = useState([])

  const [
    hazardsLoading,
    setHazardsLoading,
  ] = useState(false)


  /* =======================================================
     OFFICIAL CRIME DATA
  ======================================================= */

  const [
    officialCrimeData,
    setOfficialCrimeData,
  ] = useState(null)

  const [
    officialCrimeLoading,
    setOfficialCrimeLoading,
  ] = useState(false)

  const [
    officialCrimeVisible,
    setOfficialCrimeVisible,
  ] = useState(false)

  const [
    officialCrimeYear,
    setOfficialCrimeYear,
  ] = useState(2023)


  /* =======================================================
     REPORT STATE
  ======================================================= */

  const [
    showFlagModal,
    setShowFlagModal,
  ] = useState(false)

  const [
    reports,
    setReports,
  ] = useState([])

  const [
    reportSubmitting,
    setReportSubmitting,
  ] = useState(false)

  const [
    reportsPanelOpen,
    setReportsPanelOpen,
  ] = useState(false)


  /* =======================================================
     SELECTED ROUTE OBJECT
  ======================================================= */

  const selectedRouteObject =
    useMemo(
      () =>
        routes.find(
          (route) =>
            route.id ===
            selectedRoute
        ) || null,
      [
        routes,
        selectedRoute,
      ]
    )


  /* =======================================================
     LOAD HAZARDS
  ======================================================= */

  useEffect(() => {
    let mounted = true

    async function loadHazards() {
      setHazardsLoading(true)

      try {
        const response =
          await getHazards()

        const backendHazards =
          Array.isArray(response)
            ? response
            : response?.hazards || []

        const formattedHazards =
          backendHazards
            .filter(
              (hazard) =>
                Number.isFinite(
                  Number(
                    hazard.lat
                  )
                ) &&
                Number.isFinite(
                  Number(
                    hazard.lon
                  )
                )
            )
            .map(
              (hazard) => ({
                id:
                  hazard.id,

                type:
                  hazard.category ||
                  "Other",

                description:
                  hazard.description ||
                  "Reported unsafe area.",

                time:
                  hazard.occurred_at ||
                  hazard.created_at ||
                  "Recently reported",

                position: [
                  Number(
                    hazard.lat
                  ),
                  Number(
                    hazard.lon
                  ),
                ],

                address:
                  hazard.address ||
                  "",

                severity:
                  hazard.severity,

                confidence:
                  hazard.confidence,

                status:
                  hazard.status,

                reportedBy:
                  hazard.reported_by ??
                  null,

                anonymous:
                  hazard.anonymous ??
                  true,
              })
            )

        if (mounted) {
          setHazards(
            formattedHazards
          )
        }
      } catch (error) {
        console.error(
          "Unable to load hazards:",
          error
        )
      } finally {
        if (mounted) {
          setHazardsLoading(
            false
          )
        }
      }
    }

    loadHazards()

    return () => {
      mounted = false
    }
  }, [])


  /* =======================================================
     LOAD OFFICIAL CRIME DATA
  ======================================================= */

  useEffect(() => {
    if (!officialCrimeVisible) {
      return
    }

    let mounted = true

    async function loadOfficialCrime() {
      setOfficialCrimeLoading(true)

      try {
        const data =
          await getOfficialCrimeAreas({
            year:
              officialCrimeYear,
          })

        if (mounted) {
          setOfficialCrimeData(
            data
          )
        }
      } catch (error) {
        console.error(
          "Unable to load official crime data:",
          error
        )

        if (mounted) {
          setOfficialCrimeData(
            null
          )
        }
      } finally {
        if (mounted) {
          setOfficialCrimeLoading(
            false
          )
        }
      }
    }

    loadOfficialCrime()

    return () => {
      mounted = false
    }
  }, [
    officialCrimeVisible,
    officialCrimeYear,
  ])


  /* =======================================================
     LOAD REPORT HISTORY
  ======================================================= */

  useEffect(() => {
    let mounted = true

    async function loadMyReports() {
      try {
        const data =
          await getMyReports()

        if (mounted) {
          setReports(
            Array.isArray(data)
              ? data
              : []
          )
        }
      } catch (error) {
        console.error(
          "Unable to load report history:",
          error
        )
      }
    }

    loadMyReports()

    return () => {
      mounted = false
    }
  }, [])


  /* =======================================================
     ROUTE SEARCH
  ======================================================= */

  async function handleRouteSearch(
    source,
    destination
  ) {
    try {
      setNavigationActive(
        false
      )

      setNavigationMetrics(
        null
      )

      setNavigationDestination(
        destination
      )

      setFollowUser(
        true
      )

      setReportsPanelOpen(
        false
      )

      lastRerouteRef.current =
        0

      const calculatedRoutes =
        await getRoutes(
          source,
          destination
        )

      if (
        !Array.isArray(
          calculatedRoutes
        ) ||
        calculatedRoutes.length === 0
      ) {
        setRoutes([])
        setSelectedRoute(
          null
        )

        alert(
          "No route was found for the selected locations."
        )

        return
      }

      const formattedRoutes =
        calculatedRoutes.map(
          formatRoute
        )

      setRoutes(
        formattedRoutes
      )

      setSelectedRoute(
        formattedRoutes[0]?.id ||
        null
      )

      setIsRoutePanelOpen(
        true
      )
    } catch (error) {
      console.error(
        "Routing error:",
        error
      )

      alert(
        `Unable to calculate a route. ${error.message}`
      )
    }
  }


  /* =======================================================
     START NAVIGATION
  ======================================================= */

  function startNavigation(
    routeId
  ) {
    const route =
      routes.find(
        (item) =>
          item.id === routeId
      )

    if (!route) {
      return
    }

    if (
      !navigationDestination
    ) {
      alert(
        "Navigation destination is unavailable. Please calculate the route again."
      )

      return
    }

    setSelectedRoute(
      route.id
    )

    setNavigationMetrics(
      null
    )

    setFollowUser(
      true
    )

    setIsRerouting(
      false
    )

    setReportsPanelOpen(
      false
    )

    lastRerouteRef.current =
      0

    setNavigationActive(
      true
    )

    setIsRoutePanelOpen(
      false
    )
  }


  /* =======================================================
     STOP NAVIGATION
  ======================================================= */

  function stopNavigation() {
    setNavigationActive(
      false
    )

    setNavigationMetrics(
      null
    )

    setIsRerouting(
      false
    )

    setFollowUser(
      true
    )

    lastRerouteRef.current =
      0

    setIsRoutePanelOpen(
      true
    )
  }


  /* =======================================================
     NAVIGATION METRICS
  ======================================================= */

  useEffect(() => {
    if (
      !navigationActive ||
      !liveLocation ||
      !selectedRouteObject
    ) {
      return
    }

    const metrics =
      getNavigationMetrics(
        liveLocation,
        selectedRouteObject
      )

    if (metrics) {
      setNavigationMetrics(
        metrics
      )
    }
  }, [
    navigationActive,
    liveLocation,
    selectedRouteObject,
  ])


  /* =======================================================
     AUTOMATIC REROUTING
  ======================================================= */

  useEffect(() => {
    if (
      !navigationActive ||
      !liveLocation ||
      !selectedRouteObject ||
      !navigationDestination ||
      !navigationMetrics?.offRoute ||
      isRerouting
    ) {
      return
    }

    const now =
      Date.now()

    if (
      now -
        lastRerouteRef.current <
      15000
    ) {
      return
    }

    lastRerouteRef.current =
      now

    async function reroute() {
      try {
        setIsRerouting(
          true
        )

        const rerouted =
          await getRoutes(
            {
              lat:
                liveLocation.lat,

              lon:
                liveLocation.lon,
            },
            navigationDestination
          )

        if (
          !Array.isArray(
            rerouted
          ) ||
          rerouted.length === 0
        ) {
          return
        }

        const formattedRoutes =
          rerouted.map(
            formatRoute
          )

        setRoutes(
          formattedRoutes
        )

        setSelectedRoute(
          formattedRoutes[0]?.id ||
          null
        )

        setFollowUser(
          true
        )
      } catch (error) {
        console.error(
          "Automatic rerouting failed:",
          error
        )
      } finally {
        setIsRerouting(
          false
        )
      }
    }

    reroute()
  }, [
    navigationActive,
    liveLocation,
    selectedRouteObject,
    navigationDestination,
    navigationMetrics?.offRoute,
    isRerouting,
  ])


  /* =======================================================
     FLAG REPORT
  ======================================================= */

  async function handleFlagSubmit(
    report
  ) {
    if (reportSubmitting) {
      return
    }

    setReportSubmitting(
      true
    )

    try {
      const location =
        await geocodeLocation(
          report.location
        )

      const severity =
        Number(
          report.severity
        ) || 3

      const savedReport =
        await submitReport({
          category:
            report.category,

          description:
            report.description ||
            "User reported issue.",

          severity,

          lat:
            Number(
              location.latitude
            ),

          lon:
            Number(
              location.longitude
            ),

          address:
            location.displayName ||
            "",

          occurredAt:
            new Date().toISOString(),

          anonymous:
            report.anonymous !==
            false,
        })

      const newHazard = {
        id:
          savedReport?.id ||
          `local-${Date.now()}`,

        type:
          report.category,

        description:
          savedReport?.description ||
          report.description ||
          "User reported issue.",

        time:
          savedReport?.occurred_at ||
          new Date().toISOString(),

        position: [
          Number(
            savedReport?.lat ??
              location.latitude
          ),

          Number(
            savedReport?.lon ??
              location.longitude
          ),
        ],

        address:
          savedReport?.address ||
          location.displayName ||
          "",

        severity:
          savedReport?.severity ||
          severity,

        confidence:
          savedReport?.confidence ??
          0.5,

        status:
          savedReport?.status ||
          "active",

        anonymous:
          savedReport?.anonymous ??
          report.anonymous ??
          true,
      }

      setHazards(
        (previous) => [
          ...previous,
          newHazard,
        ]
      )

      setReports(
        (previous) => [
          ...previous,
          {
            id:
              savedReport?.id,

            category:
              report.category,

            description:
              savedReport?.description ||
              report.description ||
              "User reported issue.",

            latitude:
              Number(
                savedReport?.lat ??
                  location.latitude
              ),

            longitude:
              Number(
                savedReport?.lon ??
                  location.longitude
              ),

            address:
              savedReport?.address ||
              location.displayName ||
              "",

            severity:
              savedReport?.severity ||
              severity,

            confidence:
              savedReport?.confidence ??
              0.5,

            status:
              savedReport?.status ||
              "active",

            occurred_at:
              savedReport?.occurred_at ||
              new Date().toISOString(),

            anonymous:
              savedReport?.anonymous ??
              report.anonymous ??
              true,
          },
        ]
      )

      setShowFlagModal(
        false
      )
    } catch (error) {
      console.error(
        "Flag location/report error:",
        error
      )

      alert(
        `Unable to submit the report. ${error.message}`
      )
    } finally {
      setReportSubmitting(
        false
      )
    }
  }


  /* =======================================================
     DELETE REPORT
  ======================================================= */

  async function handleDeleteReport(
    report
  ) {
    if (!report?.id) {
      return
    }

    const confirmed =
      window.confirm(
        `Delete your "${report.category || "flagged area"}" report?\n\nThis action cannot be undone.`
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteReport(
        report.id
      )

      const updatedReports =
        await getMyReports()

      setReports(
        Array.isArray(
          updatedReports
        )
          ? updatedReports
          : []
      )

      const hazardResponse =
        await getHazards()

      const backendHazards =
        Array.isArray(
          hazardResponse
        )
          ? hazardResponse
          : hazardResponse?.hazards ||
            []

      const formattedHazards =
        backendHazards
          .filter(
            (hazard) =>
              Number.isFinite(
                Number(
                  hazard.lat
                )
              ) &&
              Number.isFinite(
                Number(
                  hazard.lon
                )
              )
          )
          .map(
            (hazard) => ({
              id:
                hazard.id,

              type:
                hazard.category ||
                "Other",

              description:
                hazard.description ||
                "Reported unsafe area.",

              time:
                hazard.occurred_at ||
                hazard.created_at ||
                "Recently reported",

              position: [
                Number(
                  hazard.lat
                ),
                Number(
                  hazard.lon
                ),
              ],

              address:
                hazard.address ||
                "",

              severity:
                hazard.severity,

              confidence:
                hazard.confidence,

              status:
                hazard.status,

              reportedBy:
                hazard.reported_by ??
                null,

              anonymous:
                hazard.anonymous ??
                true,
            })
          )

      setHazards(
        formattedHazards
      )
    } catch (error) {
      console.error(
        "Delete report error:",
        error
      )

      alert(
        `Unable to delete the report.\n\n${error.message || "An unexpected error occurred."}`
      )
    }
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="anzen-app-shell">

      {/* ===================================================
          FULL SCREEN MAP
      =================================================== */}

      <main className="anzen-map-frame">
        <MapView
          selectedRoute={
            selectedRoute
          }

          onRouteSelect={
            setSelectedRoute
          }

          hazards={
            hazards
          }

          routes={
            routes
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
            setFollowUser
          }

          onRecenter={() =>
            setFollowUser(
              true
            )
          }

          officialCrimeData={
            officialCrimeVisible
              ? officialCrimeData
              : null
          }
        />
      </main>


      {/* ===================================================
          APPLICATION UI LAYER
      =================================================== */}

      <div className="anzen-ui-layer">

        {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

        {!navigationActive && (
          <aside className="anzen-sidebar">

            <AnzenLogo />

            <div className="anzen-sidebar-divider" />

            <nav className="anzen-sidebar-nav">

              <button
                type="button"
                className="anzen-sidebar-item active"
              >
                <Navigation
                  size={17}
                />

                <span>
                  Routes
                </span>
              </button>


              <button
                type="button"
                className="anzen-sidebar-item"
              >
                <ShieldCheck
                  size={17}
                />

                <span>
                  Safety
                </span>
              </button>


              <button
                type="button"
                className="anzen-sidebar-item"
                onClick={() =>
                  setReportsPanelOpen(
                    true
                  )
                }
              >
                <Flag
                  size={17}
                />

                <span>
                  Reports
                </span>

                {reports.length > 0 && (
                  <b>
                    {reports.length}
                  </b>
                )}
              </button>


              <button
                type="button"
                className={`anzen-sidebar-item ${
                  officialCrimeVisible
                    ? "crime-active"
                    : ""
                }`}
                onClick={() =>
                  setOfficialCrimeVisible(
                    (value) =>
                      !value
                  )
                }
              >
                <Database
                  size={17}
                />

                <span>
                  Crime Data
                </span>
              </button>

            </nav>


            <div className="anzen-sidebar-bottom">

              <button
                type="button"
                className="anzen-sidebar-item"
              >
                <Settings
                  size={17}
                />

                <span>
                  Settings
                </span>
              </button>

            </div>

          </aside>
        )}


        {/* =================================================
            TOP ROUTE SEARCH
        ================================================= */}

        {!navigationActive && (
          <div className="anzen-search-area">
            <RouteSearch
              onRouteSearch={
                handleRouteSearch
              }
            />
          </div>
        )}


        {/* =================================================
            ACCOUNT
        ================================================= */}

        {!navigationActive && (
          <div className="anzen-account-card">

            <div className="anzen-account-avatar">
              {(user?.name || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="anzen-account-copy">
              <span>
                SIGNED IN AS
              </span>

              <strong>
                {user?.name ||
                  "ANZEN User"}
              </strong>
            </div>

            <button
              type="button"
              className="anzen-account-logout"
              onClick={
                onLogout
              }
              title="Logout"
              aria-label="Logout"
            >
              <LogOut
                size={15}
              />
            </button>

          </div>
        )}


        {/* =================================================
            SAFETY DATA PANEL
        ================================================= */}

        {!navigationActive && (
          <aside className="anzen-safety-panel">

            <div className="anzen-safety-heading">

              <div className="anzen-safety-heading-icon">
                <ShieldCheck
                  size={15}
                />
              </div>

              <div>
                <strong>
                  Safety Data
                </strong>

                <span>
                  Live safety controls
                </span>
              </div>

            </div>


            {/* REPORT HISTORY */}

            <button
              type="button"
              className="anzen-safety-row"
              onClick={() =>
                setReportsPanelOpen(
                  true
                )
              }
            >

              <div className="anzen-safety-icon orange">
                <Flag
                  size={14}
                />
              </div>

              <div className="anzen-safety-copy">

                <strong>
                  Reports History
                </strong>

                <span>
                  Your submitted reports
                </span>

              </div>

              {reports.length > 0 && (
                <span className="anzen-safety-count">
                  {reports.length}
                </span>
              )}

              <ChevronRight
                size={15}
                className="anzen-safety-chevron"
              />

            </button>


            {/* OFFICIAL CRIME DATA */}

            <button
              type="button"
              className="anzen-safety-row"
              onClick={() =>
                setOfficialCrimeVisible(
                  (value) =>
                    !value
                )
              }
            >

              <div className="anzen-safety-icon red">
                <Database
                  size={14}
                />
              </div>

              <div className="anzen-safety-copy">

                <strong>
                  Official Crime Data
                </strong>

                <span>
                  NCRB city statistics
                </span>

              </div>

              <span
                className={`anzen-toggle ${
                  officialCrimeVisible
                    ? "enabled"
                    : ""
                }`}
              >
                <span />
              </span>

            </button>


            {/* NCRB YEAR SELECTOR */}

            {officialCrimeVisible && (
              <div className="anzen-crime-year">

                <div className="anzen-crime-year-head">

                  <div>
                    <span>
                      NCRB DATA YEAR
                    </span>

                    <strong>
                      Select year
                    </strong>
                  </div>

                  <CircleDot
                    size={13}
                  />

                </div>


                <div className="anzen-year-buttons">

                  {[2021, 2022, 2023].map(
                    (year) => (
                      <button
                        key={year}
                        type="button"
                        className={
                          officialCrimeYear ===
                          year
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setOfficialCrimeYear(
                            year
                          )
                        }
                      >
                        {year}
                      </button>
                    )
                  )}

                </div>

                <small>
                  Official city-level statistics
                </small>

              </div>
            )}

          </aside>
        )}


        {/* =================================================
            ROUTE PANEL
        ================================================= */}

        {!navigationActive && (
          <section
            className={`anzen-route-panel ${
              !isRoutePanelOpen
                ? "closed"
                : ""
            }`}
          >

            <RoutePanel
              routes={
                routes
              }

              selectedRoute={
                selectedRoute
              }

              onRouteSelect={
                setSelectedRoute
              }

              isOpen={
                isRoutePanelOpen
              }

              onClose={() =>
                setIsRoutePanelOpen(
                  false
                )
              }

              navigationActive={
                navigationActive
              }

              onStartNavigation={
                startNavigation
              }
            />

          </section>
        )}


        {/* =================================================
            SHOW ROUTES BUTTON
        ================================================= */}

        {!isRoutePanelOpen &&
          !navigationActive && (
            <button
              type="button"
              className="anzen-show-routes"
              onClick={() =>
                setIsRoutePanelOpen(
                  true
                )
              }
            >

              <MapPinned
                size={16}
              />

              <span>
                Show Routes
              </span>

              <ChevronRight
                size={14}
              />

            </button>
          )}


        {/* =================================================
            NAVIGATION OVERLAY
        ================================================= */}

        {navigationActive && (
          <NavigationOverlay
            route={
              selectedRouteObject
            }

            metrics={
              navigationMetrics
            }

            locationError={
              locationError
            }

            isRerouting={
              isRerouting
            }

            onStopNavigation={
              stopNavigation
            }
          />
        )}


        {/* =================================================
            MY REPORTS PANEL
        ================================================= */}

        {!navigationActive && (
          <MyReportsPanel
            reports={
              reports
            }

            isOpen={
              reportsPanelOpen
            }

            onClose={() =>
              setReportsPanelOpen(
                false
              )
            }

            onDelete={
              handleDeleteReport
            }
          />
        )}


        {/* =================================================
            SOS
        ================================================= */}

        <div className="anzen-sos-wrapper">

          <SOSButton
            liveLocation={
              liveLocation
            }

            onFlagLocation={() =>
              setShowFlagModal(
                true
              )
            }
          />

        </div>


        {/* =================================================
            FLAG LOCATION MODAL
        ================================================= */}

        <FlagLocationModal
          isOpen={
            showFlagModal
          }

          onClose={() => {
            if (
              !reportSubmitting
            ) {
              setShowFlagModal(
                false
              )
            }
          }}

          onSubmit={
            handleFlagSubmit
          }
        />


        {/* =================================================
            REPORT STATUS
        ================================================= */}

        {reports.length > 0 &&
          !navigationActive && (
            <div className="anzen-report-status">

              <Flag
                size={13}
              />

              <span>
                Reports submitted
              </span>

              <strong>
                {reports.length}
              </strong>

            </div>
          )}


        {/* =================================================
            HAZARD LOADING
        ================================================= */}

        {hazardsLoading &&
          !navigationActive && (
            <div className="anzen-loading">

              <span />

              Loading safety data...

            </div>
          )}


        {/* =================================================
            OFFICIAL CRIME LOADING
        ================================================= */}

        {officialCrimeLoading &&
          !navigationActive && (
            <div className="anzen-loading anzen-crime-loading">

              <span />

              Loading official crime data...

            </div>
          )}

      </div>
    </div>
  )
}

export default App