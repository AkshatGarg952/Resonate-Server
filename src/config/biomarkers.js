// src/config/biomarkers.config.js

export const BIOMARKERS = {
  vitamin_d: {
    key: "vitamin_d",
    name: "Vitamin D",
    unit: "ng/mL",
    ranges: {
      male: { min: 30, max: 100 },
      female: { min: 30, max: 100 },
    },
  },

  ferritin: {
    key: "ferritin",
    name: "Ferritin",
    unit: "ng/mL",
    ranges: {
      male: { min: 30, max: 400 },
      female: { min: 13, max: 150 },
    },
  },

  serum_creatinine: {
    key: "serum_creatinine",
    name: "Serum Creatinine",
    unit: "mg/dL",
    ranges: {
      male: { min: 0.7, max: 1.3 },
      female: { min: 0.6, max: 1.1 },
    },
  },

  hba1c: {
    key: "hba1c",
    name: "HbA1c",
    unit: "%",
    ranges: {
      male: { min: 4.0, max: 5.6 },
      female: { min: 4.0, max: 5.6 },
    },
  },

  // 🔁 ADD ALL 140 HERE (ONLY DATA, NO LOGIC)
};
