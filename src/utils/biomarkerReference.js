export const BIOMARKER_CATEGORIES = {
  GENERAL_HEALTH: "General Health",
  SLEEP_STATUS: "Sleep Status"
};

export const BIOMARKER_RANGES = {
  vitamin_b12: {
    unit: "pg/mL",
    categories: [BIOMARKER_CATEGORIES.GENERAL_HEALTH],
    simpleRange: [211, 911],
    notes: "Essential for nerve function and red blood cell formation"
  },

  vitamin_d: {
    unit: "ng/mL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS
    ],
    simpleRange: [30, 100],
    notes: "Supports bone health, immunity, hormone regulation, and sleep quality; optimal >40 ng/mL"
  },

  hs_crp: {
    unit: "mg/L",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS
    ],
    categoricalRange: {
      ranges: [
        { min: 0, max: 1.0, label: "Low risk" },
        { min: 1.0, max: 3.0, label: "Moderate risk" },
        { min: 3.0, max: Infinity, label: "High risk" }
      ]
    },
    notes: "Marker of systemic inflammation affecting cardiovascular and sleep health"
  },

  homocysteine: {
    unit: "µmol/L",
    categories: [BIOMARKER_CATEGORIES.GENERAL_HEALTH],
    simpleRange: [5, 15],
    notes: "Elevated levels increase cardiovascular and stroke risk"
  },

  hba1c: {
    unit: "%",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS
    ],
    categoricalRange: {
      ranges: [
        { min: 4.0, max: 5.6, label: "Normal" },
        { min: 5.7, max: 6.4, label: "Prediabetes" },
        { min: 6.5, max: Infinity, label: "Diabetes" }
      ]
    },
    notes: "Reflects long-term blood glucose control which impacts sleep quality"
  },

  cortisol: {
    unit: "mcg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS
    ],
    timeRange: {
      am: [6.2, 19.4],
      pm: [2.3, 11.9]
    },
    notes: "Primary stress hormone; elevated night levels disrupt sleep"
  },

  serum_creatinine: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.GENERAL_HEALTH],
    genderRange: {
      male: [0.7, 1.3],
      female: [0.6, 1.1]
    },
    notes: "Indicator of kidney function and muscle metabolism"
  },

  uric_acid: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.GENERAL_HEALTH],
    genderRange: {
      male: [3.5, 7.2],
      female: [2.6, 6.0]
    },
    notes: "High levels associated with gout, kidney stones, and metabolic risk"
  },

  calcium: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.GENERAL_HEALTH],
    simpleRange: [8.5, 10.5],
    notes: "Critical for bone strength, muscle contraction, and nerve signaling"
  },

  ferritin: {
    unit: "ng/mL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS
    ],
    genderRange: {
      male: [30, 400],
      female: [13, 150]
    },
    notes: "Iron storage marker; low levels may cause fatigue and poor sleep"
  },

  magnesium: {
    unit: "mg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS
    ],
    simpleRange: [1.7, 2.2],
    notes: "Supports muscle relaxation, nervous system balance, and sleep quality"
  },

  iron: {
    unit: "µg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS
    ],
    genderRange: {
      male: [65, 175],
      female: [50, 170]
    },
    notes: "Required for oxygen transport; deficiency impacts energy and sleep"
  },

  fasting_glucose: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.SLEEP_STATUS],
    simpleRange: [70, 100],
    notes: "Elevated levels are associated with poor sleep and metabolic stress"
  },

  tsh: {
    unit: "µIU/mL",
    categories: [BIOMARKER_CATEGORIES.SLEEP_STATUS],
    simpleRange: [0.4, 4.0],
    notes: "Thyroid imbalance can disrupt sleep duration and quality"
  },

  free_t3: {
    unit: "pg/mL",
    categories: [BIOMARKER_CATEGORIES.SLEEP_STATUS],
    simpleRange: [2.0, 4.4],
    notes: "Active thyroid hormone influencing metabolism and sleep regulation"
  },

  hemoglobin: {
    unit: "g/dL",
    categories: [BIOMARKER_CATEGORIES.SLEEP_STATUS],
    genderRange: {
      male: [13, 17],
      female: [12, 16]
    },
    notes: "Low levels reduce oxygen delivery and negatively affect sleep"
  },

  red_blood_cell_count: {
    unit: "million/mm³",
    categories: [BIOMARKER_CATEGORIES.SLEEP_STATUS],
    genderRange: {
      male: [4.5, 5.5],
      female: [4.0, 5.0]
    },
    notes: "Reflects oxygen-carrying capacity influencing sleep health"
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

