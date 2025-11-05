const express = require("express");
const multer = require("multer");
const path = require("path");
const MedicalReport = require("../models/MedicalReport"); 

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("Solo PDF permitido"), false);
    cb(null, true);
  }
});


function requireAuth(req, res, next) {
 
  next();
}


router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Archivo no recibido" });

    const { patientId, diagnosis } = req.body;
    if (!patientId) return res.status(400).json({ error: "patientId requerido" });

    let report = await MedicalReport.findOne({ patientId });
    if (!report) report = new MedicalReport({ patientId, diagnosis });

    const fileMeta = {
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    report.files = report.files || [];
    report.files.push(fileMeta);
    await report.save();

    res.status(201).json({ message: "Archivo subido", file: fileMeta, reportId: report._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error subiendo archivo" });
  }
});

module.exports = router;