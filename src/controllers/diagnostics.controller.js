// import { Diagnostics } from "../models/Diagnostics.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import sendReportReady from "../services/notification.js";
import dotenv from "dotenv";

// import { Diagnostics } from "../models/Diagnostics.js";


dotenv.config();

export const uploadDiagnostics = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!req.file) {
    return res.status(400).json({ message: "PDF file required" });
  }

  const user = req.user;

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "resonate-reports",
        format: "pdf",
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        const record = await Diagnostics.create({
          userId: user.firebaseUid,
          pdfUrl: result.secure_url,
          status: "pending",
          metadata: {
            testTime: req.body.testTime || null,
            reportDate: new Date(),
          },
        });

        try {
          
          const parsingResponse = await axios.post(
            `${process.env.MICROSERVICE_URL}/parse-report`,
            {
              pdfUrl: result.secure_url,
              biomarkers: SUPPORTED_BIOMARKERS,
            }
          );

          const extractedValues = parsingResponse.data.values;

          if (!extractedValues || typeof extractedValues !== "object") {
            throw new Error("Invalid extraction response from AI service");
          }

          //Evaluate biomarkers (medical logic)
          const evaluated = evaluateBiomarkers({
            extractedValues,
            user,
            metadata: record.metadata,
          });

          // Map evaluated biomarkers to categories
          const categorized = mapToCategories(evaluated);

          // Save final result
          record.biomarkers = categorized;
          record.status = "completed";
          await record.save();

          return res.json({
            message: "Report uploaded and processed successfully",
            diagnostics: record,
          });

        } catch (err) {
          console.error("Parsing error:", err);

          record.status = "failed";
          await record.save();

          return res.status(500).json({
            message: "Diagnostics parsing failed",
          });
        }
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (err) {
    console.error("Outer error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const getLatestDiagnostics = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;

    const latest = await Diagnostics.findOne({ userId })
  .sort({ createdAt: -1 })
  .select("biomarkers status pdfUrl updatedAt");

    return res.json(latest);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



export const getDiagnosticsHistory = async (req, res) => {
  try {

    console.log("request aayi hai aayi hai!");
        const userId = req.user.firebaseUid;
    const history = await Diagnostics.find({ userId })
    .sort({ createdAt: -1 })
    .select("biomarkers status pdfUrl updatedAt");
    console.log("history", history);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const fetchDiagnosticsFromAPI = async (req, res) => {
  try{
    const userId = req.user._id;

    const labResponse = await axios.get(
      `${process.env.LAB_API_URL}/reports?patient_id=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LAB_API_KEY}`
        }
      }
    );

    const data = labResponse.data;

    if (!data) {
      return res.status(400).json({ message: "No biomarker data received" });
    }

    const mapped = {
      hemoglobin: makeBiomarker(data.hemoglobin),
      fastingGlucose: makeBiomarker(data.fastingGlucose),
      hdl: makeBiomarker(data.hdl),
      ldl: makeBiomarker(data.ldl),
      triglycerides: makeBiomarker(data.triglycerides),
      tsh: makeBiomarker(data.tsh),
      vitaminD: makeBiomarker(data.vitaminD),
      alt: makeBiomarker(data.alt),
      ast: makeBiomarker(data.ast),
    };
    
    const record = await Diagnostics.create({
      userId: uid,
      pdfUrl: "N/A",
      biomarkers: mapped,
      status: "completed"
    });

    return res.json({
      message: "Data fetched & processed successfully",
      diagnostics: record
    });    
    
  }

  catch(error){
    return res.status(500).json({ error: error.message });
  }
}
