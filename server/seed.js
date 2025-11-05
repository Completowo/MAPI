require("dotenv").config();
const connectDB = require("./connection");
const Paciente = require("./models/Paciente");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

async function run() {
  await connectDB();
  const paciente = await Paciente.create({ run: "12345678-9", nombre: "Prueba", edad: 30 });
  const conv = await Conversation.create({ title: "Primera", participants: [paciente._id] });
  await Message.create({ text: "Hola", sender: "user", conversationId: conv._id });
  console.log("Seed completado");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});