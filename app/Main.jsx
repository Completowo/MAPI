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
import { Switch } from "react-native-web";

export default function Main() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapiEmotion, setMapiEmotion] = useState("saludo");

  useEffect(() => {
    const fetchInitialGreeting = async () => {
      setIsLoading(true);

      const initialPrompt = [{ role: "user", parts: [{ text: "Hola" }] }];
      const response = await getGeminiResponse(initialPrompt);

      // Obtener emoción
      const emotionMatch = response.match(
        /Emocion:\s*["'(]*([\wáéíóú]+)["')]*\s*/i
      );
      const emotion = emotionMatch
        ? emotionMatch[1].toLowerCase().replace(/\./g, "")
        : "neutral";
      console.log("EMOCIÓN:", emotion);

      // Unir el resto del texto (sin la línea de emoción)
      const cleanedResponse = response
        .replace(/Emocion:\s*["'(]*[\wáéíóú]+["')]*\s*/i, "")
        .trim();

      // Dividir en oraciones
      const responseSentences = cleanedResponse
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s && s !== "." && s !== "..." && s.length > 1);

      //Mensaje IA
      const newMessages = responseSentences.map((sentence) => ({
        id: Math.random(),
        text: sentence.trim(),
        sender: "assistant",
      }));

      //Mensaje usuario :D
      const userGreatingMessage = {
        id: Math.random(),
        text: "Hola",
        sender: "user",
      };

      setMessages([userGreatingMessage, ...newMessages]);

      setMapiEmotion(emotion);
      setMessages(newMessages);
      setIsLoading(false);
    };

    fetchInitialGreeting();
  }, []);

  //PAPUUU
  const handleSendTranscription = async (transcription) => {
    if (!transcription) return;
    setIsLoading(true);

    //MENSAJE DEL USUARIO
    const newUserMessage = {
      id: Math.random(),
      text: transcription,
      sender: "user",
    };

    const updatedMesages = [...messages, newUserMessage];

    const apiHistory = updatedMesages.map((msg) => {
      return {
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      };
    });

    const response = await getGeminiResponse(apiHistory);

    // Obtener emoción
    const emotionMatch = response.match(
      /Emocion:\s*["'(]*([\wáéíóúñ]+)["')]*\s*/i
    );
    const emotion = emotionMatch
      ? emotionMatch[1].toLowerCase().replace(/\./g, "")
      : "neutral";
    emotion.toLowerCase();
    console.log("EMOCIÓN:", emotion);

    // Unir el resto del texto (sin la línea de emoción)
    const cleanedResponse = response
      .replace(/Emocion:\s*["'(]*[\wáéíóúñ]+["')]*\s*/i, "")
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

    setMessages([...updatedMesages, ...newAssistantMessages]);
    setMapiEmotion(emotion);
    setIsLoading(false);

    console.log(messages);
  };

  //Funcion para solo sacar 2 misiones
  const randomMissions = [...missions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const cambiarImagenEmocion = (Emotion) => {
    switch (Emotion) {
      case "saludo":
        return require("../assets/MAPI-emociones/Saludo.png");
      case "neutral":
        return require("../assets/MAPI-emociones/Neutral.png");
      case "feliz":
        return require("../assets/MAPI-emociones/Feliz.png");
      case "preocupado":
        return require("../assets/MAPI-emociones/Preocupado-2.png");
      case "enojado":
        return require("../assets/MAPI-emociones/Enojado.png");
      case "durmiendo":
        return require("../assets/MAPI-emociones/Durmiendo.png");
      case "shock":
        return require("../assets/MAPI-emociones/Shock.png");
      case "confusion":
        return require("../assets/MAPI-emociones/Confusion.png");
      default:
        return require("../assets/MAPI-emociones/Nose1.png");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Points points={210} />
        <View style={styles.icons}>
          <BellIcon />
          <SettingIcon />
          <Link href="/RoleSelection">
            <Text>BotonPruebas</Text>
          </Link>
        </View>
      </View>

      <LastCheck mgdl={90} lastCheck={26} />

      {randomMissions.map((mission, index) => {
        return (
          <Missions
            key={index}
            title={mission.title}
            progress={mission.progress}
          />
        );
      })}

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
