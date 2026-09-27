import {
  X,
  Route,
  MapPin,
  Navigation,
  Clock3,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react"


function getSafetyScore(route) {
  const score = Number(
    route?.safetyScore ??
    route?.score
  )

  return Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : null
}


function getSafetyLabel(score) {
  if (score === null) {
    return "Insufficient data"
  }

  if (score >= 80) {
    return "Safe"
  }

  if (score >= 65) {
    return "Moderate"
  }

  if (score >= 40) {
    return "Elevated risk"
  }

  return "High risk"
}


function getSafetyColor(score) {
  if (score === null) {
    return "#64748b"
  }

  if (score >= 80) {
    return "#16a34a"
  }

  if (score >= 65) {
    return "#ca8a04"
  }

  if (score >= 40) {
    return "#ea580c"
  }

  return "#dc2626"
}


function formatDistance(distance) {
  const value = Number(distance)

  if (!Number.isFinite(value)) {
    return "--"
  }

  return `${value.toFixed(1)} km`
}


function formatDuration(duration) {
  const value = Number(duration)

  if (!Number.isFinite(value)) {
    return "--"
  }

  const minutes = Math.round(value)

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60

  return remaining
    ? `${hours}h ${remaining}m`
    : `${hours}h`
}


function getRouteName(route, index) {
  if (route?.name) {
    return route.name
  }

  if (index === 0) {
    return "Route 1 - Safest"
  }

  if (index === 1) {
    return "Route 2 - Balanced"
  }

  if (index === 2) {
    return "Route 3 - Fastest"
  }

  return `Route ${index + 1}`
}


function RouteCard({
  route,
  index,
  selected,
  onSelect,
  onStartNavigation,
}) {
  const score = getSafetyScore(route)
  const safetyLabel = getSafetyLabel(score)
  const safetyColor = getSafetyColor(score)

  const isRecommended = index === 0
  const isFastest = index === 2

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(route.id)
      }}
      className={[
        "w-full text-left",
        "rounded-xl border",
        "bg-white",
        "transition-all duration-200",
        "focus:outline-none",
        "focus:ring-2 focus:ring-blue-500/30",
        selected
          ? "border-blue-500 shadow-md"
          : "border-slate-200 hover:border-blue-300 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="px-3 py-3">

        {/* ---------------------------------------- */}
        {/* ROUTE TITLE */}
        {/* ---------------------------------------- */}

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <Route
                size={13}
                className="shrink-0 text-blue-600"
              />

              <span className="truncate text-[12px] font-bold text-slate-800">
                {getRouteName(route, index)}
              </span>

            </div>

          </div>


          <ChevronRight
            size={15}
            className="shrink-0 text-slate-400"
          />

        </div>


        {/* ---------------------------------------- */}
        {/* BADGES */}
        {/* ---------------------------------------- */}

        <div className="mt-2 flex items-center gap-1.5">

          {isRecommended && (
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">
              Recommended
            </span>
          )}

          {isFastest && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
              Fastest
            </span>
          )}

          <span
            className="rounded-md px-2 py-0.5 text-[9px] font-bold"
            style={{
              backgroundColor: `${safetyColor}15`,
              color: safetyColor,
            }}
          >
            {safetyLabel}
          </span>

        </div>


        {/* ---------------------------------------- */}
        {/* ROUTE STATS */}
        {/* ---------------------------------------- */}

        <div className="mt-3 grid grid-cols-3 gap-2">

          <div className="rounded-lg bg-slate-50 px-2 py-2">

            <div className="flex items-center gap-1">

              <MapPin
                size={11}
                className="text-slate-500"
              />

              <span className="text-[9px] font-medium text-slate-500">
                Distance
              </span>

            </div>

            <p className="mt-0.5 text-[11px] font-bold text-slate-800">
              {formatDistance(route?.distance)}
            </p>

          </div>


          <div className="rounded-lg bg-slate-50 px-2 py-2">

            <div className="flex items-center gap-1">

              <Clock3
                size={11}
                className="text-slate-500"
              />

              <span className="text-[9px] font-medium text-slate-500">
                Time
              </span>

            </div>

            <p className="mt-0.5 text-[11px] font-bold text-slate-800">
              {formatDuration(route?.duration)}
            </p>

          </div>


          <div className="rounded-lg bg-slate-50 px-2 py-2">

            <div className="flex items-center gap-1">

              <ShieldCheck
                size={11}
                style={{
                  color: safetyColor,
                }}
              />

              <span className="text-[9px] font-medium text-slate-500">
                Safety
              </span>

            </div>

            <p
              className="mt-0.5 text-[11px] font-bold"
              style={{
                color: safetyColor,
              }}
            >
              {score === null
                ? "--"
                : `${score}/100`}
            </p>

          </div>

        </div>


        {/* ---------------------------------------- */}
        {/* START BUTTON */}
        {/* ---------------------------------------- */}

        {selected && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()

              if (onStartNavigation) {
                onStartNavigation(route.id)
              }
            }}
            className="
              mt-2.5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-3
              py-2
              text-[11px]
              font-bold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <Navigation size={13} />

            Start Navigation

          </button>
        )}

      </div>
    </button>
  )
}


