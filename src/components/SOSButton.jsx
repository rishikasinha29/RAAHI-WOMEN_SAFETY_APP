import { useState } from "react"

import {
  Phone,
  X,
  AlertTriangle,
  Flag,
} from "lucide-react"

function SOSButton({
  onFlagLocation,
}) {
  const [showMenu, setShowMenu] =
    useState(false)

  function handleSOS() {
    setShowMenu(true)
  }

  function closeMenu() {
    setShowMenu(false)
  }

  function handleEmergency() {
    alert(
      "Emergency service integration will be added in a future phase."
    )

    closeMenu()
  }

  function handleFlag() {
    closeMenu()

    onFlagLocation()
  }

  return (
    <>
      {/* SOS Button */}

      <button
        onClick={handleSOS}
        className="
          absolute
          bottom-6
          right-6
          z-[1000]
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-red-600
          text-white
          shadow-xl
          transition
          hover:bg-red-700
          active:scale-95
        "
        aria-label="SOS"
      >
        <Phone size={28} />
      </button>


      {/* SOS Menu */}

      {showMenu && (
        <div
          className="
            absolute
            bottom-24
            right-6
            z-[1100]
            w-[320px]
            rounded-2xl
            bg-white
            p-5
            shadow-2xl
          "
        >

          {/* Header */}

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-red-100
                "
              >
                <AlertTriangle
                  size={22}
                  className="text-red-600"
                />
              </div>

              <div>

                <h3 className="font-bold text-gray-900">
                  Safety & Emergency
                </h3>

                <p className="text-xs text-gray-500">
                  What would you like to do?
                </p>

              </div>

            </div>

            <button
              onClick={closeMenu}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

          </div>


          {/* Emergency */}

          <button
            onClick={handleEmergency}
            className="
              mt-5
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              bg-red-600
              px-4
              py-4
              text-left
              text-white
              transition
              hover:bg-red-700
            "
          >

            <Phone size={22} />

            <div>

              <p className="font-semibold">
                Emergency SOS
              </p>

              <p className="text-xs text-red-100">
                Contact emergency services
              </p>

            </div>

          </button>


          {/* Flag location */}

          <button
            onClick={handleFlag}
            className="
              mt-3
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              border-gray-200
              px-4
              py-4
              text-left
              transition
              hover:bg-gray-50
            "
          >

            <Flag
              size={22}
              className="text-orange-500"
            />

            <div>

              <p className="font-semibold text-gray-900">
                Flag Unsafe Area
              </p>

              <p className="text-xs text-gray-500">
                Report a road or location
              </p>

            </div>

          </button>

        </div>
      )}
    </>
  )
}

export default SOSButton