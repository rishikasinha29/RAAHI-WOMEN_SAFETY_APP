export function formatDistance(
  kilometers
) {
  if (kilometers < 1) {
    return `${Math.round(
      kilometers * 1000
    )} m`;
  }

  return `${kilometers.toFixed(1)} km`;
}

export function formatDuration(
  minutes
) {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remaining =
    Math.round(minutes % 60);

  return `${hours}h ${remaining}m`;
}