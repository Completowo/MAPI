import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from "react-native";

// Función para formatear RUT
const formatRut = (rutValue) => {
  let cleaned = rutValue.replace(/[^0-9kK]/g, "").toUpperCase();
  if (!cleaned) return "";
  let dv = cleaned.slice(-1);
  let numbers = cleaned.slice(0, -1);
  numbers = numbers.replace(/[^0-9]/g, "");
  while (numbers.length < 8) {
    numbers = "0" + numbers;
  }
  numbers = numbers.slice(-8);
  let formatted = "";
  for (let i = numbers.length - 1; i >= 0; i--) {
    formatted = numbers[i] + formatted;
    if (i > 0 && (numbers.length - i) % 3 === 0) {
      formatted = "." + formatted;
    }
  }
  return formatted + "-" + dv;
};

export function PacienteLogin({ onBack, onLoginSuccess }) {
  const [rut, setRut] = useState("");
  const [rutError, setRutError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validar formato de RUT
    const formattedRut = formatRut(rut);
    if (formattedRut.length < 11) {
      setRutError("RUT inválido");
      Alert.alert("RUT inválido", "Por favor ingresa un RUT válido.");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implementar verificación de RUT contra MongoDB
      // const response = await verificarPaciente({ rut: formattedRut });
      // if (response.ok) {
      //   onLoginSuccess(response.data);
      // }
      
      // Por ahora simulamos éxito
      Alert.alert("TODO", "Implementar verificación de RUT");
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert("Error", "No se pudo verificar el RUT");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backRow}>
        <Text style={styles.backText}>Volver</Text>
      </Pressable>

      <Text style={styles.title}>Acceso Pacientes</Text>
      <Text style={styles.subtitle}>Ingresa tu RUT para continuar</Text>

      <TextInput
        style={[styles.input, rutError ? styles.inputError : null]}
        placeholder="RUT (ej: 12.345.678-9)"
        value={rut}
        onChangeText={(text) => {
          setRut(text);
          setRutError("");
        }}
        onBlur={() => {
          if (rut) {
            const formattedRut = formatRut(rut);
            setRut(formattedRut);
            if (formattedRut.length < 11) {
              setRutError("RUT inválido");
            }
          }
        }}
        placeholderTextColor="#999"
        maxLength={12}
      />
      {rutError ? <Text style={styles.errorText}>{rutError}</Text> : null}

      <Pressable 
        style={[styles.loginButton, isLoading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoading}>
        <Text style={styles.loginButtonText}>
          {isLoading ? "Verificando..." : "Continuar"}
        </Text>
      </Pressable>
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
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    color: '#5A7B9B',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    marginBottom: 8,
    color: "#83C1FF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#5A7B9B",
    textAlign: "center",
    marginBottom: 32,
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
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF9F9",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 12,
    fontSize: 14,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: "#83C1FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: "#A5D3FF",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PacienteLogin;