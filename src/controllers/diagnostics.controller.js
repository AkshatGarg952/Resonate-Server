import { Diagnostics } from "../models/Diagnostics.js";
import {User} from "../models/User.js"; 
// import { storage } from "../middlewares/firebaseAuth.js"; 
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import sendReportReady from "../services/notification.js";

export const uploadDiagnostics = async (req, res) => {
  try {
    const { uid } = req.user;
    
    if (!req.file)
      return res.status(400).json({ message: "PDF file required" });

  
    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",        
        folder: "resonate-reports",           
        format: "pdf"
      },
      async (error, result) => {

        if (error) throw error;

        const pdfUrl = result.secure_url;


        const record = await Diagnostics.create({
          userId: uid,
          pdfUrl,
          status: "pending"
        });

        const user = await User.findOne({firebaseUid: uid})

        const parsingResponse = await axios.post(
          "https://resonate-microservice.onrender.com/parse-report",
          { pdfUrl }
        );

        const biomarkers = parsingResponse.data;

        record.biomarkers = biomarkers;
        record.status = "completed";
        await record.save();


        await sendReportReady(user.phone);
        return res.json({
          message: "Report uploaded and parsed successfully",
          diagnostics: record
        });

      }
    );

    uploadResult.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


export const getLatestDiagnostics = async (req, res) => {
  try {
    const { uid } = req.user;

    const latest = await Diagnostics.findOne({ userId: uid }).sort({ createdAt: -1 });

    return res.json(latest);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



export const getDiagnosticsHistory = async (req, res) => {
  try {
    const { uid } = req.user;

    const history = await Diagnostics.find({ userId: uid }).sort({ createdAt: -1 });
    
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
