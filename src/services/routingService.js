import {
  analyzeRoutes,
} from "./api.js";

export async function getRoutes(
  source,
  destination
) {
  return analyzeRoutes(
    source,
    destination
  );
}