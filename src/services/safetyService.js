function distanceBetweenPoints(
  point1,
  point2
) {
  const latDifference =
    point1[0] - point2[0]

  const lonDifference =
    point1[1] - point2[1]

  return Math.sqrt(
    latDifference ** 2 +
    lonDifference ** 2
  )
}

export function calculateSafetyScore(
  route,
  hazards
) {
  let hazardCount = 0

  for (const hazard of hazards) {

    for (
      const coordinate
      of route.coordinates
    ) {

      const distance =
        distanceBetweenPoints(
          coordinate,
          hazard.position
        )

      /*
       * Approximate threshold.
       * This will be improved later using
       * proper geospatial calculations/PostGIS.
       */

      if (distance < 0.002) {
        hazardCount++

        break
      }
    }
  }

  const score =
    Math.max(
      0,
      100 - hazardCount * 10
    )

  return {
    score,
    hazardCount,
  }
}