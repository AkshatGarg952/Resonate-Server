import multer from "multer";

const storage = multer.memoryStorage(); // File stays in memory buffer

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files allowed"), false);
};

export const uploadPDF = multer({ storage, fileFilter });
