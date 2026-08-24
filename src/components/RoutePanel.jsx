import {
  ShieldCheck,
  Clock,
  Route,
  X,
} from "lucide-react"

import { routes } from "../data/routes"

function RoutePanel({
  selectedRoute,
  onRouteSelect,
  isOpen,
  onClose,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="absolute left-5 top-24 z-[1000] w-[320px] max-w-[85vw] rounded-2xl bg-white p-4 shadow-2xl">
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Available Routes
          </h2>

          <p className="text-xs text-gray-500">
            Choose a route based on safety
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* Routes */}
      <div className="space-y-3">
        {routes.map((route) => {
          const isSelected =
            selectedRoute === route.id

          return (
            <button
              key={route.id}
              onClick={() =>
                onRouteSelect(route.id)
              }
              className={`
                w-full
                rounded-xl
                border
                p-3
                text-left
                transition
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-start justify-between">
                
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        route.color,
                    }}
                  />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {route.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {route.description}
                    </p>
                  </div>
                </div>

                {route.safety === "High" && (
                  <ShieldCheck
                    size={20}
                    className="text-green-600"
                  />
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={14} />

                  <span>
                    {route.travelTime}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Route size={14} />

                  <span>
                    {route.distance}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <span
                  className={`
                    inline-block
                    rounded-full
                    px-2
                    py-1
                    text-xs
                    font-medium
                    ${
                      route.safety === "High"
                        ? "bg-green-100 text-green-700"
                        : route.safety === "Moderate"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {route.safety} Safety
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RoutePanel