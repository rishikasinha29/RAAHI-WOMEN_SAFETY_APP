export const EMERGENCY_NUMBER =
  import.meta.env.VITE_EMERGENCY_NUMBER ||
  "112";

export const HAZARD_TYPES = [
  "Harassment",
  "Dark Alley",
  "Bad Crowd",
  "Poor Lighting",
  "Other",
];

export const ROUTE_CLASSIFICATIONS = {
  Green: {
    label: "Lower estimated hazard exposure",
  },

  Yellow: {
    label: "Moderate estimated hazard exposure",
  },

  Red: {
    label: "Higher estimated hazard exposure",
  },
};