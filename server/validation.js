import { z } from "zod";

export const coordinateSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lon: z.number().finite().min(-180).max(180),
});

export const hazardSchema = z.object({
  category: z.enum([
    "Harassment",
    "Dark Alley",
    "Bad Crowd",
    "Poor Lighting",
    "Other",
  ]),

  description: z
    .string()
    .trim()
    .min(3)
    .max(1000),

  severity: z
    .number()
    .int()
    .min(1)
    .max(5),

  lat: z
    .number()
    .finite()
    .min(-90)
    .max(90),

  lon: z
    .number()
    .finite()
    .min(-180)
    .max(180),

  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default(""),

  occurredAt: z
    .string()
    .datetime()
    .optional(),

  anonymous:
    z.boolean()
      .optional()
      .default(true),
})

export const routeSchema = z.object({
  source: coordinateSchema,
  destination: coordinateSchema,
});

export const sosSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lon: z.number().finite().min(-180).max(180),
});