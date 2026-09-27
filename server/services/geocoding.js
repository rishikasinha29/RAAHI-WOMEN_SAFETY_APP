const NOMINATIM_URL =
  process.env.NOMINATIM_URL ||
  "https://nominatim.openstreetmap.org"

const USER_AGENT =
  "ANZEN-Safety-Platform/1.0 (ANZEN routing application)"

export async function searchLocations(query) {
  const trimmedQuery = String(query || "").trim()

  if (trimmedQuery.length < 2) {
    return []
  }

  const url = new URL(
    "/search",
    NOMINATIM_URL
  )

  url.searchParams.set(
    "format",
    "jsonv2"
  )

  url.searchParams.set(
    "q",
    trimmedQuery
  )

  url.searchParams.set(
    "limit",
    "5"
  )

  url.searchParams.set(
    "addressdetails",
    "1"
  )

  url.searchParams.set(
    "countrycodes",
    "in"
  )

  console.log(
    `[Geocoding] Searching: "${trimmedQuery}"`
  )

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(
      `Geocoding failed with status ${response.status}.`
    )
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid response received from geocoding service."
    )
  }

  console.log(
    `[Geocoding] Found ${data.length} result(s) for "${trimmedQuery}"`
  )

  return data
    .filter(
      (item) =>
        Number.isFinite(Number(item.lat)) &&
        Number.isFinite(Number(item.lon))
    )
    .map((item) => ({
      lat: Number(item.lat),
      lon: Number(item.lon),

      latitude: Number(item.lat),
      longitude: Number(item.lon),

      displayName:
        item.display_name || trimmedQuery,
    }))
}