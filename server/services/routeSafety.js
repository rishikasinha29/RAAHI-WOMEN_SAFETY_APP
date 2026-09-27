import { analyzeCrimeNearRoute } from "./crimeAnalysis.js"
import { analyzeRoute } from "./hazardAnalysis.js"
import { calculateRouteScore } from "../scoring.js"


const DEFAULT_CRIME_WEIGHT = 0.6
const DEFAULT_HAZARD_WEIGHT = 0.4

const DEFAULT_CORRIDOR_METERS = 200
const DEFAULT_LOOKBACK_DAYS = 730
const DEFAULT_HAZARD_RADIUS = 200


/* ==================================================
   HELPERS
================================================== */

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  )
}


function getWeight(value, fallback) {
  const number = Number(value)

  return Number.isFinite(number) &&
    number >= 0
    ? number
    : fallback
}


function normalizeRouteGeometry(routeGeometry) {
  if (
    routeGeometry &&
    routeGeometry.type === "LineString" &&
    Array.isArray(routeGeometry.coordinates)
  ) {
    if (routeGeometry.coordinates.length < 2) {
      throw new Error(
        "Route GeoJSON contains fewer than two coordinates."
      )
    }

    return routeGeometry
  }

  if (
    Array.isArray(routeGeometry) &&
    routeGeometry.length >= 2
  ) {
    return routeGeometry
  }

  if (
    routeGeometry &&
    Array.isArray(routeGeometry.coordinates) &&
    routeGeometry.coordinates.length >= 2
  ) {
    return routeGeometry.coordinates
  }

  const type =
    routeGeometry === null
      ? "null"
      : Array.isArray(routeGeometry)
        ? "array"
        : typeof routeGeometry

  throw new Error(
    `Unsupported route geometry format: ${type}.`
  )
}


/* ==================================================
   RISK NORMALIZATION
================================================== */

function normalizeCrimeRisk(rawRisk) {
  const risk = Number(rawRisk)

  if (!Number.isFinite(risk)) {
    return 0
  }

  return clamp(
    risk * 2.5,
    0,
    100
  )
}


/*
 * Convert the existing hazard scoring result
 * into the same 0-100 risk scale used by
 * route safety.
 */
function normalizeHazardRisk(hazardResult) {
  if (!hazardResult) {
    return 0
  }

  const hazardScore =
    Number(hazardResult.score)

  if (!Number.isFinite(hazardScore)) {
    return 0
  }

  return clamp(
    100 - hazardScore,
    0,
    100
  )
}


/* ==================================================
   CLASSIFICATION
================================================== */

function getClassification(safetyScore) {
  if (
    !Number.isFinite(
      Number(safetyScore)
    )
  ) {
    return "unknown"
  }

  if (safetyScore < 40) {
    return "red"
  }

  if (safetyScore < 65) {
    return "orange"
  }

  if (safetyScore < 80) {
    return "yellow"
  }

  return "green"
}


/* ==================================================
   ROUTE SAFETY
================================================== */

export async function analyzeRouteSafety(
  routeGeometry,
  options = {}
) {
  const geometry =
    normalizeRouteGeometry(
      routeGeometry
    )

  const crimeWeight =
    getWeight(
      options.crimeWeight,
      DEFAULT_CRIME_WEIGHT
    )

  const hazardWeight =
    getWeight(
      options.hazardWeight,
      DEFAULT_HAZARD_WEIGHT
    )

  const corridorMeters =
    Number.isFinite(
      Number(options.corridorMeters)
    )
      ? Number(options.corridorMeters)
      : DEFAULT_CORRIDOR_METERS

  const lookbackDays =
    Number.isFinite(
      Number(options.lookbackDays)
    )
      ? Number(options.lookbackDays)
      : DEFAULT_LOOKBACK_DAYS

  const hazardRadius =
    Number.isFinite(
      Number(options.hazardRadius)
    )
      ? Number(options.hazardRadius)
      : DEFAULT_HAZARD_RADIUS


  const [
    crimeResult,
    hazardRows,
  ] = await Promise.all([
    analyzeCrimeNearRoute(
      geometry,
      {
        corridorMeters,
        lookbackDays,
      }
    ),

    analyzeRoute(
      geometry,
      hazardRadius
    ),
  ])


  /*
   * IMPORTANT:
   *
   * analyzeRoute() returns an ARRAY of hazards.
   *
   * calculateRouteScore() is the existing
   * ANZEN hazard scoring implementation.
   */
  const hazardResult =
    calculateRouteScore(
      hazardRows
    )


  const crimeRisk =
    normalizeCrimeRisk(
      crimeResult?.riskScore
    )

  const hazardRisk =
    normalizeHazardRisk(
      hazardResult
    )


  const totalRisk =
    clamp(
      crimeRisk * crimeWeight +
        hazardRisk * hazardWeight,
      0,
      100
    )


  const safetyScore =
    Number(
      (
        100 -
        totalRisk
      ).toFixed(1)
    )


  return {
    safetyScore,

    riskScore:
      Number(
        totalRisk.toFixed(1)
      ),

    classification:
      getClassification(
        safetyScore
      ),

    crime: {
      incidentCount:
        Number(
          crimeResult?.incidentCount
        ) || 0,

      riskScore:
        Number(
          crimeResult?.riskScore
        ) || 0,

      normalizedRisk:
        Number(
          crimeRisk.toFixed(1)
        ),

      corridorMeters,

      lookbackDays,

      incidents:
        Array.isArray(
          crimeResult?.incidents
        )
          ? crimeResult.incidents
          : [],
    },

    hazards: {
      count:
        Number(
          hazardResult?.hazardCount
        ) || 0,

      riskScore:
        Number(
          hazardRisk.toFixed(1)
        ),

      details:
        Array.isArray(
          hazardRows
        )
          ? hazardRows
          : [],
    },

    weights: {
      crime: crimeWeight,
      hazards: hazardWeight,
    },
  }
}


