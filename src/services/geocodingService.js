const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search"


// Search locations for RouteSearch autocomplete
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) {
    return []
  }

  const url =
    `${NOMINATIM_URL}` +
    `?format=json` +
    `&q=${encodeURIComponent(query)}` +
    `&limit=5` +
    `&addressdetails=1`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      "Location search failed."
    )
  }

  const data = await response.json()

  return data.map((item) => {

    const lat = Number(item.lat)
    const lon = Number(item.lon)

    return {
      // Existing routingService expects these
      lat,
      lon,

      // Also keep descriptive names
      latitude: lat,
      longitude: lon,

      displayName:
        item.display_name,
    }
  })
}


// Convert one address into coordinates
export async function geocodeLocation(query) {
  if (!query || !query.trim()) {
    throw new Error(
      "Location cannot be empty."
    )
  }

  const results =
    await searchLocation(query)

  if (results.length === 0) {
    throw new Error(
      "Location could not be found."
    )
  }

  return results[0]
}