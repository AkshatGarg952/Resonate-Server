export const BIOMARKER_REFERENCE = {
  hemoglobin: {
    unit: "g/dL",
    male: { min: 13, max: 17 },
    female: { min: 12, max: 16 }
  },

  fastingGlucose: {
    unit: "mg/dL",
    default: { min: 70, max: 100 }
  },

  hba1c: {
    unit: "%",
    default: { min: 4.0, max: 5.6 }
  },

  tsh: {
    unit: "µIU/mL",
    default: { min: 0.4, max: 4.0 }
  },

  vitaminD: {
    unit: "ng/mL",
    default: { min: 30, max: 100 }
  },

  cortisol: {
    unit: "mcg/dL",
    AM: { min: 6.2, max: 19.4 },
    PM: { min: 2.3, max: 11.9 }
  },

  ldl: {
    unit: "mg/dL",
    default: { min: 0, max: 100 }
  },

  hdl: {
    unit: "mg/dL",
    male: { min: 40, max: 1000 },
    female: { min: 50, max: 1000 }
  },

  triglycerides: {
    unit: "mg/dL",
    default: { min: 0, max: 150 }
  },

  alt: {
    unit: "U/L",
    male: { min: 10, max: 40 },
    female: { min: 7, max: 35 }
  },

  ast: {
    unit: "U/L",
    male: { min: 15, max: 40 },
    female: { min: 13, max: 35 }
  }
};
