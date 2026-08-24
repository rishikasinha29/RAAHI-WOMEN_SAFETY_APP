import { useState } from "react"

import MapView from "./components/MapView"
import SearchBar from "./components/SearchBar"
import SOSButton from "./components/SOSButton"
import RoutePanel from "./components/RoutePanel"
import ReportModal from "./components/ReportModal"

function App() {
  const [selectedRoute, setSelectedRoute] =
    useState("safe")

  const [isRoutePanelOpen, setIsRoutePanelOpen] =
    useState(true)

  const [reportLocation, setReportLocation] =
    useState(null)

  const [reports, setReports] = useState([])

  function handleMapClick(location) {
    setReportLocation(location)
  }

  function handleReportSubmit(report) {
    setReports((previousReports) => [
      ...previousReports,
      report,
    ])

    setReportLocation(null)

    console.log(
      "New report:",
      report
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">

      {/* Map */}
      <MapView
        selectedRoute={selectedRoute}
        onRouteSelect={setSelectedRoute}
        onMapClick={handleMapClick}
      />

      {/* Search */}
      <SearchBar />

      {/* Route panel */}
      <RoutePanel
        selectedRoute={selectedRoute}
        onRouteSelect={setSelectedRoute}
        isOpen={isRoutePanelOpen}
        onClose={() =>
          setIsRoutePanelOpen(false)
        }
      />

      {/* SOS */}
      <SOSButton />

      {/* Report modal */}
      {reportLocation && (
        <ReportModal
          isOpen={true}
          location={reportLocation}
          onClose={() =>
            setReportLocation(null)
          }
          onSubmit={handleReportSubmit}
        />
      )}

      {/* Temporary report counter */}
      {reports.length > 0 && (
        <div className="absolute bottom-6 left-6 z-[1000] rounded-xl bg-white px-4 py-3 text-sm shadow-lg">
          Reports submitted:{" "}
          <strong>{reports.length}</strong>
        </div>
      )}

      {/* Open routes button */}
      {!isRoutePanelOpen && (
        <button
          onClick={() =>
            setIsRoutePanelOpen(true)
          }
          className="absolute left-5 top-24 z-[1000] rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-lg"
        >
          Show Routes
        </button>
      )}
    </div>
  )
}

export default App