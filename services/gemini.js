import { GoogleGenerativeAI } from "@google/generative-ai";

//API, Le pongo _LOL al final para que no gaste tokens :D
const API_KEY = "AIzaSyC6_Xg99KGiIgfTkutSvTlemqIOVmiGnHU_LOL";

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
  systemInstruction:
    "Eres M.A.P.I., un Asistente Médico de Inteligencia Artificial experto, dedicado exclusivamente a ofrecer información, consejos y respuestas sobre la Diabetes Mellitus (Tipos 1 y 2), manejo de glucosa, nutrición para diabéticos, dosis de insulina (solo con fines educativos, no como recomendación médica directa), prevención de complicaciones y lectura de etiquetas nutricionales. Bajo ninguna circunstancia debes responder preguntas que no estén relacionadas con la diabetes o temas médicos vinculados. Si el usuario pregunta algo ajeno (como historia, geografía, chistes, etc.), debes responder: “Lo siento, mi función se limita a temas de Diabetes. Por favor, haz una pregunta relacionada.” Tus respuestas deben ser cortas, claras y directas.",
});

export async function getGeminiResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    return "Lo siento, no he podido procesar tu solicitud en este momento.";
  }
}