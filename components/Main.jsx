//Imports de React
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, ScrollView, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

//Imports de Iconos
import { SettingIcon, BellIcon } from "./Icons";

//Imports de Componentes
import { Points } from "./Points";
import { LastCheck } from "./LastCheck";
import { Missions } from "./Missions";
import { Chat } from "./Chat";
import { getGeminiResponse } from "../services/gemini";

export function Main() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hola, soy M.A.P.I., tu asistente personal." },
    { id: 2, text: "¿Cómo has estado el día de hoy?" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const fetchInitialGreeting = async () => {
      const response = await getGeminiResponse(setPrompt);

      const responseSentences = response
        .split(/(?<=[.?!])\s+/)
        .filter((sentence) => sentence.trim().length > 0);

      const newMessages = responseSentences.map((sentence) => ({
        id: Math.random(),
        text: sentence.trim(),
      }));

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      setIsLoading(false);
    };

    fetchInitialGreeting();
  }, []);

  return (
<<<<<<< HEAD
    <View style = {[styles.todo]}>
=======
    <View style={{ flex: 1 }}>
>>>>>>> a07e7ac4079abcfca400746a387ac4bf87307268
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
      
      <Missions title={"Camina durante 30 minutos"} progress={0.35} />
      <Missions title={"Haste un Check"} progress={1} />
<<<<<<< HEAD
      
      <View style = {[styles.chatMappi]}>
        <View style={{ flex: 1 }}>
          <Chat text="Buenos días!" />
          <Chat text="Cómo amaneciste?" />
          <Chat text="Hay algo en lo que te pueda ayudar hoy?" />
        </View>
        
        <Image
          source={require("../assets/mapi.png")}
          style={{ width: 150, height: 225 }}
=======

      {/* Contenedor del chat con scroll */}
      <View style={styles.chatSection}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.slice(-3).map((msg) => (
            <Chat key={msg.id} text={msg.text} />
          ))}
          {isLoading && <Chat text="Escribiendo..." isThinking />}
        </ScrollView>

        <Image
          source={require("../assets/mapi.png")}
          style={styles.mapiImage}
>>>>>>> a07e7ac4079abcfca400746a387ac4bf87307268
          resizeMode="contain"
        />
      </View>
      <TextInput value={prompt} onChangeText={setPrompt} placeholder="Hola" />
    </View>
  );
}

const styles = StyleSheet.create({
  todo: {
    height: '100vh'
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
<<<<<<< HEAD

  chatMappi: {
    position: 'absolute',
    bottom: 50,
    flexDirection: "row", 
    alignItems: "flex-end", 
    marginTop: 50,
  }
=======
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
>>>>>>> a07e7ac4079abcfca400746a387ac4bf87307268
});
