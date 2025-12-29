export const BIOMARKER_CATALOG = {

  hemoglobin: {
    unit: "g/dL",
    category: "cbc",
    genderSpecific: true
  },
  wbcCount: {
    unit: "cells/mm³",
    category: "cbc"
  },
  rbcCount: {
    unit: "million/mm³",
    category: "cbc",
    genderSpecific: true
  },
  plateletCount: {
    unit: "per µL",
    category: "cbc"
  },

  fastingGlucose: {
    unit: "mg/dL",
    category: "glucose"
  },
  hba1c: {
    unit: "%",
    category: "glucose"
  },
  fastingInsulin: {
    unit: "µIU/mL",
    category: "glucose"
  },

  hdl: {
    unit: "mg/dL",
    category: "heart",
    genderSpecific: true
  },
  ldl: {
    unit: "mg/dL",
    category: "heart"
  },
  triglycerides: {
    unit: "mg/dL",
    category: "heart"
  },

  tsh: {
    unit: "µIU/mL",
    category: "thyroid"
  },
  freeT3: {
    unit: "pg/mL",
    category: "thyroid"
  },
  freeT4: {
    unit: "ng/dL",
    category: "thyroid"
  },

  cortisol: {
    unit: "mcg/dL",
    category: "hormones",
    timeDependent: true
  },
  estradiol: {
    unit: "pg/mL",
    category: "hormones",
    cycleDependent: true
  },
  testosteroneTotal: {
    unit: "ng/dL",
    category: "hormones",
    genderSpecific: true
  },

  serumCreatinine: {
    unit: "mg/dL",
    category: "kidney",
    genderSpecific: true
  },
  sodium: {
    unit: "mmol/L",
    category: "kidney"
  },
  potassium: {
    unit: "mmol/L",
    category: "kidney"
  },

  alt: {
    unit: "U/L",
    category: "liver",
    genderSpecific: true
  },
  ast: {
    unit: "U/L",
    category: "liver",
    genderSpecific: true
  },

};
