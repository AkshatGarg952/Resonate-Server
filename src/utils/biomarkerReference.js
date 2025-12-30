/**
 * Comprehensive Biomarker Reference Ranges
 * Indian Pathology Reference Ranges
 * Supports 140+ biomarkers across 10-12 categories
 */

export const BIOMARKER_CATEGORIES = {
  GENERAL_HEALTH: "General Health",
  SLEEP_STATUS: "Sleep Status",
  INFLAMMATION_STATUS: "Inflammation Status",
  HEART_HEALTH: "Heart Health",
  LIPID_PROFILE: "Lipid Profile",
  LIVER_FUNCTION: "Liver Function",
  KIDNEY_FUNCTION: "Kidney Function",
  THYROID_FUNCTION: "Thyroid Function",
  COMPLETE_BLOOD_COUNT: "Complete Blood Count",
  DIABETES_MARKERS: "Diabetes Markers",
  HORMONAL_PROFILE: "Hormonal Profile",
  VITAMINS_MINERALS: "Vitamins & Minerals",
  CARDIAC_MARKERS: "Cardiac Markers",
  IMMUNE_SYSTEM: "Immune System"
};

/**
 * Biomarker reference ranges configuration
 * Each biomarker can have:
 * - simpleRange: [min, max] for gender-neutral ranges
 * - genderRange: { male: [min, max], female: [min, max] }
 * - timeRange: { am: [min, max], pm: [min, max] } for time-specific ranges
 * - categoricalRange: { ranges: [{ min, max, label }] } for categorical ranges like HbA1c
 * - unit: measurement unit
 * - category: category name
 */
