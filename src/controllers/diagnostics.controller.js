import { Diagnostics } from "../models/Diagnostics.js";
// import { storage } from "../middlewares/firebaseAuth.js"; 
import cloudinary from "../config/cloudinary.js";
import axios from "axios";

// export const uploadDiagnostics = async (req, res) => {
//   try {
//     const { uid } = req.user;

//     if (!req.file) return res.status(400).json({ message: "PDF file required" });

    
//     const fileName = `reports/${uid}-${Date.now()}.pdf`;
//     const fileUpload = storage.file(fileName);

//     await fileUpload.save(req.file.buffer, {
//       metadata: { contentType: req.file.mimetype },
//     });

//     const pdfUrl = `https://storage.googleapis.com/${storage.name}/${fileName}`;

//     // Save record as pending
//     const record = await Diagnostics.create({
//       userId: uid,
//       pdfUrl,
//       status: "pending"
//     });

//     // Send PDF to AI Parser (Your Python server)
//     const parsingResponse = await axios.post(
//       "http://localhost:8000/parse-report",
//       { pdfUrl }
//     );

//     const biomarkers = parsingResponse.data;

//     // Update with parsed values
//     record.biomarkers = biomarkers;
//     record.status = "completed";
//     await record.save();
    
//     return res.json({
//       message: "Report uploaded and parsed successfully",
//       diagnostics: record,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: error.message });
//   }
// };

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

        const parsingResponse = await axios.post(
          "http://localhost:8000/parse-report",
          { pdfUrl }
        );

        const biomarkers = parsingResponse.data;

        record.biomarkers = biomarkers;
        record.status = "completed";
        await record.save();
        
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
