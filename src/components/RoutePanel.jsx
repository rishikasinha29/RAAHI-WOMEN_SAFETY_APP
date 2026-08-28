import {
  X,
  Clock3,
  Route as RouteIcon,
  ShieldCheck,
} from "lucide-react"

function RoutePanel({
  routes = [],
  selectedRoute,
  onRouteSelect,
  isOpen,
  onClose,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <aside
      className="
        absolute
        left-4
        top-24
        bottom-6
        z-[1000]
        w-[340px]
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-2xl
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-gray-200
          px-5
          py-4
        "
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Available Routes
          </h2>

          <p className="text-xs text-gray-500">
            Choose your preferred route
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            rounded-full
            p-2
            text-gray-500
            transition
            hover:bg-gray-100
            hover:text-gray-900
          "
          aria-label="Close route panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Routes */}
      <div className="h-full overflow-y-auto p-4">

        {routes.length === 0 && (
          <div className="flex h-40 items-center justify-center text-center">
            <div>
              <RouteIcon
                size={30}
                className="mx-auto mb-3 text-gray-400"
              />

              <p className="text-sm font-medium text-gray-700">
                No route calculated
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Enter a source and destination above.
              </p>
            </div>
          </div>
        )}

        {routes.map((route, index) => {
          const isSelected =
            selectedRoute === route.id

          return (
            <button
              key={route.id}
              onClick={() =>
                onRouteSelect(route.id)
              }
              className={`
                mb-3
                w-full
                rounded-xl
                border
                p-4
                text-left
                transition

                ${
                  isSelected
                    ? "border-black bg-gray-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }
              `}
            >

              {/* Route title */}
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <span
                    className={`
                      h-3
                      w-3
                      rounded-full

                      ${
                        index === 0
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }
                    `}
                  />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {index === 0
                        ? "Recommended Route"
                        : `Alternative Route ${index}`}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Road route from source to destination
                    </p>
                  </div>

                </div>

                {index === 0 && (
                  <ShieldCheck
                    size={20}
                    className="text-green-600"
                  />
                )}

              </div>

              {/* Route information */}
              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-4
                  text-sm
                  text-gray-600
                "
              >

                <span className="flex items-center gap-1">
                  <Clock3 size={15} />

                  {route.duration} min
                </span>

                <span className="flex items-center gap-1">
                  <RouteIcon size={15} />

                  {route.distance} km
                </span>

              </div>

              {/* Safety badge */}
              {index === 0 && (
                <div className="mt-3">

                  <span
                    className="
                      inline-flex
                      rounded-full
                      bg-green-100
                      px-3
                      py-1
                      text-xs
                      font-medium
                      text-green-700
                    "
                  >
                    Recommended
                  </span>

                </div>
              )}

            </button>
          )
        })}

      </div>
    </aside>
  )
}

export default RoutePanel