export const BIOMARKER_RANGES = {
  // General Health Category
  "vitamin_b12": {
    unit: "pg/mL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    simpleRange: [211, 911],
    notes: "Critical for nerve health"
  },
  "vitamin_d": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    simpleRange: [30, 100],
    optimal: 40,
    notes: "Optimal: >40 ng/mL"
  },
  "hs_crp": {
    unit: "mg/L",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    categoricalRange: {
      ranges: [
        { min: 0, max: 1.0, label: "Low risk" },
        { min: 1.0, max: 3.0, label: "Moderate risk" },
        { min: 3.0, max: Infinity, label: "High risk" }
      ]
    },
    notes: "Inflammation marker"
  },
  "homocysteine": {
    unit: "µmol/L",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    simpleRange: [5, 15],
    notes: "Higher = increased cardiovascular risk"
  },
  "hba1c": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    categoricalRange: {
      ranges: [
        { min: 4.0, max: 5.6, label: "Normal" },
        { min: 5.7, max: 6.4, label: "Prediabetes" },
        { min: 6.5, max: Infinity, label: "Diabetes" }
      ]
    }
  },
  "cortisol": {
    unit: "mcg/dL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    timeRange: {
      am: [6.2, 19.4],
      pm: [2.3, 11.9]
    },
    notes: "Stress hormone"
  },
  "serum_creatinine": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    genderRange: {
      male: [0.7, 1.3],
      female: [0.6, 1.1]
    }
  },
  "uric_acid": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    genderRange: {
      male: [3.5, 7.2],
      female: [2.6, 6.0]
    }
  },
  "calcium": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    simpleRange: [8.5, 10.5]
  },
  "ferritin": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    genderRange: {
      male: [30, 400],
      female: [13, 150]
    }
  },
  "magnesium": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    simpleRange: [1.7, 2.2]
  },
  "iron": {
    unit: "µg/dL",
    category: BIOMARKER_CATEGORIES.GENERAL_HEALTH,
    genderRange: {
      male: [65, 175],
      female: [50, 170]
    }
  },

  // Inflammation Status Category
  "esr": {
    unit: "mm/hr",
    category: BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
    genderRange: {
      male: [0, 15],
      female: [0, 20]
    }
  },
  "fasting_insulin": {
    unit: "µIU/mL",
    category: BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
    simpleRange: [2.0, 25.0]
  },
  "immunoglobulin_e": {
    unit: "KUI/L",
    category: BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
    simpleRange: [0, 100]
  },
  "white_blood_cell_count": {
    unit: "cells/mm³",
    category: BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
    simpleRange: [4000, 11000]
  },

  // Lipid Profile Category
  "total_cholesterol": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIPID_PROFILE,
    simpleRange: [0, 200]
  },
  "hdl": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIPID_PROFILE,
    genderRange: {
      male: [40, 200],
      female: [50, 200]
    }
  },
  "ldl": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIPID_PROFILE,
    simpleRange: [0, 100]
  },
  "triglycerides": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIPID_PROFILE,
    simpleRange: [0, 150]
  },
  "vldl": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIPID_PROFILE,
    simpleRange: [5, 40]
  },
  "total_cholesterol_hdl_ratio": {
    unit: "ratio",
    category: BIOMARKER_CATEGORIES.LIPID_PROFILE,
    simpleRange: [0, 5.0]
  },

  // Liver Function Category
  "alt": {
    unit: "U/L",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    genderRange: {
      male: [7, 56],
      female: [7, 56]
    }
  },
  "ast": {
    unit: "U/L",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    genderRange: {
      male: [10, 40],
      female: [10, 40]
    }
  },
  "alkaline_phosphatase": {
    unit: "U/L",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    genderRange: {
      male: [44, 147],
      female: [38, 126]
    }
  },
  "total_bilirubin": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    simpleRange: [0.2, 1.2]
  },
  "direct_bilirubin": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    simpleRange: [0.0, 0.3]
  },
  "indirect_bilirubin": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    simpleRange: [0.2, 0.9]
  },
  "albumin": {
    unit: "g/dL",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    simpleRange: [3.5, 5.0]
  },
  "total_protein": {
    unit: "g/dL",
    category: BIOMARKER_CATEGORIES.LIVER_FUNCTION,
    simpleRange: [6.0, 8.3]
  },

  // Kidney Function Category
  "blood_urea_nitrogen": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    simpleRange: [7, 20]
  },
  "urea": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    simpleRange: [15, 45]
  },
  "creatinine_clearance": {
    unit: "mL/min",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    genderRange: {
      male: [97, 137],
      female: [88, 128]
    }
  },
  "egfr": {
    unit: "mL/min/1.73m²",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    simpleRange: [90, Infinity]
  },
  "sodium": {
    unit: "mEq/L",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    simpleRange: [136, 145]
  },
  "potassium": {
    unit: "mEq/L",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    simpleRange: [3.5, 5.0]
  },
  "chloride": {
    unit: "mEq/L",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    simpleRange: [98, 107]
  },
  "phosphorus": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.KIDNEY_FUNCTION,
    simpleRange: [2.5, 4.5]
  },

  // Thyroid Function Category
  "tsh": {
    unit: "mIU/L",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [0.4, 4.0]
  },
  "t3": {
    unit: "ng/dL",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [80, 200]
  },
  "t4": {
    unit: "µg/dL",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [4.5, 11.2]
  },
  "free_t3": {
    unit: "pg/mL",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [2.3, 4.2]
  },
  "free_t4": {
    unit: "ng/dL",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [0.8, 1.8]
  },
  "reverse_t3": {
    unit: "ng/dL",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [10, 24]
  },
  "thyroglobulin": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [0, 40]
  },
  "anti_tpo": {
    unit: "IU/mL",
    category: BIOMARKER_CATEGORIES.THYROID_FUNCTION,
    simpleRange: [0, 34]
  },

  // Complete Blood Count Category
  "hemoglobin": {
    unit: "g/dL",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    genderRange: {
      male: [13.5, 17.5],
      female: [12.0, 15.5]
    }
  },
  "hematocrit": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    genderRange: {
      male: [41, 50],
      female: [36, 44]
    }
  },
  "red_blood_cell_count": {
    unit: "million/µL",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    genderRange: {
      male: [4.5, 5.9],
      female: [4.1, 5.1]
    }
  },
  "mcv": {
    unit: "fL",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [80, 100]
  },
  "mch": {
    unit: "pg",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [27, 31]
  },
  "mchc": {
    unit: "g/dL",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [32, 36]
  },
  "rdw": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [11.5, 14.5]
  },
  "platelet_count": {
    unit: "×10³/µL",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [150, 450]
  },
  "neutrophils": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [40, 60]
  },
  "lymphocytes": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [20, 40]
  },
  "monocytes": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [2, 8]
  },
  "eosinophils": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [1, 4]
  },
  "basophils": {
    unit: "%",
    category: BIOMARKER_CATEGORIES.COMPLETE_BLOOD_COUNT,
    simpleRange: [0, 1]
  },

  // Diabetes Markers Category
  "fasting_glucose": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.DIABETES_MARKERS,
    simpleRange: [70, 99]
  },
  "post_prandial_glucose": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.DIABETES_MARKERS,
    simpleRange: [70, 140]
  },
  "random_glucose": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.DIABETES_MARKERS,
    simpleRange: [70, 140]
  },
  "c_peptide": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.DIABETES_MARKERS,
    simpleRange: [0.9, 7.1]
  },
  "insulin": {
    unit: "µIU/mL",
    category: BIOMARKER_CATEGORIES.DIABETES_MARKERS,
    simpleRange: [2.0, 25.0]
  },
  "homa_ir": {
    unit: "index",
    category: BIOMARKER_CATEGORIES.DIABETES_MARKERS,
    simpleRange: [0, 2.5]
  },

  // Hormonal Profile Category
  "testosterone": {
    unit: "ng/dL",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [270, 1070],
      female: [15, 70]
    }
  },
  "estradiol": {
    unit: "pg/mL",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [7.6, 42.6],
      female: [30, 400]
    }
  },
  "progesterone": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [0.1, 0.3],
      female: [0.1, 25]
    }
  },
  "lh": {
    unit: "mIU/mL",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [1.7, 8.6],
      female: [1.0, 95]
    }
  },
  "fsh": {
    unit: "mIU/mL",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [1.5, 12.4],
      female: [1.0, 150]
    }
  },
  "prolactin": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [2.1, 17.7],
      female: [4.8, 23.3]
    }
  },
  "dhea_s": {
    unit: "µg/dL",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [80, 560],
      female: [35, 430]
    }
  },
  "shbg": {
    unit: "nmol/L",
    category: BIOMARKER_CATEGORIES.HORMONAL_PROFILE,
    genderRange: {
      male: [16.5, 55.9],
      female: [18, 144]
    }
  },

  // Vitamins & Minerals Category
  "vitamin_a": {
    unit: "µg/dL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [30, 95]
  },
  "vitamin_e": {
    unit: "mg/L",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [5.5, 17]
  },
  "vitamin_k": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [0.1, 2.2]
  },
  "vitamin_c": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [0.6, 2.0]
  },
  "folate": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [3.0, 17.0]
  },
  "zinc": {
    unit: "µg/dL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [70, 120]
  },
  "copper": {
    unit: "µg/dL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [70, 140]
  },
  "selenium": {
    unit: "µg/L",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [70, 150]
  },
  "vitamin_b1": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [2.5, 7.5]
  },
  "vitamin_b2": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [4, 24]
  },
  "vitamin_b3": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [0.5, 8.4]
  },
  "vitamin_b5": {
    unit: "µg/mL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [0.2, 1.8]
  },
  "vitamin_b6": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.VITAMINS_MINERALS,
    simpleRange: [5, 50]
  },

  // Cardiac Markers Category
  "troponin_i": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.CARDIAC_MARKERS,
    simpleRange: [0, 0.04]
  },
  "troponin_t": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.CARDIAC_MARKERS,
    simpleRange: [0, 0.01]
  },
  "ck_mb": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.CARDIAC_MARKERS,
    simpleRange: [0, 5]
  },
  "nt_probnp": {
    unit: "pg/mL",
    category: BIOMARKER_CATEGORIES.CARDIAC_MARKERS,
    genderRange: {
      male: [0, 125],
      female: [0, 125]
    }
  },
  "bnp": {
    unit: "pg/mL",
    category: BIOMARKER_CATEGORIES.CARDIAC_MARKERS,
    simpleRange: [0, 100]
  },
  "myoglobin": {
    unit: "ng/mL",
    category: BIOMARKER_CATEGORIES.CARDIAC_MARKERS,
    genderRange: {
      male: [17, 106],
      female: [10, 65]
    }
  },
  "ldh": {
    unit: "U/L",
    category: BIOMARKER_CATEGORIES.CARDIAC_MARKERS,
    simpleRange: [140, 280]
  },

  // Immune System Category
  "cd4_count": {
    unit: "cells/µL",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [500, 1500]
  },
  "cd8_count": {
    unit: "cells/µL",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [200, 800]
  },
  "cd4_cd8_ratio": {
    unit: "ratio",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [1.0, 4.0]
  },
  "iga": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [70, 400]
  },
  "igg": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [700, 1600]
  },
  "igm": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [40, 230]
  },
  "complement_c3": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [90, 180]
  },
  "complement_c4": {
    unit: "mg/dL",
    category: BIOMARKER_CATEGORIES.IMMUNE_SYSTEM,
    simpleRange: [10, 40]
  }
};

