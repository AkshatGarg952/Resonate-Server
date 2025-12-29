const categorizedBiomarkersSchema = new mongoose.Schema(
  {
    generalHealth: {
      hemoglobin: biomarkerSchema,
      vitaminD: biomarkerSchema,
      vitaminB12: biomarkerSchema,
      hba1c: biomarkerSchema,
      cortisol: biomarkerSchema,
      creatinine: biomarkerSchema,
      uricAcid: biomarkerSchema,
      calcium: biomarkerSchema,
      ferritin: biomarkerSchema,
      magnesium: biomarkerSchema,
      iron: biomarkerSchema,
    },

    sleepStatus: {
      vitaminD: biomarkerSchema,
      cortisol: biomarkerSchema,
      magnesium: biomarkerSchema,
      ferritin: biomarkerSchema,
      iron: biomarkerSchema,
      fastingGlucose: biomarkerSchema,
      hba1c: biomarkerSchema,
      hsCRP: biomarkerSchema,
      tsh: biomarkerSchema,
      freeT3: biomarkerSchema,
      hemoglobin: biomarkerSchema,
      rbcCount: biomarkerSchema,
    },

    inflammationStatus: {
      homocysteine: biomarkerSchema,
      hsCRP: biomarkerSchema,
      esr: biomarkerSchema,
      fastingInsulin: biomarkerSchema,
      uricAcid: biomarkerSchema,
      ferritin: biomarkerSchema,
      igE: biomarkerSchema,
      wbcCount: biomarkerSchema,
    },

    heartHealth: {
      hsCRP: biomarkerSchema,
      homocysteine: biomarkerSchema,
      apoA1: biomarkerSchema,
      apoB: biomarkerSchema,
      lipoproteinA: biomarkerSchema,
      triglycerides: biomarkerSchema,
      ldl: biomarkerSchema,
      vldl: biomarkerSchema,
      hdl: biomarkerSchema,
    },

    fatigue: {
      cortisol: biomarkerSchema,
      vitaminD: biomarkerSchema,
      vitaminB12: biomarkerSchema,
      fastingGlucose: biomarkerSchema,
      fastingInsulin: biomarkerSchema,
      hba1c: biomarkerSchema,
      iron: biomarkerSchema,
      ferritin: biomarkerSchema,
      freeT3: biomarkerSchema,
      freeT4: biomarkerSchema,
      tsh: biomarkerSchema,
      sodium: biomarkerSchema,
      potassium: biomarkerSchema,
      chloride: biomarkerSchema,
      hemoglobin: biomarkerSchema,
      rbcCount: biomarkerSchema,
    },

    glucoseRegulation: {
      hba1c: biomarkerSchema,
      homaIR: biomarkerSchema, // calculated
      fastingGlucose: biomarkerSchema,
      fastingInsulin: biomarkerSchema,
      triglycerides: biomarkerSchema,
      ldl: biomarkerSchema,
      vldl: biomarkerSchema,
      hdl: biomarkerSchema,
    },

    hairHealth: {
      vitaminD: biomarkerSchema,
      vitaminB12: biomarkerSchema,
      iron: biomarkerSchema,
      ferritin: biomarkerSchema,
      hsCRP: biomarkerSchema,
      testosteroneFree: biomarkerSchema,
      testosteroneTotal: biomarkerSchema,
      dihydrotestosterone: biomarkerSchema,
      estradiol: biomarkerSchema,
      freeT3: biomarkerSchema,
      freeT4: biomarkerSchema,
      tsh: biomarkerSchema,
    },

    hormoneHealth: {
      testosteroneFree: biomarkerSchema,
      testosteroneTotal: biomarkerSchema,
      cortisol: biomarkerSchema,
      estradiol: biomarkerSchema,
      freeT3: biomarkerSchema,
      freeT4: biomarkerSchema,
      tsh: biomarkerSchema,
      shbg: biomarkerSchema,
      dheaS: biomarkerSchema,
      prolactin: biomarkerSchema,
      amh: biomarkerSchema,
    },

    cholesterolAssessment: {
      hdl: biomarkerSchema,
      ldl: biomarkerSchema,
      totalCholesterol: biomarkerSchema,
      triglycerides: biomarkerSchema,
      vldl: biomarkerSchema,
      apoB: biomarkerSchema,
    },

    liverDetox: {
      albumin: biomarkerSchema,
      alkalinePhosphatase: biomarkerSchema,
      directBilirubin: biomarkerSchema,
      indirectBilirubin: biomarkerSchema,
      totalBilirubin: biomarkerSchema,
      ast: biomarkerSchema,
      alt: biomarkerSchema,
      ggt: biomarkerSchema,
    },

    micronutrients: {
      iron: biomarkerSchema,
      vitaminB12: biomarkerSchema,
      vitaminD: biomarkerSchema,
      calcium: biomarkerSchema,
      magnesium: biomarkerSchema,
      vitaminB9: biomarkerSchema, // Folate
    },

    kidneyHealth: {
      bloodUrea: biomarkerSchema,
      bun: biomarkerSchema,
      creatinine: biomarkerSchema,
      egfr: biomarkerSchema, // calculated
      sodium: biomarkerSchema,
      potassium: biomarkerSchema,
      chloride: biomarkerSchema,
      uricAcid: biomarkerSchema,
    },

    riskAssessment: {
      ldh: biomarkerSchema,
      cpk: biomarkerSchema,
      raFactor: biomarkerSchema,
      il6: biomarkerSchema,                 // Interleukin-6
      hbsAg: biomarkerSchema,               // Hepatitis B
      hcvAntibody: biomarkerSchema,         // Hepatitis C
      lithium: biomarkerSchema,
      transferrinSaturation: biomarkerSchema,
      uibc: biomarkerSchema,                // Unbound Iron Binding Capacity
      tibc: biomarkerSchema,                // Total Iron Binding Capacity
    },

    completeBloodCount: {
      hemoglobin: biomarkerSchema,
      hematocrit: biomarkerSchema,
      rbcCount: biomarkerSchema,
      wbcCount: biomarkerSchema,
      plateletCount: biomarkerSchema,
      mcv: biomarkerSchema,
      mch: biomarkerSchema,
      mchc: biomarkerSchema,
      rdw: biomarkerSchema,
      neutrophils: biomarkerSchema,
      lymphocytes: biomarkerSchema,
      monocytes: biomarkerSchema,
      eosinophils: biomarkerSchema,
      basophils: biomarkerSchema,
    },
  },
  { _id: false }
);
