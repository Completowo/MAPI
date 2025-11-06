require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./connection");
const Message = require("../models/message");
const Medico = require("../models/Medico");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
// express.json will still be used for JSON endpoints
app.use(express.json());

connectDB();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "medicos");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});

const upload = multer({ storage });

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo mensajes" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { text, sender } = req.body;
    const msg = new Message({ text, sender });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: "Error guardando mensaje" });
  }
});

// Endpoints para Medicos
app.get("/api/medicos", async (req, res) => {
  try {
    const medicos = await Medico.find().sort({ createdAt: -1 }).limit(200);
    res.json(medicos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo medicos" });
  }
});

// Verificar si un médico existe
app.post("/api/medicos/verificar", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const medico = await Medico.findOne({ email });
    if (!medico) {
      return res.status(404).json({ error: "Médico no encontrado" });
    }

    // Si existe, devolver datos básicos sin información sensible
    const { _id, nombre, run, telefono } = medico;
    res.json({ _id, nombre, run, telefono, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error verificando médico" });
  }
});

// Create medico with file upload (field name: file)
app.post("/api/medicos", upload.single("file"), async (req, res) => {
  try {
    const { nombre, run, telefono, email, password } = req.body;

    if (!nombre || !run || !password) return res.status(400).json({ error: "nombre, run y password son requeridos" });

    const existing = await Medico.findOne({ $or: [{ run }, { email }] });
    if (existing) return res.status(409).json({ error: "Medico con este RUN o email ya existe" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const medicoData = { nombre, run, telefono, email, passwordHash };

    if (req.file) {
      medicoData.pdfs = [
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      ];
    }

    const medico = new Medico(medicoData);
    await medico.save();
    // Do not return passwordHash
    const medicoSafe = medico.toObject();
    delete medicoSafe.passwordHash;
    res.status(201).json(medicoSafe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando medico" });
  }
});

// Auth endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email y password requeridos' });

    const medico = await Medico.findOne({ email });
    if (!medico) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, medico.passwordHash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const medicoSafe = medico.toObject();
    delete medicoSafe.passwordHash;
    res.json({ success: true, medico: medicoSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en login' });
  }
});

const os = require('os');

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const interfaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[interfaceName]) {
      // Saltamos las interfaces no IPv4 y la interfaz de loopback
      if (iface.family !== 'IPv4' || iface.internal) continue;
      addresses.push(iface.address);
    }
  }
  
  return addresses;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  console.log('\n=== Servidor iniciado ===');
  console.log(`📡 Puerto: ${PORT}`);
  console.log('🌐 IPs disponibles:');
  ips.forEach(ip => {
    console.log(`   http://${ip}:${PORT}`);
  });
  console.log('\n💻 Local: http://localhost:4000');
  console.log('🔄 MongoDB conectado');
  console.log('========================\n');
});
