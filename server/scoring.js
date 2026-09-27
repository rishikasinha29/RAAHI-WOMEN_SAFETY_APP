const SEVERITY_WEIGHT = {
  1: 0.2,
  2: 0.4,
  3: 0.6,
  4: 0.8,
  5: 1.0,
};

const ANALYSIS_RADIUS_METERS = 500;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function calculateHazardRisk(hazard) {
  const severityWeight =
    SEVERITY_WEIGHT[hazard.severity] ?? 0.2;

  const distance =
    Number(hazard.distance_m) || 0;

  const proximityWeight = clamp(
    1 - distance / ANALYSIS_RADIUS_METERS,
    0,
    1
  );

  const ageDays =
    Math.max(
      0,
      Date.now() -
        new Date(hazard.occurred_at).getTime()
    ) /
    (1000 * 60 * 60 * 24);

  const recencyWeight = Math.max(
    0.2,
    Math.exp(-ageDays / 30)
  );

  const confidence = clamp(
    Number(hazard.confidence) || 0.5,
    0.1,
    1
  );

  return (
    severityWeight *
    proximityWeight *
    recencyWeight *
    confidence
  );
}

export function calculateRouteScore(hazards) {
  if (!Array.isArray(hazards) || hazards.length === 0) {
    return {
      score: 100,
      classification: "Green",
      risk: 0,
      hazardCount: 0,
    };
  }

  const risk = hazards.reduce(
    (total, hazard) =>
      total + calculateHazardRisk(hazard),
    0
  );

  const normalizedRisk = clamp(
    risk * 18,
    0,
    100
  );

  const score = Math.round(
    100 - normalizedRisk
  );

  let classification;

  if (score >= 70) {
    classification = "Green";
  } else if (score >= 40) {
    classification = "Yellow";
  } else {
    classification = "Red";
  }

  return {
    score,
    classification,
    risk: Number(risk.toFixed(4)),
    hazardCount: hazards.length,
  };
}