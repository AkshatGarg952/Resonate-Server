import { Diagnostics } from "../models/Diagnostics.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import sendReportReady from "../services/notification.js";
import dotenv from "dotenv";

dotenv.config();

function makeBiomarker(biomarker, value) {
  if (value == null) {
    return { value: null, status: "bad" };
  }

  return {
    value,
    status: calcStatus(biomarker, value)
  };
}

function calcStatus(biomarker, value) {
  const [low, high] = RANGES[biomarker];
  if (value < low || value > high){
    return "bad";
  }
  else{
    return "good";
  }
}

const RANGES = {
  hemoglobin: [12, 16],
  fastingGlucose: [70, 99],
  hdl: [40, 200],
  ldl: [0, 100],
  triglycerides: [0, 150],
  tsh: [0.4, 4.0],
  vitaminD: [30, 100],
  alt: [7, 56],
  ast: [10, 40],
};


export const uploadDiagnostics = async (req, res) => {
  
  if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

  if (!req.file) {
    return res.status(400).json({ message: "PDF file required" });
  }

  const userId = req.user.firebaseUid;

  try {
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
            const parsingResponse = await axios.post(
              `${process.env.MICROSERVICE_URL}/parse-report`,
              { pdfUrl }
            );

            console.log("parsing", parsingResponse);

            record.biomarkers = parsingResponse.data.biomarkers;
            record.status = "completed";
            await record.save();

            return res.json({
              message: "Report uploaded and parsed successfully",
              diagnostics: record,
            });

          } catch (err) {
            console.log(err);
            record.status = "failed";
            await record.save();

            if (err.response) {
              return res.status(err.response.status).json({
                message: err.response.data.detail,
              });
            }

            return res.status(500).json({
              message: "Microservice unreachable",
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
