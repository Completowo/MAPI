import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, Alert } from "react-native";
import { login } from "../services/api";

export function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Validación mínima de ejemplo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email inválido", "Por favor ingresa un correo válido.");
      return;
    }

    if (!password) {
      Alert.alert("Contraseña requerida", "Ingresa tu contraseña.");
      return;
    }

    // Llamar al backend para validar credenciales
    (async () => {
      try {
        const res = await login({ email, password });
        if (res && res.success && res.medico) {
          if (onLoginSuccess) {
            // Agregar el rol al objeto del médico
            onLoginSuccess({
              ...res.medico,
              role: 'medico'
            });
          }
        } else {
          Alert.alert('Error', 'Credenciales inválidas');
        }
      } catch (err) {
        console.error('Login error:', err);
        Alert.alert('Error', 'No se pudo iniciar sesión');
      }
    })();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Gmail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
      />

      <Pressable style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </Pressable>

      <View style={styles.rowCenter}>
        <Text style={styles.smallText}>¿No tienes cuenta?</Text>
        <Pressable onPress={onSwitchToRegister}>
          <Text style={styles.linkText}> Crear cuenta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    shadowColor: "#83C1FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    marginBottom: 24,
    color: "#83C1FF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E6F3FF",
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#2B2B2B",
    backgroundColor: "#fff",
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#83C1FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#83C1FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  rowCenter: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  smallText: {
    color: "#5A7B9B",
    fontSize: 15,
  },
  linkText: {
    color: "#83C1FF",
    fontWeight: "500",
    fontSize: 15,
  },
});

export default Login;
