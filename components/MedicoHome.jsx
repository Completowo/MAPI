import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView
} from "react-native";

// Función para formatear RUT (reutilizada de Register.jsx)
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

export function MedicoHome({ onLogout, medicoData }) {
  const [rutPaciente, setRutPaciente] = useState("");
  const [rutError, setRutError] = useState("");
  const [pacientesRegistrados, setPacientesRegistrados] = useState([]); // Para mostrar lista de pacientes añadidos

  const handleRegistrarPaciente = async () => {
    // Validar RUT
    const formattedRut = formatRut(rutPaciente);
    if (formattedRut.length < 11) {
      setRutError("RUT inválido");
      Alert.alert("RUT inválido", "Por favor ingresa un RUT válido.");
      return;
    }

    try {
      // TODO: Implementar llamada al backend para registrar paciente
      // const response = await registrarPaciente({ rut: formattedRut, medicoId: medicoData.id });
      
      Alert.alert("Éxito", "Paciente registrado correctamente");
      setRutPaciente("");
      // Actualizar lista de pacientes
      setPacientesRegistrados(prev => [...prev, { rut: formattedRut, fecha: new Date() }]);
    } catch (error) {
      console.error('Error registrando paciente:', error);
      Alert.alert("Error", "No se pudo registrar al paciente");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel del Médico</Text>
        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Bienvenido, Dr. {medicoData?.nombre || ""}
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, rutError ? styles.inputError : null]}
            placeholder="RUT del paciente (ej: 12.345.678-9)"
            value={rutPaciente}
            onChangeText={(text) => {
              setRutPaciente(text);
              setRutError("");
            }}
            onBlur={() => {
              if (rutPaciente) {
                const formattedRut = formatRut(rutPaciente);
                setRutPaciente(formattedRut);
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
            style={styles.registerButton}
            onPress={handleRegistrarPaciente}>
            <Text style={styles.registerButtonText}>Registrar Paciente</Text>
          </Pressable>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Pacientes Registrados</Text>
          <ScrollView style={styles.list}>
            {pacientesRegistrados.map((paciente, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>
                  RUT: {paciente.rut}
                </Text>
                <Text style={styles.listItemDate}>
                  {paciente.fecha.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E6F3FF",
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#83C1FF",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: "#2B2B2B",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
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
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: "#83C1FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    marginTop: 24,
  },
  listTitle: {
    fontSize: 18,
    color: "#2B2B2B",
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6F3FF",
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 16,
    color: "#2B2B2B",
  },
  listItemDate: {
    fontSize: 14,
    color: "#5A7B9B",
  },
});

export default MedicoHome;