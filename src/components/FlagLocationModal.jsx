import { useState } from "react"

import {
  X,
  MapPin,
  Flag,
} from "lucide-react"

function FlagLocationModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [location, setLocation] =
    useState("")

  const [category, setCategory] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [anonymous, setAnonymous] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  if (!isOpen) {
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!location.trim()) {
      alert(
        "Please enter an address or road name."
      )

      return
    }

    if (!category) {
      alert(
        "Please select an issue category."
      )

      return
    }

    setSubmitting(true)

    try {
      await onSubmit({
        location: location.trim(),
        category,
        description:
          description.trim(),
        anonymous,
      })

      setLocation("")
      setCategory("")
      setDescription("")
      setAnonymous(true)

    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[2000]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >

      <div
        className="
          w-full
          max-w-[500px]
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* Header */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-gray-100
            px-6
            py-5
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-orange-100
              "
            >
              <Flag
                size={21}
                className="text-orange-600"
              />
            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Flag an Unsafe Area
              </h2>

              <p className="text-sm text-gray-500">
                Help make this route safer.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="
              rounded-full
              p-2
              hover:bg-gray-100
            "
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="p-6"
        >

          {/* Location */}

          <label className="block">

            <span className="mb-2 block text-sm font-semibold text-gray-800">
              Address or road name
            </span>

            <div className="relative">

              <MapPin
                size={19}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-orange-500
                "
              />

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="e.g. MP Nagar Zone 1"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  py-3
                  pl-10
                  pr-4
                  outline-none
                  focus:border-orange-500
                  focus:ring-2
                  focus:ring-orange-100
                "
              />

            </div>

          </label>


          {/* Category */}

          <div className="mt-5">

            <p className="mb-2 text-sm font-semibold text-gray-800">
              What happened?
            </p>

            <div className="grid grid-cols-2 gap-2">

              {[
                "Harassment",
                "Dark Alley",
                "Bad Crowd",
                "Poor Lighting",
                "Other",
              ].map((item) => (

                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`
                    rounded-xl
                    border
                    px-3
                    py-3
                    text-sm
                    transition

                    ${
                      category === item
                        ? "border-orange-500 bg-orange-50 font-semibold text-orange-700"
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

          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold text-gray-800">
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
              rows={4}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-gray-200
                p-3
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
              "
            />

          </div>


          {/* Anonymous */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              rounded-xl
              bg-gray-50
              p-4
            "
          >

            <div>

              <p className="text-sm font-semibold text-gray-800">
                Report anonymously
              </p>

              <p className="text-xs text-gray-500">
                Don't associate this report with your identity.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setAnonymous(
                  !anonymous
                )
              }
              className={`
                relative
                h-7
                w-12
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
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow
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
            disabled={submitting}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-orange-600
              py-3.5
              font-semibold
              text-white
              transition
              hover:bg-orange-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Flag size={18} />

            {submitting
              ? "Submitting..."
              : "Submit Report"}
          </button>

        </form>

      </div>

    </div>
  )
}

export default FlagLocationModal