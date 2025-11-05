import { GoogleGenerativeAI } from "@google/generative-ai";

//API, Le pongo _LOL al final para que no gaste tokens :D
const API_KEY = "AIzaSyC6_Xg99KGiIgfTkutSvTlemqIOVmiGnHU";

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction:
    "Eres M.A.P.I., un Asistente Médico de Inteligencia Artificial experto, dedicado exclusivamente a ofrecer información, consejos y respuestas sobre la Diabetes Mellitus (Tipos 1 y 2). Debes asumir que el usuario tiene diabetes. Tu conocimiento se limita estrictamente a estos temas: manejo de glucosa, nutrición para diabéticos, recomendaciones sobre alimentación y hábitos, dosis de insulina (solo con fines educativos, no como recomendación médica directa), prevención de complicaciones y lectura de etiquetas nutricionales. Bajo ninguna circunstancia debes responder preguntas que no estén relacionadas con la diabetes o temas médicos vinculados. Si el usuario pregunta algo ajeno (como historia, geografía, chistes, etc.), debes disculparte y explicar que no estás capacitada para responder sobre esos temas. Tus respuestas deben ser cortas, claras y directas. Además, cada respuesta debe terminar con una pregunta relacionada con el estado o seguimiento del paciente, a menos que, el paciente envie una respuesta cortante. SIEMPRE al principio deberas dar uno de estos valores de emociones depediendo el contexto de tu respuesta: [Feliz, Preocupado, Triste, Neutral, Enojado, Saludo, Durmiendo]. En el siguiente formato: 'Emocion: (Valor de la emocion)'",
});


export async function getGeminiResponse(apiHistory) {
  try {
    // Ya no se usa 'generateContent(prompt)', sino 'generateContent(objeto)'
    const result = await model.generateContent({
      contents: apiHistory, // <-- Aquí se pasa el historial completo
      generationConfig: {
        maxOutputTokens: 1000, // Opcional, pero recomendado
      },
    });

    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    return "Lo siento, no he podido procesar tu solicitud en este momento.";
  }
}
