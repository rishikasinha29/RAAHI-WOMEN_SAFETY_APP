import { query } from "../db.js"

const NOMINATIM_URL =
  process.env.NOMINATIM_URL ||
  "https://nominatim.openstreetmap.org"

const USER_AGENT = "ANZEN-Women-Safety-App/1.0"

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildSearchQuery(row) {
  const locality = row.locality_name_raw?.trim()
  const city = row.city_name?.trim()

  if (!locality) return null

  return `${locality}, ${city}, India`
}

function determineConfidence(address = {}, displayName = "") {
  const text = `${displayName} ${JSON.stringify(address)}`.toLowerCase()

  if (
    text.includes("india") &&
    (
      text.includes("city") ||
      text.includes("town") ||
      text.includes("suburb") ||
      text.includes("neighbourhood") ||
      text.includes("neighborhood")
    )
  ) {
    return "high"
  }

  if (text.includes("india")) {
    return "medium"
  }

  return "low"
}

async function geocode(queryText) {
  const url = new URL("/search", NOMINATIM_URL)

  url.searchParams.set("q", queryText)
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("limit", "1")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("countrycodes", "in")

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(
      `Nominatim returned HTTP ${response.status}`
    )
  }

  const results = await response.json()

  if (!Array.isArray(results) || results.length === 0) {
    return null
  }

  return results[0]
}

export async function geocodeNewsCrimeIncidents() {
  const result = await query(`
    SELECT
      c.incident_id,
      c.city_id,
      c.locality_name_raw
    FROM crime_incidents c
    LEFT JOIN locations_city l
        ON l.city_id =c.city_id
    WHERE
      c.source_type = 'news'
      AND c.locality_name_raw IS NOT NULL
      AND TRIM(c.locality_name_raw) <> ''
      AND c.geom IS NULL
    ORDER BY c.source_published_date ASC
  `)

  console.log(
    `Found ${result.rows.length} news incidents requiring geocoding.`
  )

  let geocoded = 0
  let skipped = 0
  let failed = 0

  for (const row of result.rows) {
    const searchQuery = buildSearchQuery(row)

    if (!searchQuery) {
      skipped++
      continue
    }

    try {
      console.log(
        `Geocoding: ${row.locality_name_raw}`
      )

      const result = await geocode(searchQuery)

      if (!result) {
        console.log(
          `  No result: ${searchQuery}`
        )

        skipped++
        await sleep(1100)
        continue
      }

      const latitude = Number(result.lat)
      const longitude = Number(result.lon)

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        skipped++
        await sleep(1100)
        continue
      }

      const confidence = determineConfidence(
        result.address,
        result.display_name
      )

      await query(
        `
        UPDATE crime_incidents
        SET
          latitude = $1,
          longitude = $2,
          geom = ST_SetSRID(
            ST_MakePoint($2, $1),
            4326
          ),
          geocoding_source = 'Nominatim/OpenStreetMap',
          geocoding_confidence = $3,
          geocoded_query = $4,
          geocoded_at = NOW()
        WHERE incident_id = $5
        `,
        [
          latitude,
          longitude,
          confidence,
          searchQuery,
          row.incident_id,
        ]
      )

      console.log(
        `  ✓ ${latitude}, ${longitude} (${confidence})`
      )

      geocoded++

      // Respect Nominatim request rate.
      await sleep(1100)
    } catch (error) {
      failed++

      console.error(
        `  ✗ ${row.locality_name_raw}: ${error.message}`
      )

      await sleep(1100)
    }
  }

  return {
    total: result.rows.length,
    geocoded,
    skipped,
    failed,
  }
}
