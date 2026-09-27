import { query } from "../db.js"

const DEFAULT_CORRIDOR_METERS = 200
const DEFAULT_LOOKBACK_DAYS = 730

function normalizeCrimeWeight(category = "") {
  const value = category.toLowerCase()

  if (value.includes("gang rape")) return 10
  if (value.includes("rape")) return 9
  if (value.includes("sexual assault")) return 8
  if (value.includes("molestation")) return 7
  if (value.includes("pocso")) return 8
  if (value.includes("harassment")) return 5
  if (value.includes("threat")) return 4
  if (value.includes("attack")) return 5

  return 3
}

function calculateTemporalWeight(incidentDate) {
  if (!incidentDate) return 1

  const date = new Date(incidentDate)
  if (Number.isNaN(date.getTime())) return 1

  const ageDays = Math.max(
    0,
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Gradual decay over approximately two years.
  return Math.max(0.2, 1 - ageDays / DEFAULT_LOOKBACK_DAYS)
}

function calculateIncidentRisk(row) {
  const severityWeight = normalizeCrimeWeight(row.crime_category)
  const temporalWeight = calculateTemporalWeight(row.incident_date)

  return Number((severityWeight * temporalWeight).toFixed(2))
}

/**
 * Convert a route coordinate array:
 *
 * [
 *   [latitude, longitude],
 *   [latitude, longitude],
 *   ...
 * ]
 *
 * into a GeoJSON LineString.
 */
function coordinatesToGeoJSON(routeGeometry) {
  /*
   * OSRM geometry is already GeoJSON:
   *
   * {
   *   type: "LineString",
   *   coordinates: [
   *     [longitude, latitude],
   *     ...
   *   ]
   * }
   */

  if (
    routeGeometry &&
    routeGeometry.type === "LineString" &&
    Array.isArray(routeGeometry.coordinates)
  ) {
    if (routeGeometry.coordinates.length < 2) {
      throw new Error(
        "Route geometry must contain at least two coordinates."
      )
    }

    return routeGeometry
  }

  /*
   * Also support a plain array of [latitude, longitude]
   * coordinates for compatibility.
   */
  if (
    Array.isArray(routeGeometry) &&
    routeGeometry.length >= 2
  ) {
    const valid = routeGeometry.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        Number.isFinite(Number(coordinate[0])) &&
        Number.isFinite(Number(coordinate[1]))
    )

    if (!valid) {
      throw new Error(
        "Route contains invalid coordinates."
      )
    }

    return {
      type: "LineString",
      coordinates: routeGeometry.map(
        ([latitude, longitude]) => [
          Number(longitude),
          Number(latitude),
        ]
      ),
    }
  }

  throw new Error(
    "Route geometry must be a GeoJSON LineString or coordinate array."
  )
}

/**
 * Analyze news-derived crime incidents around a route.
 *
 * IMPORTANT:
 * - Only news_scoring_eligible incidents are considered.
 * - Only incidents with usable geometry are considered.
 * - Locality-level incidents remain approximate.
 * - News records remain unverified.
 */
export async function analyzeCrimeNearRoute(
  coordinates,
  options = {}
) {
  const corridorMeters =
    Number(options.corridorMeters) || DEFAULT_CORRIDOR_METERS

  const lookbackDays =
    Number(options.lookbackDays) || DEFAULT_LOOKBACK_DAYS

  const routeGeoJSON = coordinatesToGeoJSON(coordinates)

  const result = await query(
    `
    WITH route AS (
      SELECT
        ST_Transform(
          ST_SetSRID(
            ST_GeomFromGeoJSON($1),
            4326
          ),
          3857
        ) AS geom
    )
    SELECT
      c.incident_id,
      c.source,
      c.source_url,
      c.source_title,
      c.source_published_date,
      c.incident_date,
      c.reported_date,
      c.city_id,
      c.locality_id,
      c.locality_name_raw,
      c.police_station,
      c.crime_category,
      c.crime_description,
      c.location_accuracy,
      c.verification_status,
      ST_Distance(
        ST_Transform(c.geom, 3857),
        route.geom
      ) AS distance_meters
    FROM crime_incidents c
    CROSS JOIN route
    WHERE
      c.source_type = 'news'
      AND c.news_scoring_eligible = TRUE
      AND c.geom IS NOT NULL
      AND c.incident_date >= CURRENT_DATE - ($2 * INTERVAL '1 day')
      AND ST_DWithin(
        ST_Transform(c.geom, 3857),
        route.geom,
        $3
      )
    ORDER BY distance_meters ASC, c.incident_date DESC
    `,
    [
      JSON.stringify(routeGeoJSON),
      lookbackDays,
      corridorMeters,
    ]
  )

  const incidents = result.rows.map((row) => ({
    incidentId: row.incident_id,
    source: row.source,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    sourcePublishedDate: row.source_published_date,
    incidentDate: row.incident_date,
    reportedDate: row.reported_date,

    cityId: row.city_id,
    localityId: row.locality_id,
    localityName: row.locality_name_raw,
    policeStation: row.police_station,

    crimeCategory: row.crime_category,
    description: row.crime_description,

    locationAccuracy: row.location_accuracy,
    verificationStatus: row.verification_status,

    distanceMeters: Number(
      Number(row.distance_meters).toFixed(1)
    ),

    riskContribution: calculateIncidentRisk(row),
  }))

  const riskScore = Number(
    incidents
      .reduce(
        (total, incident) => total + incident.riskContribution,
        0
      )
      .toFixed(2)
  )

  return {
    incidentCount: incidents.length,
    riskScore,
    corridorMeters,
    lookbackDays,
    incidents,
  }
}