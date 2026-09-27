import "dotenv/config"
import fs from "fs"
import path from "path"
import XLSX from "xlsx"
import { fileURLToPath } from "url"
import { query, closeDatabase } from "../server/db.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const EXCEL_FILE = path.join(
  __dirname,
  "..",
  "data",
  "table_3b.1.xlsx"
)

const NOMINATIM_URL =
  process.env.NOMINATIM_URL ||
  "https://nominatim.openstreetmap.org"

const SOURCE_AGENCY =
  "National Crime Records Bureau (NCRB)"

const SOURCE_DATASET =
  "Crime in India 2024 - Table 3B.1"

const SOURCE_YEAR = 2024

const CRIME_CATEGORY =
  "Crime Against Women (IPC+SLL)"

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  )
}

function cleanCityName(value) {
  if (!value) return ""

  return String(value)
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
}

async function geocodeCity(cityName) {
  const url =
    `${NOMINATIM_URL}/search` +
    `?format=jsonv2` +
    `&limit=1` +
    `&countrycodes=in` +
    `&q=${encodeURIComponent(cityName + ", India")}`

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "ANZEN-Women-Safety-App/1.0"
    }
  })

  if (!response.ok) {
    throw new Error(
      `Geocoding failed for ${cityName}: ${response.status}`
    )
  }

  const results = await response.json()

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(
      `No geocoding result found for ${cityName}`
    )
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon)
  }
}

function calculateIntensityScore(rate, maxRate) {
  if (
    !Number.isFinite(rate) ||
    !Number.isFinite(maxRate) ||
    maxRate <= 0
  ) {
    return null
  }

  return Number(
    ((rate / maxRate) * 100).toFixed(2)
  )
}

async function main() {
  if (!fs.existsSync(EXCEL_FILE)) {
    throw new Error(
      `Excel file not found:\n${EXCEL_FILE}`
    )
  }

  console.log(
    `Reading: ${EXCEL_FILE}`
  )

  const workbook =
    XLSX.readFile(EXCEL_FILE)

  const sheet =
    workbook.Sheets["Table 3B.1"]

  if (!sheet) {
    throw new Error(
      'Sheet "Table 3B.1" was not found.'
    )
  }

  const rows =
    XLSX.utils.sheet_to_json(sheet, {
      range: 1,
      defval: null
    })

  const records = rows.filter(
    (row) =>
      row.City &&
      String(row.City).trim() !==
        "TOTAL CITIES"
  )

  if (records.length === 0) {
    throw new Error(
      "No city records found in Table 3B.1."
    )
  }

  const rates = records
    .map(
      (row) =>
        Number(
          row[
            "Rate of Total Crime against Women (2024)"
          ]
        )
    )
    .filter(Number.isFinite)

  const maxRate = Math.max(...rates)

  console.log(
    `Found ${records.length} metropolitan cities.`
  )

  console.log(
    `Maximum 2024 crime rate: ${maxRate}`
  )

  for (const row of records) {
    const rawCity =
      String(row.City).trim()

    const city =
      cleanCityName(rawCity)

    const cases2022 =
      Number(row[2022]) || 0

    const cases2023 =
      Number(row[2023]) || 0

    const cases2024 =
      Number(row[2024]) || 0

    const populationLakhs =
      Number(
        row[
          "Actual Population (in Lakhs) (2011)"
        ]
      ) || null

    const crimeRate =
      Number(
        row[
          "Rate of Total Crime against Women (2024)"
        ]
      )

    const chargesheetingRate =
      Number(
        row[
          "Chargesheeting Rate (2024)"
        ]
      )

    console.log(
      `\nProcessing ${city}...`
    )

    const coordinates =
      await geocodeCity(city)

    const intensityScore =
      calculateIntensityScore(
        crimeRate,
        maxRate
      )

    const stateMatch =
      rawCity.match(/\(([^)]+)\)/)

    const stateName =
      stateMatch
        ? stateMatch[1]
        : null

    const sourceUrl =
      "https://data.opencity.in/dataset/crime-in-india-2024"

    const geometry =
      `SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})`

    await query(
      `
      INSERT INTO official_crime_areas (
        source_agency,
        source_dataset,
        source_year,
        area_level,
        area_name,
        state_name,
        crime_category,
        crime_count,
        population,
        crime_rate,
        intensity_score,
        source_url,
        geom,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        ST_GeomFromEWKT($13),
        NOW()
      )
      ON CONFLICT (
        source_dataset,
        source_year,
        area_level,
        area_name,
        crime_category
      )
      DO UPDATE SET
        state_name = EXCLUDED.state_name,
        crime_count = EXCLUDED.crime_count,
        population = EXCLUDED.population,
        crime_rate = EXCLUDED.crime_rate,
        intensity_score = EXCLUDED.intensity_score,
        source_url = EXCLUDED.source_url,
        geom = EXCLUDED.geom,
        updated_at = NOW()
      `,
      [
        SOURCE_AGENCY,
        SOURCE_DATASET,
        SOURCE_YEAR,
        "city",
        city,
        stateName,
        CRIME_CATEGORY,
        cases2024,
        populationLakhs
          ? populationLakhs * 100000
          : null,
        Number.isFinite(crimeRate)
          ? crimeRate
          : null,
        intensityScore,
        sourceUrl,
        geometry
      ]
    )

    console.log(
      `Imported ${city}: ${cases2024} cases, rate ${crimeRate}`
    )

    await sleep(1100)
  }

  console.log(
    "\nOfficial crime import completed."
  )

  await closeDatabase()
}

main().catch(async (error) => {
  console.error(
    "\nOfficial crime import failed:"
  )

  console.error(error)

  try {
    await closeDatabase()
  } catch {}

  process.exit(1)
})