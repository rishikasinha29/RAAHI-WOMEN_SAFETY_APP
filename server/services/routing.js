const OSRM_URL =
  process.env.OSRM_URL ||
  "https://router.project-osrm.org";

export async function getRoutes(
  source,
  destination
) {
  const coordinates =
    `${source.lon},${source.lat};` +
    `${destination.lon},${destination.lat}`;

  const url =
    `${OSRM_URL}/route/v1/driving/${coordinates}` +
    `?alternatives=true` +
    `&overview=full` +
    `&geometries=geojson` +
    `&steps=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Routing failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  if (
    data.code !== "Ok" ||
    !Array.isArray(data.routes) ||
    data.routes.length === 0
  ) {
    throw new Error("No route could be found.");
  }

  return data.routes;
}