export async function getRoutes(
  source,
  destination
) {
  const sourceCoordinates =
    `${source.lon},${source.lat}`

  const destinationCoordinates =
    `${destination.lon},${destination.lat}`

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${sourceCoordinates};${destinationCoordinates}` +
    `?alternatives=true&overview=full&geometries=geojson`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      "Routing request failed."
    )
  }

  const data = await response.json()

  if (
    data.code !== "Ok" ||
    !data.routes ||
    data.routes.length === 0
  ) {
    throw new Error(
      "No route could be found."
    )
  }

  return data.routes
}