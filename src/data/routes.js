export const routes = [
  {
    id: "safe",
    name: "Safest Route",
    safety: "High",
    color: "green",
    travelTime: "18 min",
    distance: "4.2 km",
    description: "Well-lit route with fewer reported hazards.",
    coordinates: [
      [23.2599, 77.4126],
      [23.2620, 77.4170],
      [23.2650, 77.4200],
      [23.2680, 77.4250],
    ],
  },

  {
    id: "moderate",
    name: "Balanced Route",
    safety: "Moderate",
    color: "yellow",
    travelTime: "15 min",
    distance: "3.7 km",
    description: "Moderate safety with some reported issues.",
    coordinates: [
      [23.2599, 77.4126],
      [23.2570, 77.4180],
      [23.2600, 77.4230],
      [23.2680, 77.4250],
    ],
  },

  {
    id: "unsafe",
    name: "Fastest Route",
    safety: "Low",
    color: "red",
    travelTime: "12 min",
    distance: "3.1 km",
    description: "Shortest route but contains several reported hazards.",
    coordinates: [
      [23.2599, 77.4126],
      [23.2540, 77.4160],
      [23.2560, 77.4220],
      [23.2680, 77.4250],
    ],
  },
]