import { query } from "../db.js";

/*
 * Analyze hazards around the complete route.
 *
 * This is the existing route-level analysis and remains
 * unchanged at the 500 m default radius.
 */
export async function analyzeRoute(
  geometry,
  radiusMeters = 500
) {
  const result = await query(
    `
    WITH route AS (
      SELECT ST_SetSRID(
        ST_GeomFromGeoJSON($1),
        4326
      ) AS geom
    )
    SELECT
      h.id,
      c.name AS category,
      h.description,
      h.severity,
      h.confidence,
      h.occurred_at,
      h.address,
      ST_Distance(
        h.geom::geography,
        route.geom::geography
      ) AS distance_m
    FROM hazards h
    JOIN hazard_categories c
      ON c.id = h.category_id
    CROSS JOIN route
    WHERE h.status = 'active'
      AND ST_DWithin(
        h.geom::geography,
        route.geom::geography,
        $2
      )
    ORDER BY distance_m ASC
    `,
    [
      JSON.stringify(geometry),
      radiusMeters,
    ]
  );

  return result.rows;
}


/*
 * Analyze each OSRM route step independently.
 *
 * Each OSRM step represents a road/maneuver section.
 * This gives ANZEN street-level safety information
 * without inventing crime locations.
 */
export async function analyzeRouteSegments(
  steps,
  radiusMeters = 200
) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [];
  }

  const validSteps = steps.filter(
    (step) =>
      step?.geometry?.type === "LineString" &&
      Array.isArray(step.geometry.coordinates) &&
      step.geometry.coordinates.length >= 2
  );

  if (validSteps.length === 0) {
    return [];
  }

  /*
   * Send all step geometries to PostgreSQL in one request.
   * This avoids making one database request per street.
   */
  const stepGeometries = validSteps.map(
    (step) => step.geometry
  );

  const result = await query(
    `
    WITH segments AS (
      SELECT
        item.segment_index,
        ST_SetSRID(
          ST_GeomFromGeoJSON(
            item.geometry
          ),
          4326
        ) AS geom
      FROM jsonb_to_recordset($1::jsonb)
      AS item(
        geometry jsonb,
        segment_index integer
      )
    ),

    nearby_hazards AS (
      SELECT
        s.segment_index,
        h.id,
        c.name AS category,
        h.description,
        h.severity,
        h.confidence,
        h.occurred_at,
        h.address,

        ST_Distance(
          h.geom::geography,
          s.geom::geography
        ) AS distance_m

      FROM segments s

      JOIN hazards h
        ON h.status = 'active'
       AND ST_DWithin(
         h.geom::geography,
         s.geom::geography,
         $2
       )

      JOIN hazard_categories c
        ON c.id = h.category_id
    )

    SELECT
      segment_index,
      id,
      category,
      description,
      severity,
      confidence,
      occurred_at,
      address,
      distance_m

    FROM nearby_hazards

    ORDER BY
      segment_index,
      distance_m ASC
    `,
    [
      JSON.stringify(
        stepGeometries.map(
          (geometry, index) => ({
            geometry,
            segment_index: index,
          })
        )
      ),
      radiusMeters,
    ]
  );

  /*
   * Group hazards by route segment.
   */
  const hazardsBySegment = new Map();

  for (const hazard of result.rows) {
    const index =
      Number(hazard.segment_index);

    if (!hazardsBySegment.has(index)) {
      hazardsBySegment.set(index, []);
    }

    hazardsBySegment
      .get(index)
      .push(hazard);
  }

  /*
   * Return the OSRM step together with the hazards
   * affecting that specific road segment.
   */
  return validSteps.map(
    (step, index) => ({
      index,

      name:
        step.name ||
        "Unnamed road",

      distance:
        Number(step.distance) || 0,

      duration:
        Number(step.duration) || 0,

      geometry:
        step.geometry,

      hazards:
        hazardsBySegment.get(index) || [],
    })
  );
}


// Backward-compatible alias.
export const analyzeHazardsNearRoute =
  analyzeRoute;