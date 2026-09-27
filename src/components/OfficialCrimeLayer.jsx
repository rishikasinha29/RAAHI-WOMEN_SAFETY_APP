import { CircleMarker, Popup } from "react-leaflet"

function getIntensityColor(score) {
  if (
    score === null ||
    score === undefined ||
    !Number.isFinite(Number(score))
  ) {
    return "#9ca3af"
  }

  const numericScore = Number(score)

  if (numericScore >= 75) {
    return "#dc2626"
  }

  if (numericScore >= 50) {
    return "#f97316"
  }

  if (numericScore >= 25) {
    return "#f59e0b"
  }

  return "#facc15"
}

function getRadius(score) {
  if (
    score === null ||
    score === undefined ||
    !Number.isFinite(Number(score))
  ) {
    return 8
  }

  const numericScore = Number(score)

  if (numericScore >= 75) {
    return 18
  }

  if (numericScore >= 50) {
    return 15
  }

  if (numericScore >= 25) {
    return 12
  }

  return 9
}

function formatNumber(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "N/A"
  }

  return Number(value).toLocaleString("en-IN")
}

export default function OfficialCrimeLayer({
  data,
}) {
  if (
    !data ||
    !Array.isArray(data.features)
  ) {
    return null
  }

  return (
    <>
      {data.features.map((feature) => {
        const geometry =
          feature?.geometry

        const properties =
          feature?.properties || {}

        if (
          !geometry ||
          geometry.type !== "Point" ||
          !Array.isArray(
            geometry.coordinates
          )
        ) {
          return null
        }

        const [
          longitude,
          latitude,
        ] = geometry.coordinates

        if (
          !Number.isFinite(
            Number(latitude)
          ) ||
          !Number.isFinite(
            Number(longitude)
          )
        ) {
          return null
        }

        const numericLatitude =
          Number(latitude)

        const numericLongitude =
          Number(longitude)

        const score =
          properties.intensityScore

        const color =
          getIntensityColor(score)

        const radius =
          getRadius(score)

        const crimeRate =
          properties.crimeRate

        const chargesheetingRate =
          properties.chargesheetingRate

        return (
          <CircleMarker
            key={
              properties.id ||
              `${numericLatitude}-${numericLongitude}`
            }
            center={[
              numericLatitude,
              numericLongitude,
            ]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.45,
              weight: 3,
            }}
          >
            <Popup>
              <div
                style={{
                  minWidth: "250px",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#111827",
                    marginBottom: "8px",
                  }}
                >
                  Official NCRB Crime Data
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "#374151",
                  }}
                >
                  <div>
                    <b>City:</b>{" "}
                    {properties.areaName ||
                      "N/A"}
                  </div>

                  <div>
                    <b>State:</b>{" "}
                    {properties.stateName ||
                      "N/A"}
                  </div>

                  <div>
                    <b>Crime category:</b>{" "}
                    {properties.crimeCategory ||
                      "N/A"}
                  </div>

                  <div>
                    <b>Recorded cases:</b>{" "}
                    {formatNumber(
                      properties.crimeCount
                    )}
                  </div>

                  <div>
                    <b>Data year:</b>{" "}
                    {properties.sourceYear ||
                      "N/A"}
                  </div>

                  {crimeRate !== null &&
                    crimeRate !== undefined && (
                      <div>
                        <b>
                          Crime rate:
                        </b>{" "}
                        {crimeRate} per 1 lakh
                      </div>
                    )}

                  {chargesheetingRate !==
                    null &&
                    chargesheetingRate !==
                      undefined && (
                      <div>
                        <b>
                          Chargesheeting rate:
                        </b>{" "}
                        {chargesheetingRate}%
                      </div>
                    )}

                  <div>
                    <b>
                      Geographic level:
                    </b>{" "}
                    {properties.areaLevel ||
                      "city"}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "8px",
                    borderTop:
                      "1px solid #e5e7eb",
                    fontSize: "11px",
                    color: "#64748b",
                    lineHeight: 1.5,
                  }}
                >
                  This represents official
                  city-level statistics from
                  the National Crime Records
                  Bureau (NCRB). It is not an
                  exact crime-location marker.
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}