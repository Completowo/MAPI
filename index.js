import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

const express = require("express");
const cors = require("cors");
const connectDB = require("./server/connection");
const Message = require("./models/message"); 

require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