/**
 * Normalize biomarker name to match reference keys
 * Handles various naming conventions from PDF parsing
 */
export function normalizeBiomarkerName(name) {
  if (!name) return null;
  
  const normalized = name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  
  // Handle common variations
  const variations = {
    "vitamin_b12": ["b12", "vitb12", "cobalamin"],
    "vitamin_d": ["vitd", "25_oh_vitamin_d", "25ohd"],
    "hs_crp": ["hs_c_reactive_protein", "high_sensitivity_crp", "c_reactive_protein"],
    "hba1c": ["hb_a1c", "glycated_hemoglobin", "a1c"],
    "fasting_glucose": ["glucose_fasting", "fbs", "fasting_blood_sugar"],
    "post_prandial_glucose": ["ppbs", "glucose_pp", "postprandial_glucose"],
    "serum_creatinine": ["creatinine", "s_creatinine"],
    "white_blood_cell_count": ["wbc", "white_blood_cells", "total_wbc"],
    "red_blood_cell_count": ["rbc", "red_blood_cells", "total_rbc"],
    "fasting_insulin": ["insulin_fasting", "insulin"]
  };
  
  for (const [key, aliases] of Object.entries(variations)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return key;
    }
  }
  
  return normalized;
}

/**
 * Get biomarker range based on gender and time
 */
