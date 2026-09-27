import { useState } from "react"
import {
  ShieldAlert,
  MessageCircle,
  PhoneCall,
  Flag,
  X,
  Loader2,
} from "lucide-react"

import {
  activateSOS,
  openWhatsAppSOS,
  openWhatsAppCall,
} from "../services/sos"

export default function SOSButton({
  liveLocation = null,
  onFlagLocation,
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState("")

  async function getEmergencyLocation() {
    setLoading(true)
    setError("")

    try {
      const result =
        await activateSOS(liveLocation)

      setLocation(result)

      return result
    } catch (err) {
      console.error(
        "ANZEN SOS location error:",
        err
      )

      setError(
        err.message ||
          "Unable to determine your current location."
      )

      return null
    } finally {
      setLoading(false)
    }
  }

  async function handleEmergencyMessage() {
    const result =
      location ||
      (await getEmergencyLocation())

    if (!result) {
      return
    }

    try {
      openWhatsAppSOS(result)
    } catch (err) {
      setError(
        err.message ||
          "Unable to open WhatsApp SOS."
      )
    }
  }

  function handleWhatsAppCall() {
    setError("")

    try {
      openWhatsAppCall()
    } catch (err) {
      setError(
        err.message ||
          "Unable to open WhatsApp."
      )
    }
  }

  function handleFlagLocation() {
    setOpen(false)
    setError("")

    if (onFlagLocation) {
      onFlagLocation()
    }
  }

  return (
    <>
      {/* Floating SOS button */}
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setError("")
        }}
        className="fixed bottom-6 right-6 z-[1000] flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-semibold text-white shadow-xl transition hover:bg-red-700"
      >
        <ShieldAlert size={20} />
        SOS
      </button>

      {/* SOS modal */}
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-red-600">
                  Emergency SOS
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Choose an emergency action.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Close SOS"
              >
                <X size={20} />
              </button>
            </div>

            {/* Location loading */}
            {loading && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Determining your current location...
              </div>
            )}

            {/* Location acquired */}
            {location && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <div className="font-semibold">
                  Current location acquired
                </div>

                <div>
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </div>

                {location.accuracy && (
                  <div className="text-xs">
                    Accuracy: approximately{" "}
                    {Math.round(location.accuracy)} m
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Three actions */}
            <div className="grid gap-3">

              {/* Emergency message */}
              <button
                type="button"
                onClick={handleEmergencyMessage}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MessageCircle size={20} />
                Emergency Message
              </button>

              {/* WhatsApp call */}
              <button
                type="button"
                onClick={handleWhatsAppCall}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PhoneCall size={20} />
                Call Us on WhatsApp
              </button>

              {/* Flag area */}
              <button
                type="button"
                onClick={handleFlagLocation}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                <Flag size={20} />
                Flag Unsafe Area
              </button>

            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Emergency Message opens WhatsApp with
              your live location pre-filled. Call Us on
              WhatsApp opens the same emergency contact
              so you can start a WhatsApp voice call.
            </p>

          </div>
        </div>
      )}
    </>
  )
}