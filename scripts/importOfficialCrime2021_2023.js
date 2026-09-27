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
  "ncrb_crime_against_women_2021_2023.xlsx"
)

const NOMINATIM_URL =
  process.env.NOMINATIM_URL ||
  "https://nominatim.openstreetmap.org"

const SOURCE_AGENCY =
  "National Crime Records Bureau (NCRB)"

const SOURCE_DATASET =
  "Crime in India 2023 - Table 3B.1"

const CRIME_CATEGORY =
  "Crime Against Women (IPC+SLL)"

const SOURCE_URL = null

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

async function geocodeCity(cityName) {
  const geocodingNames = {
    "Durg-Bhilainagar":
      "Bhilai, Chhattisgarh, India",
    
    "Vishakhapatnam":
       "Visakhapatnam, Andhra Pradesh, India"
  }

  const searchName =
    geocodingNames[cityName] ||
    `${cityName}, India`

  const url =
    `${NOMINATIM_URL}/search` +
    `?format=jsonv2` +
    `&limit=1` +
    `&countrycodes=in` +
    `&q=${encodeURIComponent(searchName)}`

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

  if (
    !Array.isArray(results) ||
    results.length === 0
  ) {
    throw new Error(
      `No geocoding result found for ${cityName}`
    )
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon)
  }
}

function findHeaderRow(rows) {
  return rows.findIndex(
    (row) =>
      Array.isArray(row) &&
      row.includes("City") &&
      row.includes(2021) &&
      row.includes(2022) &&
      row.includes(2023)
  )
}

function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
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

  const sheetName =
    workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error(
      "No worksheet found in Excel file."
    )
  }

  console.log(
    `Using worksheet: ${sheetName}`
  )

  const sheet =
    workbook.Sheets[sheetName]

  const rows =
    XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null
    })

  const headerIndex =
    findHeaderRow(rows)

  if (headerIndex === -1) {
    throw new Error(
      "Could not find the table header row."
    )
  }

  const header =
    rows[headerIndex].map(normalizeHeader)

  const cityIndex =
    header.indexOf("City")

  const year2021Index =
    header.indexOf("2021")

  const year2022Index =
    header.indexOf("2022")

  const year2023Index =
    header.indexOf("2023")

  const populationIndex =
    header.findIndex((value) =>
      value.startsWith(
        "Actual Population (in Lakhs)"
      )
    )

  const rateIndex =
    header.findIndex((value) =>
      value.includes(
        "Rate of Total Crime against Women (2023)"
      )
    )

  const chargesheetingIndex =
    header.findIndex((value) =>
      value
        .replace(/\s+/g, "")
        .toLowerCase()
        .includes(
          "chargesheetingrate(2023)"
        )
    )

  const requiredIndexes = {
    cityIndex,
    year2021Index,
    year2022Index,
    year2023Index,
    populationIndex,
    rateIndex,
    chargesheetingIndex
  }

  console.log(
    "\nDetected column indexes:"
  )

  console.log(requiredIndexes)

  for (
    const [name, index] of
    Object.entries(requiredIndexes)
  ) {
    if (index === -1) {
      throw new Error(
        `Required column not found: ${name}`
      )
    }
  }

  const records = []

  for (
    let i = headerIndex + 1;
    i < rows.length;
    i++
  ) {
    const row = rows[i]

    if (!Array.isArray(row)) {
      continue
    }

    const cityValue =
      row[cityIndex]

    if (!cityValue) {
      continue
    }

    const city =
      cleanCityName(cityValue)

    if (!city) {
      continue
    }

    if (
      city
        .toUpperCase()
        .includes("TOTAL")
    ) {
      continue
    }

    if (/^\[\d+\]$/.test(city)) {
      continue
    }

    const cases2021 =
      Number(row[year2021Index])

    const cases2022 =
      Number(row[year2022Index])

    const cases2023 =
      Number(row[year2023Index])

    const populationLakhs =
      Number(row[populationIndex])

    const crimeRate2023 =
      Number(row[rateIndex])

    const chargesheetingRate2023 =
      Number(row[chargesheetingIndex])

    records.push({
      city,
      cases2021,
      cases2022,
      cases2023,
      populationLakhs,
      crimeRate2023,
      chargesheetingRate2023
    })
  }

  if (records.length === 0) {
    throw new Error(
      "No city records found."
    )
  }

  const validRates =
    records
      .map(
        (record) =>
          record.crimeRate2023
      )
      .filter(Number.isFinite)

  const maxRate2023 =
    validRates.length > 0
      ? Math.max(...validRates)
      : null

  console.log(
    `\nFound ${records.length} metropolitan cities.`
  )

  console.log(
    `Maximum 2023 crime rate: ${maxRate2023}`
  )

  const coordinateCache =
    new Map()

  let imported = 0

  for (const record of records) {
    const {
      city,
      cases2021,
      cases2022,
      cases2023,
      populationLakhs,
      crimeRate2023,
      chargesheetingRate2023
    } = record

    console.log(
      `\nProcessing ${city}...`
    )

    let coordinates =
      coordinateCache.get(city)

    if (!coordinates) {
      coordinates =
        await geocodeCity(city)

      coordinateCache.set(
        city,
        coordinates
      )

      await sleep(1100)
    }

    const geometry =
      `SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})`

    const population =
      Number.isFinite(
        populationLakhs
      )
        ? populationLakhs * 100000
        : null

    const intensityScore =
      calculateIntensityScore(
        crimeRate2023,
        maxRate2023
      )

    const yearlyRecords = [
      {
        year: 2021,
        crimeCount: cases2021,
        crimeRate: null,
        chargesheetingRate: null,
        intensityScore: null
      },
      {
        year: 2022,
        crimeCount: cases2022,
        crimeRate: null,
        chargesheetingRate: null,
        intensityScore: null
      },
      {
        year: 2023,
        crimeCount: cases2023,
        crimeRate:
          Number.isFinite(
            crimeRate2023
          )
            ? crimeRate2023
            : null,
        chargesheetingRate:
          Number.isFinite(
            chargesheetingRate2023
          )
            ? chargesheetingRate2023
            : null,
        intensityScore
      }
    ]

    for (const yearly of yearlyRecords) {
      if (
        !Number.isFinite(
          yearly.crimeCount
        )
      ) {
        continue
      }

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
          chargesheeting_rate,
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
          $14,
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
          crime_count =
            EXCLUDED.crime_count,
          population =
            EXCLUDED.population,
          crime_rate =
            EXCLUDED.crime_rate,
          intensity_score =
            EXCLUDED.intensity_score,
          source_url =
            EXCLUDED.source_url,
          geom =
            EXCLUDED.geom,
          chargesheeting_rate =
            EXCLUDED.chargesheeting_rate,
          updated_at = NOW()
        `,
        [
          SOURCE_AGENCY,
          SOURCE_DATASET,
          yearly.year,
          "city",
          city,
          null,
          CRIME_CATEGORY,
          yearly.crimeCount,
          population,
          yearly.crimeRate,
          yearly.intensityScore,
          SOURCE_URL,
          geometry,
          yearly.chargesheetingRate
        ]
      )

      imported++

      console.log(
        `  ${yearly.year}: ${yearly.crimeCount} cases`
      )
    }
  }

  console.log(
    "\nOfficial crime import completed."
  )

  console.log(
    `Imported/updated ${imported} city-year records.`
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