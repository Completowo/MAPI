import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { supabase } from "../services/supabase";

//Async Storage Para guardar las misiones y que se cambien cada 24Horas
import AsyncStorage from "@react-native-async-storage/async-storage";

// Imports de Iconos
import { SettingIcon, BellIcon } from "../components/Icons";

// Imports de Componentes
import { Points } from "../components/Points";
import { LastCheck } from "../components/LastCheck";
import { Missions } from "../components/Missions";
import { Chat } from "../components/Chat";
import { BotonGrabacion } from "../components/BotonGrabacion";
import { getGeminiResponse } from "../services/gemini";

//Import misiones
import missions from "../assets/missions.json";

export function Main() {
  const scrollViewRef = useRef();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapiEmotion, setMapiEmotion] = useState("saludo");
  const [dailyMissions, setDailyMissions] = useState([]);

  //Ropa de MAPI
  const dress = "elegante";

  //Id del chat en Supabase(Para pruebas)
  const id = "2";

  //Función para obtener el chat de Supabase
  const fetchChatHistory = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("messages", "emotion")
      .eq("id", id)
      .single();

    if (error) {
      console.log("Error al obtener el chat", error);
      return [];
    }

    return {
      messages: data?.messages || [],
      emotion: data?.emotion || "neutral",
    };
  };

  //Trae el historial devuelva
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const { messages: history, emotion: historyEmotion } =
        await fetchChatHistory();

      //Setear Historial y emociones desde la base de datos
      if (history.length > 0) {
        console.log("Historial cargado desde Supabase");
        setMapiEmotion(historyEmotion || "neutral");
        setMessages(history);
        setIsLoading(false);
        return;
      }

      //Si no hay historial, iniciar saludo
      const initialPrompt = [{ role: "user", parts: [{ text: "Hola" }] }];
      const response = await getGeminiResponse(initialPrompt);

      const emotionMatch = response.match(
        /Emocion:\s*["'(\[]*([\wáéíóúñ]+)["')\]]*\s*/i
      );
      const emotion = emotionMatch
        ? emotionMatch[1].toLowerCase().replace(/\./g, "")
        : "neutral";

      const cleanedResponse = response
        .replace(/Emocion:\s*["'(\[]*([\wáéíóúñ]+)["')\]]*\s*/i, "")
        .trim();

      const responseSentences = cleanedResponse
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s && s !== "." && s !== "..." && s.length > 1);

      const userGreeting = { id: Math.random(), text: "Hola", sender: "user" };
      const newMessages = responseSentences.map((sentence) => ({
        id: Math.random(),
        text: sentence.trim(),
        sender: "assistant",
      }));

      const combinedMessages = [userGreeting, ...newMessages];
      setMessages(combinedMessages);
      setMapiEmotion(emotion);
      setIsLoading(false);

      // Guardar nuevo chat en Supabase
      await supabase.from("chats").upsert([
        {
          id: id,
          messages: combinedMessages,
          emotion: emotion,
          created_at: new Date(),
        },
      ]);
    };

    fetchData();
  }, []);

  //Función principal de chat de la ia
  const handleSendTranscription = async (transcription) => {
    if (!transcription) return;
    setIsLoading(true);

    const { messages: history } = await fetchChatHistory();

    //MENSAJE DEL USUARIO
    const newUserMessage = {
      id: Math.random(),
      text: transcription,
      sender: "user",
    };

    const updatedMesages = [...history, newUserMessage];

    const apiHistory = updatedMesages.map((msg) => {
      return {
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      };
    });

    const response = await getGeminiResponse(apiHistory);

    // Obtener emoción
    const emotionMatch = response.match(
      /Emocion:\s*["'(\[]*([\wáéíóúñ]+)["')\]]*\s*/i
    );
    const emotion = emotionMatch
      ? emotionMatch[1].toLowerCase().replace(/\./g, "")
      : "neutral";
    emotion.toLowerCase();
    console.log("EMOCIÓN:", emotion);

    // Unir el resto del texto (sin la línea de emoción)
    const cleanedResponse = response
      .replace(/Emocion:\s*["'(\[]*([\wáéíóúñ]+)["')\]]*\s*/i, "")
      .trim();

    // Dividir en oraciones
    const responseSentences = cleanedResponse
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s && s !== "." && s !== "..." && s.length > 1);

    //MENSAJE DE LA IA
    const newAssistantMessages = responseSentences.map((sentence) => ({
      id: Math.random(),
      text: sentence.trim(),
      sender: "assistant",
    }));

    const finalMessages = [...updatedMesages, ...newAssistantMessages];

    setMessages(finalMessages);
    setMapiEmotion(emotion);
    setIsLoading(false);

    //Mandar chat a Supabase
    const { error } = await supabase.from("chats").upsert([
      {
        id: id,
        messages: finalMessages,
        created_at: new Date(),
        emotion: emotion,
      },
    ]);

    if (error) console.log("Error guardando chat", error);

    console.log(apiHistory);
    console.log("Emocion: ", emotion);
  };

  //Función para cambiar la imagen de MAPI según la emoción

  const cambiarImagenEmocion = (Emotion) => {
    switch (Emotion) {
      case "saludo":
        return require(`../assets/MAPI-emociones/${dress}/Saludo.png`);
      case "neutral":
        return require(`../assets/MAPI-emociones/${dress}/Neutral.png`);
      case "feliz":
        return require(`../assets/MAPI-emociones/${dress}/Feliz.png`);
      case "preocupado":
        return require(`../assets/MAPI-emociones/${dress}/Preocupado-2.png`);
      case "enojado":
        return require(`../assets/MAPI-emociones/${dress}/Enojado.png`);
      case "confusion":
        return require(`../assets/MAPI-emociones/${dress}/Confusion.png`);
      default:
        return require(`../assets/MAPI-emociones/${dress}/Nose1.png`);
    }
  };
  //Carga de misiones diarias
  useEffect(() => {
    const loadMissions = async () => {
      try {
        const saveData = await AsyncStorage.getItem("dailyMissions");
        const today = new Date().toDateString();

        if (saveData) {
          const { date, missions } = JSON.parse(saveData);

          if (date === today) {
            setDailyMissions(missions);
            return;
          }
        }

        //Cargar nuevas misiones aleatorias
        const newMissions = [...missions]
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);

        await AsyncStorage.setItem(
          "dailyMissions",
          JSON.stringify({ date: today, missions: newMissions })
        );
        setDailyMissions(newMissions);
      } catch (error) {
        console.error("Error cargando misiones diarias:", error);
      }
    };
    loadMissions();
  }, [Missions]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header]}>
        <Points points={210} />
        <View style={styles.icons}>
          <BellIcon />
          <SettingIcon />
          <Link href="/RoleSelection">
            <Text>BotonPruebas</Text>
          </Link>
        </View>
      </View>

      <LastCheck lastCheck={26} />

      {dailyMissions.map((mission, index) => (
        <Missions
          key={index}
          title={mission.title}
          progress={mission.progress}
        />
      ))}

      {/* Contenedor del chat con scroll */}
      <View style={styles.chatSection}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {/*VARIABLE messages para los mensajes */}
          {messages.map((msg) => (
            //console.log("msg", msg),
            <Chat key={msg.id} text={msg.text} sender={msg.sender} />
          ))}
          {isLoading && <Chat text="Escribiendo..." isThinking />}
        </ScrollView>

        <Image
          source={cambiarImagenEmocion(mapiEmotion)}
          style={styles.mapiImage}
          resizeMode="contain"
        />
      </View>

      <BotonGrabacion
        onTranscription={(text) => {
          if (!text) return;

          // 1. Agregar mensaje de usuario
          const userMessage = {
            id: Math.random(),
            text,
            sender: "user",
          };
          setMessages((prev) => [...prev, userMessage]);

          // 2. Pedir respuesta de Gemini
          handleSendTranscription(text);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "50vh",
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  icons: {
    position: "absolute",
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  chatSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 50,
    marginBottom: 20,
    flex: 1, // permite que el scroll ocupe espacio dinámico
  },
  mapiImage: {
    width: 150,
    height: 225,
    marginRight: 10,
  },
});
