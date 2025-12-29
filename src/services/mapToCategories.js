import { BIOMARKER_CATALOG } from "../config/biomarkerCatalog.js";

export function mapToCategories(evaluated) {
  const categorized = {};

  for (const [biomarker, data] of Object.entries(evaluated)) {
    const meta = BIOMARKER_CATALOG[biomarker];
    if (!meta) continue;

    const category = meta.category;

    if (!categorized[category]) {
      categorized[category] = {};
    }

    categorized[category][biomarker] = data;
  }

  return categorized;
}
