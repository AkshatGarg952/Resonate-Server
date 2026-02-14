import { Diagnostics } from "../models/Diagnostics.js";
import { User } from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import sendReportReady from "../services/notification.js";
import dotenv from "dotenv";
import { processBiomarkers } from "../utils/biomarkerReference.js";
import { BIOMARKERS_LIST } from "../config/biomarkers.js";
import logger from "../utils/logger.js";

import { DiagnosticsIngestor } from "../services/ingestors/diagnostics.ingestor.js";
import { MemoryService } from "../services/memory.service.js";

dotenv.config();

const memoryService = new MemoryService();
const diagnosticsIngestor = new DiagnosticsIngestor(memoryService);



export const uploadDiagnostics = async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "PDF file required" });
  }

  const userId = req.user.firebaseUid

  try {
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
            const parsingResponse = await axios.post(
              `${process.env.MICROSERVICE_URL}/parse-report`,
              {
                pdfUrl,
                biomarkers: BIOMARKERS_LIST
              }
            );



            const rawBiomarkers = parsingResponse.data.values || {};

            if (!rawBiomarkers || Object.keys(rawBiomarkers).length === 0) {
              record.status = "failed";
              await record.save();
              return res.status(400).json({
                message: "No biomarkers found in the report"
              });
            }

            const processed = processBiomarkers(rawBiomarkers, userGender, null);

            record.biomarkers = processed.all;
            record.biomarkersByCategory = processed.byCategory;
            record.status = "completed";
            await record.save();

            try {
              await sendReportReady(userId);
            } catch (notifError) {
              console.error("Notification error:", notifError);
            }

            // Push to Memory Layer
            try {
              const memoryMarkers = Object.entries(processed.all).map(([key, data]) => ({
                name: key,
                value: data.value,
                unit: data.unit,
                status: data.status,
                previous_value: null // TODO: Fetch previous record to compare
              }));

              await diagnosticsIngestor.processBloodReport(userId, {
                date: new Date().toISOString().split('T')[0],
                markers: memoryMarkers
              });
              logger.info(`Pushed blood report memory for user ${userId}`);
            } catch (memoryError) {
              console.error("Memory push error:", memoryError);
              // Don't fail the request if memory push fails
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

  } catch (error) {
    console.error("Fetch diagnostics error:", error);
    return res.status(500).json({ error: error.message });
  }
}