function RoutePanel({
  routes = [],
  selectedRoute,
  onRouteSelect,
  isOpen,
  onClose,
  navigationActive,
  onStartNavigation,
}) {

  if (!isOpen || navigationActive) {
    return null
  }


  return (
    <aside
      className="
        absolute
        left-[68px]
        top-[56px]
        bottom-0
        z-[1200]
        w-[285px]
        overflow-hidden
        border-r
        border-slate-200
        bg-white
        shadow-[4px_0_18px_rgba(15,23,42,0.08)]
      "
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          h-[72px]
          items-center
          justify-between
          border-b
          border-slate-200
          px-4
        "
      >

        <div>

          <div className="flex items-center gap-2">

            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-blue-50
              "
            >
              <Route
                size={15}
                className="text-blue-600"
              />
            </div>

            <h2 className="text-[13px] font-bold text-slate-900">
              Route Options
            </h2>

          </div>

          <p className="mt-0.5 pl-9 text-[9px] text-slate-500">
            Choose the safest and most efficient route
          </p>

        </div>


        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
          "
          aria-label="Close route panel"
        >
          <X size={16} />
        </button>

      </div>


      {/* ================================================= */}
      {/* ROUTE SUMMARY */}
      {/* ================================================= */}

      <div className="border-b border-slate-100 px-4 py-3">

        <div
          className="
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-3
            py-2
          "
        >

          <MapPin
            size={13}
            className="shrink-0 text-green-600"
          />

          <span className="truncate text-[10px] text-slate-500">
            From
          </span>

          <span className="text-slate-300">
            →
          </span>

          <Navigation
            size={13}
            className="shrink-0 text-red-500"
          />

          <span className="truncate text-[10px] text-slate-500">
            Destination
          </span>

        </div>


        {/* FILTERS */}

        <div className="mt-2 flex items-center gap-1.5">

          <button
            type="button"
            className="
              rounded-md
              bg-blue-600
              px-2.5
              py-1
              text-[9px]
              font-bold
              text-white
            "
          >
            All Routes
          </button>

          <button
            type="button"
            className="
              rounded-md
              bg-slate-100
              px-2.5
              py-1
              text-[9px]
              font-semibold
              text-slate-500
            "
          >
            Safest
          </button>

          <button
            type="button"
            className="
              rounded-md
              bg-slate-100
              px-2.5
              py-1
              text-[9px]
              font-semibold
              text-slate-500
            "
          >
            Fastest
          </button>

          <button
            type="button"
            className="
              ml-auto
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-md
              bg-slate-100
              text-slate-500
            "
          >
            <SlidersHorizontal size={12} />
          </button>

        </div>

      </div>


      {/* ================================================= */}
      {/* ROUTES */}
      {/* ================================================= */}

      <div className="h-[calc(100%-170px)] overflow-y-auto px-3 py-3">

        {routes.length === 0 ? (

          <div
            className="
              flex
              h-full
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
              "
            >
              <Route
                size={25}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-[13px] font-bold text-slate-700">
              No route calculated
            </h3>

            <p className="mt-1 max-w-[190px] text-[10px] leading-4 text-slate-400">
              Enter a source and destination above to find safe routes.
            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {routes.map(
              (route, index) => (
                <RouteCard
                  key={
                    route?.id ||
                    `route-${index}`
                  }
                  route={route}
                  index={index}
                  selected={
                    route?.id ===
                    selectedRoute
                  }
                  onSelect={
                    onRouteSelect
                  }
                  onStartNavigation={
                    onStartNavigation
                  }
                />
              )
            )}

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* SAFETY FOOTER */}
      {/* ================================================= */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          border-t
          border-slate-200
          bg-white
          px-4
          py-2.5
        "
      >

        <div className="flex items-center gap-2">

          <ShieldCheck
            size={13}
            className="text-green-600"
          />

          <span className="text-[9px] font-medium text-slate-500">
            Routes are evaluated using available safety data
          </span>

        </div>

      </div>

    </aside>
  )
}


export default RoutePanel