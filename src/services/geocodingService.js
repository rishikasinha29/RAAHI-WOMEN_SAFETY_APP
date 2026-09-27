import {
  searchLocations,
} from "./api.js";

export async function searchLocation(
  query
) {
  if (
    !query ||
    query.trim().length < 2
  ) {
    return [];
  }

  return searchLocations(query);
}

export async function geocodeLocation(
  query
) {
  const results =
    await searchLocation(query);

  if (results.length === 0) {
    throw new Error(
      "Location could not be found."
    );
  }

  return results[0];
}