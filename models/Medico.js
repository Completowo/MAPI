const mongoose = requiere("mongoose");

const medicoSchema = new mongoose.Schema({
  medico_id: { type: mongoose.Schema.Types.ObjectId },
  run : { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  especialidad: { type: String, required: true },
});

export default mongoose.model("Medico", medicoSchema);