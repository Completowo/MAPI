const mongoose = require("mongoose");

const medicoSchema = new mongoose.Schema({
  run: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  telefono: { type: String, required: false },
  email: { type: String, required: false, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  pdfs: [
    {
      filename: String,
      originalname: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Medico", medicoSchema);