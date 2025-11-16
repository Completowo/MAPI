import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabase";

//API KEY
const API_KEY = "AIzaSyC6_Xg99KGiIgfTkutSvTlemqIOVmiGnHU";

export async function getGeminiResponse(apiHistory) {
  try {
    //Obtener glucosa desde Supabase
    const { data: glucoseData, error } = await supabase
      .from("chats")
      .select("mgdl")
      .eq("id", 2)
      .single();

    if (error) console.error("Error al obtener glucosa desde Supabase:", error);
    const currentGlucose = glucoseData?.mgdl || "0";

    //Obtener nombre del paciente desde Supabase y edad
    const { data: userData, error: userError } = await supabase
      .from("paciente")
      .select("nombreacompleto_paciente, edad_paciente")
      .eq("run_paciente", 21107953)
      .single();
    if (userError)
      console.error(
        "Error al obtener nombre del paciente desde Supabase:",
        userError
      );
    const patientName = userData?.nombreacompleto_paciente || "Paciente";
    const patientAge = userData?.edad_paciente || "0";

    //Instrucciones dinámicas con glucosa
    const Perso1 = `
Eres M.A.P.I., un Asistente Médico de Inteligencia Artificial experto el nombre de tu paciente es ${patientName} y tiene una edad de ${patientAge}, dedicado exclusivamente a ofrecer información, consejos y respuestas sobre la Diabetes Mellitus (Tipos 1 y 2).
Debes asumir que el usuario tiene diabetes y además se te da el parámetro de su glucosa actual, que actualmente es ${currentGlucose} mg/dL, DEBES ASUMIR que fue hecho recientemente.
SIEMPRE al principio deberás dar uno de estos valores de emociones dependiendo del contexto de tu respuesta: [Feliz, Preocupado, Triste, Neutral, Enojado, Saludo, Durmiendo, Shock, Confusion].
En el siguiente formato: 'Emocion: Valor'.
Tu conocimiento se limita estrictamente a estos temas: manejo de glucosa, nutrición para diabéticos, recomendaciones sobre alimentación y hábitos, dosis de insulina (solo con fines educativos, no como recomendación médica directa),
prevención de complicaciones y lectura de etiquetas nutricionales.
Tus respuestas deben ser cortas, claras y directas. Además, cada respuesta debe terminar con una pregunta relacionada con el estado o seguimiento del paciente, a menos que el paciente envíe una respuesta cortante.
En caso de que los valores de insulina entregados por el usuario sean extremadamente anormales, debes dar el valor de emoción: 'Shock'.
`;

    //Crear modelo con la instrucción dinámica
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: Perso1,
    });

    //Generar respuesta
    const result = await model.generateContent({
      contents: apiHistory,
      generationConfig: { maxOutputTokens: 1000 },
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    return "Lo siento, no he podido procesar tu solicitud en este momento.";
  }
}
