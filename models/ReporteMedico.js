const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalname: String,
  mimetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false } // para marcar verificación por el staff
});

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  diagnosis: { type: String },
  notes: { type: String },
  files: [fileSchema],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String } // id o nombre del que sube (según tu auth)
});

module.exports = mongoose.model("MedicalReport", reportSchema);