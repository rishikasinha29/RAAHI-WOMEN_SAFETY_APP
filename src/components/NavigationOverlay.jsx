import {
  Navigation,
  X,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"

function formatDistance(
  meters
) {
  if (!Number.isFinite(meters)) {
    return "—"
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }

  return `${(
    meters / 1000
  ).toFixed(1)} km`
}

function formatDuration(
  seconds
) {
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return "—"
  }

  const minutes =
    Math.max(
      1,
      Math.round(seconds / 60)
    )

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours =
    Math.floor(minutes / 60)

  const remaining =
    minutes % 60

  return remaining
    ? `${hours} h ${remaining} min`
    : `${hours} h`
}

function NavigationOverlay({
  route,
  metrics,
  locationError,
  isRerouting,
  onStopNavigation,
}) {
  if (!route) {
    return null
  }

  const safetyClass =
    String(
      route.classification || ""
    ).toLowerCase()

  const safetyStyle =
    safetyClass.includes("green")
      ? "bg-green-600"
      : safetyClass.includes("yellow")
        ? "bg-yellow-500"
        : safetyClass.includes("red")
          ? "bg-red-600"
          : "bg-gray-700"

  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-x-0
        top-4
        z-[1200]
        flex
        justify-center
        px-4
      "
    >
      <div
        className="
          pointer-events-auto
          w-full
          max-w-[520px]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* Navigation instruction */}

        <div
          className="
            flex
            items-center
            gap-4
            bg-gray-900
            px-5
            py-4
            text-white
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              text-gray-900
            "
          >
            <Navigation
              size={28}
              fill="currentColor"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {metrics?.distanceToTurn <= 30
                ? "At next instruction"
                : "Next instruction"}
            </p>

            <p className="mt-1 truncate text-lg font-bold">
              {locationError
                ? "Unable to access live location"
                : isRerouting
                  ? "Recalculating route..."
                  : metrics?.nextInstruction ||
                    "Acquiring GPS location..."}
            </p>

            {!locationError &&
              metrics?.distanceToTurn != null && (
                <p className="mt-1 text-sm text-gray-300">
                  {formatDistance(
                    metrics.distanceToTurn
                  )}{" "}
                  ahead
                </p>
              )}
          </div>

          <button
            onClick={onStopNavigation}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white/10
              transition
              hover:bg-white/20
            "
            aria-label="Stop navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation information */}

        <div
          className="
            grid
            grid-cols-2
            gap-px
            bg-gray-200
          "
        >
          <div className="bg-white px-4 py-3">
            <p className="text-xs text-gray-500">
              Remaining
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatDistance(
                metrics?.remainingDistance
              )}
            </p>
          </div>

          <div className="bg-white px-4 py-3">
            <p className="text-xs text-gray-500">
              ETA
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatDuration(
                metrics?.remainingDuration
              )}
            </p>
          </div>
        </div>

        {/* Status */}

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            {metrics?.offRoute ? (
              <>
                <AlertTriangle
                  size={17}
                  className="text-orange-600"
                />

                <span className="text-xs font-medium text-orange-700">
                  You are off the route
                </span>
              </>
            ) : (
              <>
                <MapPin
                  size={17}
                  className="text-blue-600"
                />

                <span className="text-xs font-medium text-gray-600">
                  Live location active
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className={
                safetyClass.includes("red")
                  ? "text-red-600"
                  : "text-green-600"
              }
            />

            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-xs
                font-semibold
                text-white
                ${safetyStyle}
              `}
            >
              Safety {route.score}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavigationOverlay