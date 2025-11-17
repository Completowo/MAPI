import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { TextInput } from "react-native-web";
import { loginDoctor } from "../services/supabase";

const doctorLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Función para manejar el inicio de sesión
  const handleLogin = () => {
    setError("");

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const { error, user, profile } = await loginDoctor({ email, password });
        if (error) {
          setError("Credenciales incorrectas, Revisa tu correo y/o contraseña.");
        } else if (!profile) {
          setError("No se encontró el perfil del médico. Contacta al administrador");
        } else {
          const name = (profile && profile.nombre) ? profile.nombre : (user?.email || "");
          router.push(`/doctorView?name=${encodeURIComponent(name)}`);
        }
      } catch (e) {
        setError("Credenciales incorrectas, Revisa tu correo y/o contraseña.");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BIENVENIDO</Text>
      <Text style={styles.subtitle}>Profesional Médico</Text>
      <View style={styles.content}>
        <View style={styles.loginContainer}>
          <Image
            source={require("../assets/MAPI-emociones/Modal/Despedida.png")}
            style={{
              width: 100,
              height: 100,
              position: "absolute",
              top: -60,
              right: -45,
            }}
          />
          <Image
            source={require("../assets/MAPI-emociones/Burbujas/Burbuja2.png")}
            style={{
              position: "absolute",
              resizeMode: "contain",
              height: 100,
              width: 210,
              top: -130,
              left: 165,
            }}
          />
          <Text
            style={{
              position: "absolute",
              top: -105,
              left: 175,
              textAlign: "center",
              color: "white",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            !Porfavor ingresa tu rut para empezar¡
          </Text>
          <TextInput
            style={[styles.input, focusedInput === "email" && styles.inputFocused]}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, focusedInput === "password" && styles.inputFocused]}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry
            placeholderTextColor="#999"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#515151" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/RoleSelection")}>
          <Text style={styles.downText}>Volver al Login de pacientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 25 }}
          onPress={() => router.push("/doctorRegister")}
        >
          <Text style={styles.downText}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontWeight: "bold", color: "#FFFFFF", opacity: 0.5 }}>
          M.A.P.I
        </Text>
        <Text style={{ fontWeight: "bold", color: "#FFFFFF", opacity: 0.5 }}>
          Software
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#757575",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginBottom: 120,
  },
  title: {
    fontSize: 46,
    color: "#ffffffff",
    textAlign: "center",
    marginTop: 80,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 20,
    color: "#ffffffff",
    fontWeight: "500",
    textAlign: "center",
  },
  loginContainer: {
    width: "100%",
    maxWidth: 360,
    gap: 16,
    borderRadius: 25,
    padding: 24,
    borderColor: "#afafafff",
    boxShadow: "0px 6px 6px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#515151",
  },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#7F7F7F",
    backgroundColor: "#7F7F7F",
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  button: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "white",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#515151",
  },
  errorText: {
    color: "#ffcdd2",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  downText: {
    marginTop: 12,
    color: "#5EC7FF",
    fontSize: 12,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default doctorLogin;
