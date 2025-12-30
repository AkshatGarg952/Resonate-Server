// src/services/reportExtraction.service.js

import axios from "axios";
import { BIOMARKERS } from "../config/biomarkers.config.js";

export async function extractBiomarkersFromReport(pdfUrl) {
  const biomarkerKeys = Object.keys(BIOMARKERS);

  const response = await axios.post(
    `${process.env.MICROSERVICE_URL}/parse-report`,
    {
      pdfUrl,
      biomarkers: biomarkerKeys,
    }
  );

  return response.data; 
  /*
    {
      vitamin_d: { value: 28, unit: "ng/mL" },
      ferritin: { value: null, unit: "ng/mL" }
    }
  */
}
