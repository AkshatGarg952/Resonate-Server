// src/services/biomarkerEvaluation.service.js

import { BIOMARKERS } from "../config/biomarkers.config.js";
import { evaluateValueAgainstRange } from "../utils/range.utils.js";

export function evaluateBiomarkers({
  extractedBiomarkers,
  gender,
}) {
  const evaluated = {};

  for (const key of Object.keys(BIOMARKERS)) {
    const config = BIOMARKERS[key];
    const extracted = extractedBiomarkers[key] || { value: null };

    const range = config.ranges[gender];

    const evaluation = evaluateValueAgainstRange(
      extracted.value,
      range
    );

    evaluated[key] = {
      key,
      name: config.name,
      value: extracted.value,
      unit: config.unit,
      status: evaluation.status,
      reason: evaluation.reason,
      rangeUsed: `${range.min}-${range.max}`,
    };
  }

  return evaluated;
}
