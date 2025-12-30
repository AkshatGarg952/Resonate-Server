// src/services/biomarkerCategorization.service.js

import { BIOMARKER_CATEGORIES } from "../config/biomarkerCategories.config.js";

export function categorizeBiomarkers(evaluatedBiomarkers) {
  const categorized = {};

  for (const [category, biomarkerKeys] of Object.entries(
    BIOMARKER_CATEGORIES
  )) {
    categorized[category] = biomarkerKeys
      .map((key) => evaluatedBiomarkers[key])
      .filter(Boolean);
  }

  return categorized;
}
