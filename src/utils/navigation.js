const EARTH_RADIUS_METERS = 6371000

function toRadians(value) {
  return (value * Math.PI) / 180
}

function distanceMeters(a, b) {
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)

  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)

  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  )
}

function normalizeCoordinate(coord) {
  if (!Array.isArray(coord) || coord.length < 2) {
    return null
  }

  // GeoJSON/OSRM = [longitude, latitude]
  const lon = Number(coord[0])
  const lat = Number(coord[1])

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  return { lat, lon }
}

function getRouteCoordinates(route) {
  const geometry = route?.geometry

  if (!geometry) {
    return []
  }

  if (
    geometry.type === "LineString" &&
    Array.isArray(geometry.coordinates)
  ) {
    return geometry.coordinates
      .map(normalizeCoordinate)
      .filter(Boolean)
  }

  if (Array.isArray(geometry)) {
    return geometry.map(normalizeCoordinate).filter(Boolean)
  }

  return []
}

function projectPointToSegment(point, start, end) {
  const latitudeScale = Math.cos(toRadians(point.lat))

  const x =
    toRadians(point.lon) *
    EARTH_RADIUS_METERS *
    latitudeScale

  const y =
    toRadians(point.lat) *
    EARTH_RADIUS_METERS

  const x1 =
    toRadians(start.lon) *
    EARTH_RADIUS_METERS *
    latitudeScale

  const y1 =
    toRadians(start.lat) *
    EARTH_RADIUS_METERS

  const x2 =
    toRadians(end.lon) *
    EARTH_RADIUS_METERS *
    latitudeScale

  const y2 =
    toRadians(end.lat) *
    EARTH_RADIUS_METERS

  const dx = x2 - x1
  const dy = y2 - y1

  const segmentLengthSquared = dx * dx + dy * dy

  let t = 0

  if (segmentLengthSquared > 0) {
    t =
      ((x - x1) * dx + (y - y1) * dy) /
      segmentLengthSquared
  }

  t = Math.max(0, Math.min(1, t))

  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lon: start.lon + (end.lon - start.lon) * t,
    t,
  }
}

function formatDistance(km) {
  if (!Number.isFinite(km)) {
    return "--"
  }

  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }

  return `${km.toFixed(1)} km`
}

function formatETA(minutes) {
  if (!Number.isFinite(minutes)) {
    return "--"
  }

  if (minutes <= 0.5) {
    return "Arriving"
  }

  if (minutes < 60) {
    return `${Math.ceil(minutes)} min`
  }

  const hours = Math.floor(minutes / 60)
  const mins = Math.ceil(minutes % 60)

  if (mins === 0) {
    return `${hours} hr`
  }

  return `${hours} hr ${mins} min`
}

export function getNavigationMetrics(location, route) {
  if (!location || !route) {
    return null
  }

  const user = {
    lat: Number(location.latitude ?? location.lat),
    lon: Number(location.longitude ?? location.lon),
  }

  if (!Number.isFinite(user.lat) || !Number.isFinite(user.lon)) {
    return null
  }

  const coordinates = getRouteCoordinates(route)

  if (coordinates.length < 2) {
    return null
  }

  /*
   * Build cumulative distance along the actual route geometry.
   */
  const cumulativeDistances = [0]

  for (let i = 1; i < coordinates.length; i++) {
    const segmentDistance = distanceMeters(
      coordinates[i - 1],
      coordinates[i]
    )

    cumulativeDistances.push(
      cumulativeDistances[i - 1] + segmentDistance
    )
  }

  const geometryTotalMeters =
    cumulativeDistances[cumulativeDistances.length - 1]

  /*
   * Find the point on the route geometry closest to the
   * user's CURRENT GPS position.
   */
  let bestProjection = null
  let bestDistanceToRoute = Infinity
  let bestSegmentIndex = 0

  for (let i = 0; i < coordinates.length - 1; i++) {
    const projection = projectPointToSegment(
      user,
      coordinates[i],
      coordinates[i + 1]
    )

    const distanceToProjection = distanceMeters(
      user,
      projection
    )

    if (distanceToProjection < bestDistanceToRoute) {
      bestDistanceToRoute = distanceToProjection
      bestProjection = projection
      bestSegmentIndex = i
    }
  }

  if (!bestProjection) {
    return null
  }

  /*
   * Distance travelled along the route up to the projection.
   */
  const distanceAlongGeometry =
    cumulativeDistances[bestSegmentIndex] +
    distanceMeters(
      coordinates[bestSegmentIndex],
      bestProjection
    )

  /*
   * Remaining distance on the route.
   */
  const remainingGeometryMeters = Math.max(
    0,
    geometryTotalMeters - distanceAlongGeometry
  )

  /*
   * Backend route.distance is already in KM.
   * Backend route.duration is already in MINUTES.
   */
  const backendDistanceKm = Number(route.distance)
  const backendDurationMin = Number(route.duration)

  /*
   * Scale the geometry-based remaining distance to the
   * backend's official route distance so minor geometry/
   * rounding differences do not distort the displayed value.
   */
  let remainingDistanceKm =
    remainingGeometryMeters / 1000

  if (
    Number.isFinite(backendDistanceKm) &&
    backendDistanceKm > 0 &&
    geometryTotalMeters > 0
  ) {
    const geometryTotalKm =
      geometryTotalMeters / 1000

    const scale =
      backendDistanceKm / geometryTotalKm

    remainingDistanceKm *= scale
  }

  /*
   * Estimate ETA using the same average speed implied by
   * the backend route:
   *
   * speed = total distance / total duration
   */
  let etaMinutes = 0

  if (
    Number.isFinite(backendDistanceKm) &&
    backendDistanceKm > 0 &&
    Number.isFinite(backendDurationMin) &&
    backendDurationMin > 0
  ) {
    const averageSpeedKmPerHour =
      backendDistanceKm / (backendDurationMin / 60)

    etaMinutes =
      (remainingDistanceKm /
        averageSpeedKmPerHour) *
      60
  }

  if (remainingDistanceKm < 0.01) {
    remainingDistanceKm = 0
    etaMinutes = 0
  }

  /*
   * Basic turn instruction based on upcoming geometry.
   */
  let instruction = "Continue on the route"

  const nextIndex = Math.min(
    bestSegmentIndex + 2,
    coordinates.length - 1
  )

  if (nextIndex > bestSegmentIndex + 1) {
    const current = coordinates[bestSegmentIndex]
    const next = coordinates[nextIndex]

    const angle = Math.atan2(
      next.lat - current.lat,
      next.lon - current.lon
    )

    const degrees = (angle * 180) / Math.PI

    if (degrees >= 45 && degrees < 135) {
      instruction = "Continue north"
    } else if (degrees >= -45 && degrees < 45) {
      instruction = "Continue east"
    } else if (degrees >= -135 && degrees < -45) {
      instruction = "Continue south"
    } else {
      instruction = "Continue west"
    }
  }

  const offRoute =
    bestDistanceToRoute > 100

  return {
    remainingDistanceKm,
    remainingDistanceMeters:
      remainingDistanceKm * 1000,

    distance: remainingDistanceKm,
    distanceText: formatDistance(remainingDistanceKm),

    etaMinutes,
    duration: etaMinutes,
    etaText: formatETA(etaMinutes),

    instruction,
    nextTurn: instruction,
    turnInstruction: instruction,

    distanceFromRouteMeters: bestDistanceToRoute,
    offRoute,

    userPosition: user,
    nearestRoutePoint: bestProjection,

    routeTotalDistanceKm: backendDistanceKm,
    routeTotalDurationMin: backendDurationMin,
  }
}