import express from "express"
import { query } from "../db.js"

const router = express.Router()

router.get("/", async (req, res, next) => {
  try {
    const {
      year,
      category,
      state,
      level,
    } = req.query

    const params = []
    const conditions = []

    if (year) {
      const parsedYear = Number(year)

      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < 1900 ||
        parsedYear > 2100
      ) {
        return res.status(400).json({
          error: "Invalid year.",
        })
      }

      params.push(parsedYear)

      conditions.push(
        `o.source_year = $${params.length}`
      )
    }

    if (category) {
      params.push(category)

      conditions.push(
        `o.crime_category = $${params.length}`
      )
    }

    if (state) {
      params.push(state)

      conditions.push(
        `LOWER(o.state_name) = LOWER($${params.length})`
      )
    }

    if (level) {
      params.push(level)

      conditions.push(
        `o.area_level = $${params.length}`
      )
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : ""

    const result = await query(
      `
      SELECT
        o.id,
        o.source_agency,
        o.source_dataset,
        o.source_year,
        o.area_level,
        o.area_name,
        o.state_name,
        o.crime_category,
        o.crime_count,
        o.population,
        o.crime_rate,
        o.intensity_score,
        o.chargesheeting_rate,
        o.source_url,
        ST_AsGeoJSON(o.geom)::json AS geometry
      FROM official_crime_areas o
      ${whereClause}
      ORDER BY
        o.source_year DESC,
        o.crime_category,
        o.area_name
      `,
      params
    )

    const features = result.rows.map(
      (row) => ({
        type: "Feature",

        geometry:
          row.geometry,

        properties: {
          id:
            row.id,

          sourceAgency:
            row.source_agency,

          sourceDataset:
            row.source_dataset,

          sourceYear:
            row.source_year,

          areaLevel:
            row.area_level,

          areaName:
            row.area_name,

          stateName:
            row.state_name,

          crimeCategory:
            row.crime_category,

          crimeCount:
            Number(row.crime_count),

          population:
            row.population !== null
              ? Number(row.population)
              : null,

          crimeRate:
            row.crime_rate !== null
              ? Number(row.crime_rate)
              : null,

          intensityScore:
            row.intensity_score !== null
              ? Number(row.intensity_score)
              : null,

          chargesheetingRate:
            row.chargesheeting_rate !== null
              ? Number(row.chargesheeting_rate)
              : null,

          sourceUrl:
            row.source_url,
        },
      })
    )

    return res.json({
      type: "FeatureCollection",
      features,
    })
  } catch (error) {
    next(error)
  }
})

export default router