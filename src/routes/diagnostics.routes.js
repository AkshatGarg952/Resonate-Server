import express from "express";
import { verifyFirebaseToken } from "../middlewares/firebaseAuth.js";
import { uploadPDF } from "../middlewares/pdfUpload.js";
import {
  uploadDiagnostics,
  getLatestDiagnostics,
  getDiagnosticsHistory
} from "../controllers/diagnostics.controller.js";

const router = express.Router();

router.post("/upload", verifyFirebaseToken, uploadPDF.single("report"), uploadDiagnostics);
router.get("/latest", verifyFirebaseToken, getLatestDiagnostics);
router.get("/history", verifyFirebaseToken, getDiagnosticsHistory);

export default router;
