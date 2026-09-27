import express from "express"
import { query } from "../db.js"

const router = express.Router()

// GET /api/locations/cities
// Returns all cities in the ANZEN location master.
router.get("/cities", async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        city_id,
        city_name,
        state_name,
        population_2011_lakh,
        ncrb_city_covered,
        source_name,
        source_year,
        CASE
          WHEN geom IS NOT NULL
          THEN ST_Y(geom)
          ELSE NULL
        END AS latitude,
        CASE
          WHEN geom IS NOT NULL
          THEN ST_X(geom)
          ELSE NULL
        END AS longitude
      FROM locations_city
      ORDER BY city_name ASC
    `)

    res.json({
      cities: result.rows,
    })
  } catch (error) {
    next(error)
  }
})


// GET /api/locations/localities
// Optional:
//   ?cityId=IN-CITY-015
//   ?city=Mumbai
//   ?search=Bandra
router.get("/localities", async (req, res, next) => {
  try {
    const { cityId, city, search } = req.query

    const params = []
    const conditions = []

    if (cityId) {
      params.push(cityId)
      conditions.push(`l.city_id = $${params.length}`)
    }

    if (city) {
      params.push(city)
      conditions.push(`LOWER(c.city_name) = LOWER($${params.length})`)
    }

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`
        LOWER(l.locality_name) LIKE LOWER($${params.length})
      `)
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : ""

    const result = await query(
      `
      SELECT
        l.locality_id,
        l.city_id,
        c.city_name,
        c.state_name,
        l.locality_name,
        l.locality_type,
        l.nearby_landmark,
        l.frequency_count,
        l.frequency_status,
        l.latitude,
        l.longitude,
        l.source,
        l.data_status,
        l.verification_status
      FROM locations_locality l
      JOIN locations_city c
        ON c.city_id = l.city_id
      ${whereClause}
      ORDER BY
        c.city_name ASC,
        l.locality_name ASC
      `,
      params
    )

    res.json({
      localities: result.rows,
    })
  } catch (error) {
    next(error)
  }
})


// GET /api/locations/search?q=...
// Searches both city and locality names.
router.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q || !q.trim()) {
      return res.json({
        cities: [],
        localities: [],
      })
    }

    const searchTerm = `%${q.trim()}%`

    const [citiesResult, localitiesResult] = await Promise.all([
      query(
        `
        SELECT
          city_id,
          city_name,
          state_name,
          population_2011_lakh,
          ncrb_city_covered,
          latitude,
          longitude
        FROM (
          SELECT
            city_id,
            city_name,
            state_name,
            population_2011_lakh,
            ncrb_city_covered,
            CASE
              WHEN geom IS NOT NULL THEN ST_Y(geom)
              ELSE NULL
            END AS latitude,
            CASE
              WHEN geom IS NOT NULL THEN ST_X(geom)
              ELSE NULL
            END AS longitude
          FROM locations_city
        ) cities
        WHERE
          LOWER(city_name) LIKE LOWER($1)
          OR LOWER(state_name) LIKE LOWER($1)
        ORDER BY city_name ASC
        LIMIT 20
        `,
        [searchTerm]
      ),

      query(
        `
        SELECT
          l.locality_id,
          l.city_id,
          c.city_name,
          c.state_name,
          l.locality_name,
          l.locality_type,
          l.nearby_landmark,
          l.latitude,
          l.longitude,
          l.frequency_status,
          l.data_status
        FROM locations_locality l
        JOIN locations_city c
          ON c.city_id = l.city_id
        WHERE
          LOWER(l.locality_name) LIKE LOWER($1)
          OR LOWER(c.city_name) LIKE LOWER($1)
        ORDER BY
          c.city_name ASC,
          l.locality_name ASC
        LIMIT 30
        `,
        [searchTerm]
      ),
    ])

    res.json({
      cities: citiesResult.rows,
      localities: localitiesResult.rows,
    })
  } catch (error) {
    next(error)
  }
})


// GET /api/locations/cities/:cityId
// Returns one city and all its reference localities.
router.get("/cities/:cityId", async (req, res, next) => {
  try {
    const { cityId } = req.params

    const cityResult = await query(
      `
      SELECT
        city_id,
        city_name,
        state_name,
        population_2011_lakh,
        ncrb_city_covered,
        source_name,
        source_year,
        CASE
          WHEN geom IS NOT NULL THEN ST_Y(geom)
          ELSE NULL
        END AS latitude,
        CASE
          WHEN geom IS NOT NULL THEN ST_X(geom)
          ELSE NULL
        END AS longitude
      FROM locations_city
      WHERE city_id = $1
      `,
      [cityId]
    )

    if (cityResult.rows.length === 0) {
      return res.status(404).json({
        error: "City not found.",
      })
    }

    const localityResult = await query(
      `
      SELECT
        locality_id,
        city_id,
        locality_name,
        locality_type,
        nearby_landmark,
        frequency_count,
        frequency_status,
        latitude,
        longitude,
        source,
        data_status,
        verification_status
      FROM locations_locality
      WHERE city_id = $1
      ORDER BY locality_name ASC
      `,
      [cityId]
    )

    res.json({
      city: cityResult.rows[0],
      localities: localityResult.rows,
    })
  } catch (error) {
    next(error)
  }
})


export default router