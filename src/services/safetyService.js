export function getSafetyLabel(
  classification
) {
  switch (classification) {
    case "Green":
      return "Lower estimated hazard exposure";

    case "Yellow":
      return "Moderate estimated hazard exposure";

    case "Red":
      return "Higher estimated hazard exposure";

    default:
      return "Unknown hazard exposure";
  }
}