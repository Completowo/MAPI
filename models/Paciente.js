const mongoose = requiere("mongoose");

const pacienteSchema = new mongoose.Schema({
  paciente_id: { type: mongoose.Schema.Types.ObjectId },
  run : { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  edad: { type: Number, required: true },
});

const DocumentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalname: String,
  mimetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false }
});

const Document = mongoose.model("Document", DocumentSchema);
const Paciente = mongoose.model("Paciente", pacienteSchema);

module.exports = { Document, Paciente };