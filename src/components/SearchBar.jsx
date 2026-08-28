import { useState } from "react"

import {
  Search,
  LoaderCircle,
  X,
} from "lucide-react"

function SearchBar({ onLocationFound }) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSearch(event) {
    event.preventDefault()

    if (!query.trim()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      )

      if (!response.ok) {
        throw new Error(
          "Search request failed."
        )
      }

      const results = await response.json()

      if (results.length === 0) {
        setError("Location not found.")
        return
      }

      const result = results[0]

      onLocationFound({
        lat: Number(result.lat),
        lon: Number(result.lon),
        displayName: result.display_name,
      })

    } catch (error) {
      console.error(error)

      setError(
        "Unable to search right now."
      )
    } finally {
      setLoading(false)
    }
  }

  function clearSearch() {
    setQuery("")
    setError("")
  }

  return (
    <div className="absolute left-1/2 top-5 z-[1000] w-[90%] max-w-xl -translate-x-1/2">

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg"
      >

        {loading ? (
          <LoaderCircle
            size={22}
            className="animate-spin text-gray-500"
          />
        ) : (
          <Search
            size={22}
            className="text-gray-500"
          />
        )}

        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search destination..."
          className="w-full bg-transparent text-gray-800 outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        )}

      </form>

      {error && (
        <div className="mt-2 rounded-xl bg-white px-4 py-2 text-sm text-red-600 shadow-lg">
          {error}
        </div>
      )}

    </div>
  )
}

export default SearchBar