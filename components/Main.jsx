import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Imports de Iconos
import { SettingIcon, BellIcon } from "./Icons";

// Imports de Componentes
import { Points } from "./Points";
import { LastCheck } from "./LastCheck";
import { Missions } from "./Missions";
import { Chat } from "./Chat";
import { BotonGrabacion } from "./BotonGrabacion";
import { getGeminiResponse } from "../services/gemini";

//Import misiones
import missions from "../assets/missions.json";

export function Main() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInitialGreeting = async () => {
      setIsLoading(true);

      const initialPrompt = [
        {role: "user", parts:[{text: "Hola"}] }
      ]
      const response = await getGeminiResponse(initialPrompt);

      //Divide la respuesta en oraciones
      const responseSentences = response
        .split(/(?<=[.?!])\s+/)
        .filter((sentence) => sentence.trim().length > 0);

      //Mensaje IA  
      const newMessages = responseSentences.map((sentence) => ({
        id: Math.random(),
        text: sentence.trim(),
        sender: "assistant",
      }));

      //Mensaje usuario :D
      const userGreatingMessage ={
        id: Math.random(),
        text: "Hola",
        sender: "user",
      }

      setMessages([userGreatingMessage, ...newMessages])
      
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

    const apiHistory = updatedMesages.map((msg)=>{
      return {
        role: msg.sender ==='user' ? 'user' : 'model',
        parts:[{text: msg.text}]
      }
    })

    const response = await getGeminiResponse(apiHistory);

    const responseSentences = response
      .split(/(?<=[.?!])\s+/)
      .filter((sentence) => sentence.trim().length > 0);

        //MENSAJE DE LA IA
    const newAssistantMessages = responseSentences.map((sentence) => ({
      id: Math.random(),
      text: sentence.trim(),
      sender: "assistant",
    }));


    
    setMessages([...updatedMesages, ...newAssistantMessages]);
    setIsLoading(false);

    console.log(messages)
  };

  //Funcion para solo sacar 2 misiones
  const randomMissions = [...missions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

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
          {messages.map((msg) => (
            <Chat key={msg.id} text={msg.text} sender={msg.sender} />
          ))}
          {isLoading && <Chat text="Escribiendo..." isThinking />}
        </ScrollView>

        <Image
          source={require("../assets/mapi.png")}
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
  todo: {
    height: "100vh",
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
    flex: 1, // permite que el scroll ocupe espacio dinámico
  },
  mapiImage: {
    width: 150,
    height: 225,
    marginRight: 10,
  },
});
