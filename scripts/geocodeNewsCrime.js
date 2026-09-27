import { geocodeNewsCrimeIncidents } from "../server/services/crimeGeocoding.js"

try {
  const result = await geocodeNewsCrimeIncidents()

  console.log("\nGeocoding completed.")
  console.log(`Total: ${result.total}`)
  console.log(`Geocoded: ${result.geocoded}`)
  console.log(`Skipped: ${result.skipped}`)
  console.log(`Failed: ${result.failed}`)

  process.exit(0)
} catch (error) {
  console.error("\nGeocoding failed:")
  console.error(error)
  process.exit(1)
}