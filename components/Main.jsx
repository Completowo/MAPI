import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Image, ScrollView, TextInput, Pressable, Text, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Imports de Iconos
import { SettingIcon, BellIcon } from "./Icons";

// Imports de Componentes
import { Points } from "./Points";
import { LastCheck } from "./LastCheck";
import { Missions } from "./Missions";
import { Chat } from "./Chat";
import { BotonGrabacion } from "./BotonGrabacion";
import { Login } from "./Login";
import { Register } from "./Register";
import { RoleSelection } from "./RoleSelection";
import { PatientHome } from "./PatientHome";
import { MedicoHome } from "./MedicoHome";
import { PacienteLogin } from "./PacienteLogin";
import { getGeminiResponse } from "../services/gemini";
import { saveMedico } from "../services/api";

export function Main() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(true); // true = mostrar registro, false = mostrar login
  const [userData, setUserData] = useState(null);
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null); // 'doctor' | 'patient' | null

  // Cargar estado de autenticación al inicio y verificar estado del médico periódicamente
  useEffect(() => {
    const verifyMedicoStatus = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem('@auth_state');
        const storedUser = await AsyncStorage.getItem('@user_data');
        
        if (storedAuth === 'true' && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verificar si el usuario aún existe en MongoDB
          try {
            await verificarMedico({ email: userData.email });
            // Si no hay error, el médico existe
            setIsAuthenticated(true);
            setUserData(userData);
          } catch (err) {
            console.log('Usuario no encontrado en MongoDB, cerrando sesión');
            // Si el médico no existe, limpiar el estado local
            await handleLogout();
            Alert.alert(
              'Sesión finalizada',
              'Tu cuenta ha sido eliminada del sistema'
            );
          }
        }
      } catch (error) {
        console.error('Error verificando estado:', error);
        // Si hay error, mejor cerrar sesión para evitar estados inconsistentes
        await handleLogout();
      }
    };

    // Verificar al inicio
    verifyMedicoStatus();

    // Verificar cada 30 segundos si el médico sigue existiendo
    const interval = setInterval(verifyMedicoStatus, 30000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchInitialGreeting = async () => {
      setIsLoading(true);
      const response = await getGeminiResponse("Hola");

      const responseSentences = response
        .split(/(?<=[.?!])\s+/)
        .filter((sentence) => sentence.trim().length > 0);

      const newMessages = responseSentences.map((sentence) => ({
        id: Math.random(),
        text: sentence.trim(),
        sender: "assistant",
      }));

      setMessages(newMessages);
      setIsLoading(false);
    };

    fetchInitialGreeting();
  }, []);

  const handleSend = async () => {
    if (prompt.trim().length === 0) return;

    const userMessage = {
      id: Math.random(),
      text: prompt,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentPrompt = prompt;
    setPrompt("");
    setIsLoading(true);

    const response = await getGeminiResponse(currentPrompt);
    const responseSentences = response
      .split(/(?<=[.?!])\s+/)
      .filter((sentence) => sentence.trim().length > 0);

    const newAssistantMessages = responseSentences.map((sentence) => ({
      id: Math.random(),
      text: sentence.trim(),
      sender: "assistant",
    }));

    setMessages((prevMessages) => [...prevMessages, ...newAssistantMessages]);
    setIsLoading(false);
  };

  const handleSendTranscription = async (transcription) => {
    if (!transcription) return;
    setIsLoading(true);
    const response = await getGeminiResponse(transcription);

    const responseSentences = response
      .split(/(?<=[.?!])\s+/)
      .filter((sentence) => sentence.trim().length > 0);

    const newAssistantMessages = responseSentences.map((sentence) => ({
      id: Math.random(),
      text: sentence.trim(),
      sender: "assistant",
    }));

    setMessages((prevMessages) => [...prevMessages, ...newAssistantMessages]);
    setIsLoading(false);
  };

  // Handlers para autenticación
  const handleLogin = async (userData) => {
    try {
      await AsyncStorage.setItem('@auth_state', 'true');
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      setUserData(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth state:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión');
    }
  };

  const handleRegister = async (userData) => {
    try {
      await AsyncStorage.setItem('@auth_state', 'true');
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      setUserData(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth state:', error);
      Alert.alert('Error', 'No se pudo completar el registro');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_state');
      await AsyncStorage.removeItem('@user_data');
      setIsAuthenticated(false);
      setUserData(null);
      setShowRegister(false); // Mostrar login después de cerrar sesión
      setShowRoleSelection(true);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };
  // Si no está autenticado, mostrar flujo de selección de rol y auth
  if (!isAuthenticated) {
    // 1) Mostrar pantalla inicial de selección de rol
    if (showRoleSelection) {
      return (
        <View style={[styles.authContainer, { paddingTop: insets.top }]}>
          <RoleSelection
            onSelectDoctor={() => {
              setSelectedRole('doctor');
              setShowRoleSelection(false);
              setShowRegister(true);
            }}
            onSelectPatient={() => {
              setSelectedRole('patient');
              setShowRoleSelection(false);
            }}
          />
        </View>
      );
    }

    // Si eligió paciente, mostrar login por RUT
    if (selectedRole === 'patient') {
      return (
        <View style={[styles.authContainer, { paddingTop: insets.top }]}> 
          <PacienteLogin 
            onBack={() => {
              setSelectedRole(null);
              setShowRoleSelection(true);
            }}
            onLoginSuccess={(pacienteData) => {
              setUserData(pacienteData);
              setIsAuthenticated(true);
            }}
          />
        </View>
      );
    }

    // 3) Si eligió médico, mostrar login/register existentes
    return (
      <View style={[styles.authContainer, { paddingTop: insets.top }]}> 
        {showRegister ? (
          <Register
            onBack={() => {
              setSelectedRole(null);
              setShowRoleSelection(true);
            }}
            onSwitchToLogin={() => setShowRegister(false)}
            onRegisterSuccess={async (userData) => {
              console.log('Registro exitoso:', userData);
              // Guardar en AsyncStorage y actualizar estado
              await handleRegister(userData);
              // Cambiar a la vista de login después del registro exitoso
              setShowRegister(false);
            }}
          />
        ) : (
          <Login
            onSwitchToRegister={() => setShowRegister(true)}
            onLoginSuccess={(userData) => {
              console.log('Login exitoso:', userData);
              handleLogin(userData);
            }}
          />
        )}
      </View>
    );
  }

  // Vista principal cuando está autenticado
  if (userData?.role === 'medico') {
    return (
      <MedicoHome
        medicoData={userData}
        onLogout={handleLogout}
      />
    );
  }

  // Vista de administrador
  if (userData?.role === 'admin') {
    return (
      <AdminDoctores
        onBack={handleLogout}
      />
    );
  }

  // Vista de paciente (la original)
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
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>

      <LastCheck mgdl={90} lastCheck={26} />

      <Missions title={"Camina durante 30 minutos"} progress={0.35} />
      <Missions title={"Haste un Check"} progress={1} />

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
  authContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 16,
  },
  logoutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