export function getBiomarkerRange(biomarkerKey, gender = null, timeOfDay = null) {
  const biomarker = BIOMARKER_RANGES[biomarkerKey];
  if (!biomarker) return null;
  
  if (biomarker.timeRange && timeOfDay) {
    const timeKey = timeOfDay.toLowerCase();
    if (biomarker.timeRange[timeKey]) {
      return biomarker.timeRange[timeKey];
    }
  }
  
  if (biomarker.genderRange && gender) {
    const genderKey = gender.toLowerCase();
    if (biomarker.genderRange[genderKey]) {
      return biomarker.genderRange[genderKey];
    }
  }
  
  if (biomarker.simpleRange) {
    return biomarker.simpleRange;
  }
  
  return null;
}

/**
 * Check if biomarker value is within range
 */
export function checkBiomarkerStatus(biomarkerKey, value, gender = null, timeOfDay = null) {
  if (value == null || value === undefined) {
    return { status: "bad", reason: "Value not available" };
  }
  
  const biomarker = BIOMARKER_RANGES[biomarkerKey];
  if (!biomarker) {
    return { status: "bad", reason: "Biomarker not in reference" };
  }
  
  // Handle categorical ranges (like HbA1c, Hs-CRP)
  if (biomarker.categoricalRange) {
    const ranges = biomarker.categoricalRange.ranges;
    for (const range of ranges) {
      if (value >= range.min && value <= range.max) {
        // For some categorical ranges, "bad" might be certain categories
        // For now, we'll consider Normal/Low risk as "good"
        const isGood = range.label.toLowerCase().includes("normal") || 
                      range.label.toLowerCase().includes("low");
        return { 
          status: isGood ? "good" : "bad", 
          category: range.label,
          reason: range.label
        };
      }
    }
    return { status: "bad", reason: "Value outside all defined ranges" };
  }
  
  // Handle simple and gender-specific ranges
  const range = getBiomarkerRange(biomarkerKey, gender, timeOfDay);
  if (!range) {
    return { status: "bad", reason: "Range not available" };
  }
  
  const [min, max] = range;
  const isGood = value >= min && value <= max;
  
  return {
    status: isGood ? "good" : "bad",
    reason: isGood ? "Within normal range" : `Outside normal range (${min}-${max})`
  };
}

/**
 * Process raw biomarkers from microservice and categorize them
 */
export function processBiomarkers(rawBiomarkers, gender = null, timeOfDay = null) {
  const categorized = {};
  const processed = {};
  
  // Initialize categories
  Object.values(BIOMARKER_CATEGORIES).forEach(category => {
    categorized[category] = {};
  });
  
  // Process each biomarker
  for (const [key, value] of Object.entries(rawBiomarkers)) {
    const normalizedKey = normalizeBiomarkerName(key);
    const biomarker = BIOMARKER_RANGES[normalizedKey];
    
    if (biomarker) {
      const statusResult = checkBiomarkerStatus(normalizedKey, value, gender, timeOfDay);
      
      const biomarkerData = {
        value: value,
        status: statusResult.status,
        unit: biomarker.unit,
        category: biomarker.category,
        reason: statusResult.reason || null,
        categoryLabel: statusResult.category || null
      };
      
      processed[normalizedKey] = biomarkerData;
      
      // Add to category
      if (!categorized[biomarker.category]) {
        categorized[biomarker.category] = {};
      }
      categorized[biomarker.category][normalizedKey] = biomarkerData;
    } else {
      // Unknown biomarker - store with status "bad"
      processed[normalizedKey] = {
        value: value,
        status: "bad",
        unit: null,
        category: null,
        reason: "Biomarker not in reference database"
      };
    }
  }
  
  return {
    all: processed,
    byCategory: categorized
  };
}

