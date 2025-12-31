import { Diagnostics } from "../models/Diagnostics.js";
import { User } from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import sendReportReady from "../services/notification.js";
import dotenv from "dotenv";
import { processBiomarkers } from "../utils/biomarkerReference.js";

dotenv.config();

const BIOMARKERS_LIST = [
  "Vitamin B12",
  "Vitamin D",
  "HS-CRP",
  "Homocysteine",
  "HbA1c",
  "Cortisol",
  "Serum Creatinine",
  "Uric Acid",
  "Calcium",
  "Ferritin",
  "Magnesium",
  "Iron",
  "Fasting Glucose",
  "TSH",
  "Free T3",
  "Hemoglobin",
  "Red Blood Cell Count"
];



export const uploadDiagnostics = async (req, res) => {
  
  if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

  if (!req.file) {
    return res.status(400).json({ message: "PDF file required" });
  }

  const userId = req.user.firebaseUid

  try {
    // Get user's gender for biomarker range validation
    const user = await User.findOne({ firebaseUid: userId });
    const userGender = user?.gender || null;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "resonate-reports",
        format: "pdf",
      },
      async (error, result) => {
        try {
          if (error) {
            return res.status(500).json({ message: "Cloudinary upload failed" });
          }

          const pdfUrl = result.secure_url;

          const record = await Diagnostics.create({
            userId,
            pdfUrl,
            status: "pending",
          });

          try {
            // Send PDF URL to microservice for parsing
            const parsingResponse = await axios.post(
              `${process.env.MICROSERVICE_URL}/parse-report`,
              { pdfUrl,
              biomarkers: BIOMARKERS_LIST
              }
            );
            
            console.log("Parsing response:", parsingResponse.data);
            
            // Get raw biomarkers from microservice response
            const rawBiomarkers = parsingResponse.data.values || {};
            
            if (!rawBiomarkers || Object.keys(rawBiomarkers).length === 0) {
              record.status = "failed";
              await record.save();
              return res.status(400).json({ 
                message: "No biomarkers found in the report" 
              });
            }
            
            // Process biomarkers category-wise with gender-based validation
            const processed = processBiomarkers(rawBiomarkers, userGender, null);
            
            // Convert to plain objects for MongoDB storage (MongoDB Maps are stored as objects)
            record.biomarkers = processed.all;
            record.biomarkersByCategory = processed.byCategory;
            record.status = "completed";
            await record.save();

            // Send notification if needed
            try {
              await sendReportReady(userId);
            } catch (notifError) {
              console.error("Notification error:", notifError);
              // Don't fail the request if notification fails
            }

            return res.json({
              message: "Report uploaded and parsed successfully",
              diagnostics: {
                _id: record._id,
                userId: record.userId,
                pdfUrl: record.pdfUrl,
                status: record.status,
                biomarkers: record.biomarkers,
                biomarkersByCategory: record.biomarkersByCategory,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
              },
            });

          } catch (err) {
            console.error("Parsing error:", err);
            record.status = "failed";
            await record.save();

            if (err.response) {
              return res.status(err.response.status).json({
                message: err.response.data.detail || err.response.data.message || "Microservice error",
              });
            }

            return res.status(500).json({
              message: "Microservice unreachable or parsing failed",
            });
          }

        } catch (err) {
          console.error("Internal error:", err);
          return res.status(500).json({ message: "Internal server error" });
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
      .select("biomarkers biomarkersByCategory status pdfUrl updatedAt createdAt");
    

    return res.json(latest);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



export const getDiagnosticsHistory = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;
    const history = await Diagnostics.find({ userId })
      .sort({ createdAt: -1 })
      .select("biomarkers biomarkersByCategory status pdfUrl updatedAt createdAt");
    
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const fetchDiagnosticsFromAPI = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;

    // Get user's gender for biomarker range validation
    const user = await User.findOne({ firebaseUid: userId });
    const userGender = user?.gender || null;

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

    // Process biomarkers using the new system
    const processed = processBiomarkers(data, userGender, null);
    
    const record = await Diagnostics.create({
      userId: userId,
      pdfUrl: "N/A",
      biomarkers: processed.all,
      biomarkersByCategory: processed.byCategory,
      status: "completed"
    });

    return res.json({
      message: "Data fetched & processed successfully",
      diagnostics: record
    });    
    
  } catch(error) {
    console.error("Fetch diagnostics error:", error);
    return res.status(500).json({ error: error.message });
  }
}