/* ==================================================
   SEGMENT SAFETY
================================================== */

export async function analyzeRouteSegmentsSafety(
  segments,
  options = {}
) {
  if (!Array.isArray(segments)) {
    return []
  }


  const crimeWeight =
    getWeight(
      options.crimeWeight,
      DEFAULT_CRIME_WEIGHT
    )

  const hazardWeight =
    getWeight(
      options.hazardWeight,
      DEFAULT_HAZARD_WEIGHT
    )

  const corridorMeters =
    Number.isFinite(
      Number(options.corridorMeters)
    )
      ? Number(options.corridorMeters)
      : DEFAULT_CORRIDOR_METERS

  const lookbackDays =
    Number.isFinite(
      Number(options.lookbackDays)
    )
      ? Number(options.lookbackDays)
      : DEFAULT_LOOKBACK_DAYS

  const hazardRadius =
    Number.isFinite(
      Number(options.hazardRadius)
    )
      ? Number(options.hazardRadius)
      : DEFAULT_HAZARD_RADIUS


  const results =
    await Promise.all(
      segments.map(
        async (
          segment,
          index
        ) => {
          try {
            const geometry =
              normalizeRouteGeometry(
                segment?.geometry
              )


            const crime =
              await analyzeCrimeNearRoute(
                geometry,
                {
                  corridorMeters,
                  lookbackDays,
                }
              )


            /*
             * analyzeRoute() returns the actual
             * hazard rows.
             */
            const hazardRows =
              await analyzeRoute(
                geometry,
                hazardRadius
              )


            /*
             * Use the existing scoring.js
             * implementation.
             */
            const hazards =
              calculateRouteScore(
                hazardRows
              )


            const crimeRisk =
              normalizeCrimeRisk(
                crime?.riskScore
              )

            const hazardRisk =
              normalizeHazardRisk(
                hazards
              )


            const totalRisk =
              clamp(
                crimeRisk *
                  crimeWeight +
                  hazardRisk *
                  hazardWeight,
                0,
                100
              )


            const safetyScore =
              Number(
                (
                  100 -
                  totalRisk
                ).toFixed(1)
              )


            return {
              index:
                segment?.index ??
                index,

              name:
                segment?.name ||
                "",

              distance:
                Number(
                  segment?.distance
                ) || 0,

              duration:
                Number(
                  segment?.duration
                ) || 0,

              geometry:
                segment?.geometry ||
                null,

              safetyScore,

              riskScore:
                Number(
                  totalRisk.toFixed(1)
                ),

              classification:
                getClassification(
                  safetyScore
                ),

              crime: {
                incidentCount:
                  Number(
                    crime?.incidentCount
                  ) || 0,

                riskScore:
                  Number(
                    crime?.riskScore
                  ) || 0,

                normalizedRisk:
                  Number(
                    crimeRisk.toFixed(1)
                  ),

                corridorMeters,

                lookbackDays,

                incidents:
                  Array.isArray(
                    crime?.incidents
                  )
                    ? crime.incidents
                    : [],
              },

              hazards: {
                count:
                  Number(
                    hazards?.hazardCount
                  ) || 0,

                riskScore:
                  Number(
                    hazardRisk.toFixed(1)
                  ),

                details:
                  Array.isArray(
                    hazardRows
                  )
                    ? hazardRows
                    : [],
              },

              analysisError:
                false,
            }

          } catch (error) {
            console.error(
              `Segment ${index} safety analysis failed:`,
              error
            )

            return {
              index:
                segment?.index ??
                index,

              name:
                segment?.name ||
                "",

              distance:
                Number(
                  segment?.distance
                ) || 0,

              duration:
                Number(
                  segment?.duration
                ) || 0,

              geometry:
                segment?.geometry ||
                null,

              safetyScore:
                null,

              riskScore:
                null,

              classification:
                "unknown",

              crime: {
                incidentCount:
                  null,

                riskScore:
                  null,

                normalizedRisk:
                  null,

                corridorMeters,

                lookbackDays,

                incidents: [],
              },

              hazards: {
                count:
                  null,

                riskScore:
                  null,

                details: [],
              },

              analysisError:
                true,

              analysisErrorMessage:
                error?.message ||
                "Safety analysis failed.",
            }
          }
        }
      )
    )


  return results
}