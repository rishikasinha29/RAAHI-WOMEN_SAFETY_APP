import { useState } from "react"

import {
  X,
  MapPin,
  Send,
} from "lucide-react"

const categories = [
  "Harassment",
  "Dark Alley",
  "Bad Crowd",
  "Poor Lighting",
  "Other",
]

function ReportModal({
  isOpen,
  location,
  onClose,
  onSubmit,
}) {
  const [category, setCategory] = useState("")
  const [description, setDescription] =
    useState("")
  const [anonymous, setAnonymous] =
    useState(true)

  if (!isOpen) {
    return null
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!category) {
      alert("Please select a category.")
      return
    }

    const report = {
      category,
      description,
      anonymous,
      latitude: location.lat,
      longitude: location.lng,
      createdAt: new Date().toISOString(),
    }

    onSubmit(report)

    setCategory("")
    setDescription("")
    setAnonymous(true)
  }

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Report an Issue
            </h2>

            <p className="text-sm text-gray-500">
              Help make this route safer.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Location */}
        <div className="mb-5 rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <MapPin
              size={18}
              className="text-red-600"
            />

            <span className="text-sm font-medium">
              Selected location
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {location.lat.toFixed(5)},{" "}
            {location.lng.toFixed(5)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              What happened?
            </label>

            <div className="grid grid-cols-2 gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-sm
                    transition
                    ${
                      category === item
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Additional details
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the issue..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-red-500"
            />
          </div>

          {/* Anonymous */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
            <div>
              <p className="text-sm font-semibold">
                Report anonymously
              </p>

              <p className="text-xs text-gray-500">
                Don't associate this report with your identity.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setAnonymous(!anonymous)
              }
              className={`
                relative
                h-6
                w-11
                rounded-full
                transition
                ${
                  anonymous
                    ? "bg-green-500"
                    : "bg-gray-300"
                }
              `}
            >
              <span
                className={`
                  absolute
                  top-1
                  h-4
                  w-4
                  rounded-full
                  bg-white
                  transition
                  ${
                    anonymous
                      ? "left-6"
                      : "left-1"
                  }
                `}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            <Send size={18} />

            Submit Report
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReportModal