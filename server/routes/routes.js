import express from "express";
import { routeSchema } from "../validation.js";
import { getRoutes } from "../services/routing.js";
import {
  analyzeRouteSafety,
  analyzeRouteSegmentsSafety,
} from "../services/routeSafety.js";
import {
  analyzeRoute,
  analyzeRouteSegments,
} from "../services/hazardAnalysis.js";
import {
  calculateRouteScore,
} from "../scoring.js";

const router = express.Router();

function formatInstruction(step) {
  const type =
    step.maneuver?.type || "continue";

  const modifier =
    step.maneuver?.modifier || "";

  const road =
    step.name
      ? ` on ${step.name}`
      : "";

  const readableType = {
    turn: "Turn",
    new_name: "Continue",
    depart: "Start",
    arrive: "Arrive",
    merge: "Merge",
    fork: "Take the fork",
    roundabout: "Enter the roundabout",
    rotary: "Enter the rotary",
    continue: "Continue",
    end_of_road: "At the end of the road",
  }[type] || "Continue";

  return `${readableType} ${modifier}${road}`
    .replace(/\s+/g, " ")
    .trim();
}

router.post("/analyze", async (req, res, next) => {
  try {
    const parsed =
      routeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid route request.",
        details: parsed.error.flatten(),
      });
    }

    const {
      source,
      destination,
    } = parsed.data;

    const osrmRoutes =
      await getRoutes(
        source,
        destination
      );

    const routes = [];

    for (
      let index = 0;
      index < osrmRoutes.length;
      index++
    ) {
      const route = osrmRoutes[index];

      /*
       * EXISTING COMMUNITY HAZARD ANALYSIS
       */
      const hazards =
        await analyzeRoute(
          route.geometry,
          500
        );

      const hazardScore =
        calculateRouteScore(hazards);

      /*
       * COMPLETE ROUTE SAFETY ANALYSIS
       *
       * Combines:
       * - news-derived crime incidents
       * - community-reported hazards
       */
      const safety =
        await analyzeRouteSafety(
          route.geometry,
          {
            corridorMeters: 200,
            lookbackDays: 730,
            crimeWeight: 0.6,
            hazardWeight: 0.4,
          }
        );

      /*
       * NAVIGATION INSTRUCTIONS
       */
      const steps =
        route.legs?.flatMap(
          (leg) =>
            leg.steps?.map((step) => ({
              distance: step.distance,
              duration: step.duration,
              instruction:
                formatInstruction(step),
            })) || []
        ) || [];

      /*
       * EXISTING ROUTE SEGMENT ANALYSIS
       */
      const rawSegments =
        route.legs?.flatMap(
          (leg) =>
            leg.steps || []
        ) || [];

      const analyzedSegments =
        await analyzeRouteSegments(
          rawSegments,
          200
        );

      /*
       * CRIME + HAZARD ANALYSIS FOR EACH
       * ROUTE SEGMENT
       */
      const analyzedCrimeSegments =
        await analyzeRouteSegmentsSafety(
          analyzedSegments,
          {
            corridorMeters: 200,
            hazardRadius: 200,
            lookbackDays: 730,
            crimeWeight: 0.6,
            hazardWeight: 0.4,
          }
        );

      /*
       * FINAL SEGMENT OBJECTS
       */
      const segments =
        analyzedSegments.map(
          (segment, segmentIndex) => {
            const baseScore =
              calculateRouteScore(
                segment.hazards
              );

            const segmentSafety =
              analyzedCrimeSegments[
                segmentIndex
              ];

            return {
              index:
                segment.index,

              name:
                segment.name,

              distance:
                segment.distance,

              duration:
                segment.duration,

              geometry:
                segment.geometry,

              /*
               * COMBINED SAFETY SCORE
               */
              score:
                segmentSafety?.safetyScore ??
                baseScore.score,

              classification:
                segmentSafety?.classification ??
                baseScore.classification,

              risk:
                segmentSafety?.riskScore ??
                baseScore.risk,
              
              riskScore:
                segmentSafety?.riskScore ??
                baseScore.risk,

              safetyScore:
                segmentSafety?.safetyScore ??
                baseScore.score,

              /*
               * COMMUNITY HAZARDS
               */
              hazardCount:
                baseScore.hazardCount,

              hazards:
                segment.hazards,

              /*
               * NEWS CRIME DATA
               */
              crime:
                segmentSafety?.crime ?? {
                  incidentCount: 0,
                  riskScore: 0,
                  normalizedRisk: 0,
                  incidents: [],
                },

              /*
               * SEGMENT HAZARD SAFETY DATA
               */
              safetyHazards:
                segmentSafety?.hazards ?? {
                  count: 0,
                  riskScore: 0,
                  details: [],
                },
            };
          }
        );

      /*
       * FINAL ROUTE OBJECT
       */
      routes.push({
        id:
          `route-${index}`,

        name:
          index === 0
            ? "Recommended Route"
            : `Alternative ${index}`,

        distance:
          Number(
            (route.distance / 1000).toFixed(2)
          ),

        duration:
          Math.round(
            route.duration / 60
          ),

        geometry:
          route.geometry,

        /*
         * COMBINED ROUTE SAFETY SCORE
         */
        score:
          safety.safetyScore,

        classification:
          safety.classification,

        risk:
          safety.riskScore,

        /*
         * ORIGINAL COMMUNITY HAZARD DATA
         */
        hazardCount:
          hazardScore.hazardCount,

        hazards,

        /*
         * COMPLETE SAFETY DATA
         */
        safetyScore:
          safety.safetyScore,

        safetyRiskScore:
          safety.riskScore,

        crime: {
          incidentCount:
            safety.crime.incidentCount,

          riskScore:
            safety.crime.riskScore,

          normalizedRisk:
            safety.crime.normalizedRisk,

          corridorMeters:
            safety.crime.corridorMeters,

          lookbackDays:
            safety.crime.lookbackDays,

          incidents:
            safety.crime.incidents,
        },

        safetyHazards: {
          count:
            safety.hazards.count,

          riskScore:
            safety.hazards.riskScore,
        },

        safetyWeights:
          safety.weights,

        steps,

        segments,
      });
    }

    /*
     * Return all route alternatives.
     */
    res.json({
      routes,
    });

  } catch (error) {
    next(error);
  }
});

export default router;