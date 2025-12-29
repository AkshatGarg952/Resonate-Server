import { BIOMARKER_REFERENCE } from "../config/biomarkerReference.js";

export function evaluateBiomarkers({ extractedValues, user, metadata }) {
  const evaluated = {};

  for (const [biomarker, value] of Object.entries(extractedValues)) {
    if (value == null) {
      evaluated[biomarker] = {
        value: null,
        status: null
      };
      continue;
    }

    const ref = BIOMARKER_REFERENCE[biomarker];
   
    
    if (!ref) {
      evaluated[biomarker] = {
        value,
        status: null
      };
      continue;
    }

    let range =
      ref[user.gender] ||
      ref[metadata?.testTime] ||
      ref.default;

    if (!range) {
      evaluated[biomarker] = {
        value,
        status: null
      };
      continue;
    }

    const status =
      value < range.min || value > range.max ? "bad" : "good";

    evaluated[biomarker] = {
      value,
      status,
      unit: ref.unit,
      referenceRange: `${range.min}-${range.max}`
    };
  }

  return evaluated;
}
