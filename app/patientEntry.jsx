import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { findPatientByRut, createPatientAccount } from "../services/supabase";
import { BackButton } from "../components/BackButton";

// Pantalla de entrada para pacientes
// Permite que un paciente se registre con su RUT (previamente registrado por un médico)
// y cree su cuenta en la aplicación
export default function PatientEntry() {
  const router = useRouter();
  // Estados para el proceso de búsqueda y creación de cuenta
  const [rut, setRut] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState(null);
  const [error, setError] = useState("");

  // Estados para el formulario de creación de cuenta
  const [age, setAge] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [diabetesType, setDiabetesType] = useState("");

  // Función para limpiar el RUT (eliminar puntos, guiones y espacios)
  function cleanRut(value) {
    if (!value) return "";
    return value.replace(/\.|\-|\s/g, "").toUpperCase();
  }

  // Función para validar RUT chileno usando el algoritmo del dígito verificador
  function validateRut(value) {
    const cleaned = cleanRut(value);
    if (!cleaned || cleaned.length < 2) return false;
    const body = cleaned.slice(0, -1);
    let dv = cleaned.slice(-1);
    dv = dv === "K" ? "K" : dv;
    if (!/^\d{7,8}$/.test(body)) return false;
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const remainder = sum % 11;
    const expected = 11 - remainder;
    let expectedDv = "";
    if (expected === 11) expectedDv = "0";
    else if (expected === 10) expectedDv = "K";
    else expectedDv = String(expected);
    return expectedDv === dv;
  }

  // Función para verificar si el RUT fue registrado por algún médico
  const handleCheckRut = async () => {
    setError("");
    setFoundPatient(null);
    const cleaned = cleanRut(rut);

    // Validar que el RUT sea válido
    if (!validateRut(cleaned)) {
      setError("RUT inválido");
      return;
    }

    setLoading(true);
    // Buscar el paciente en la base de datos
    const { paciente, error } = await findPatientByRut(cleaned);
    setLoading(false);

    if (error) {
      setError(error.message || String(error));
      return;
    }

    // Verificar que el paciente fue registrado por algún médico
    if (!paciente) {
      setError("RUT no registrado por ningún médico");
      return;
    }

    // Si el RUT existe, cargar sus datos
    setFoundPatient(paciente);
    setEmailInput("");
    setDiabetesType(paciente.diabetes_type ?? "");
  };

  // Función para crear la cuenta del paciente
  const handleCreateAccount = async () => {
    setError("");

    // Validar que se encontró un paciente
    if (!foundPatient) {
      setError("Primero verifique el RUT");
      return;
    }

    // Validar campos requeridos
    if (!age || !password) {
      setError("Ingrese edad y contraseña");
      return;
    }

    // Validar email
    if (!emailInput || emailInput.length < 5) {
      setError("Ingrese correo electrónico válido");
      setLoading(false);
      return;
    }

    setLoading(true);
    const cleaned = cleanRut(rut);
    const emailToUse = emailInput;

    // Crear cuenta del paciente con sus datos personales
    const { user, paciente, error } = await createPatientAccount({
      rut: cleaned,
      age: parseInt(age, 10),
      password,
      email: emailToUse,
    });

    setLoading(false);

    if (error) {
      setError(error.message || String(error));
      return;
    }

    // Navegar a la pantalla principal si la cuenta se creó exitosamente
    router.replace("Main");
  };

  return (
    <View style={styles.container}>
      {/*Boton de retroceso a la pantalla anterior*/}
      <BackButton onPress={() => router.back()} />
      {/* Título de la pantalla */}
      <Text style={styles.title}>Acceso Paciente</Text>

      {/* Input para el RUT del paciente */}
      <TextInput
        style={styles.input}
        placeholder="RUT"
        value={rut}
        onChangeText={setRut}
      />

      {/* Botón para verificar si el RUT fue registrado por un médico */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleCheckRut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verificar RUT</Text>
        )}
      </TouchableOpacity>

      {/* Mostrar mensaje de error si existe */}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      {/* Si el RUT fue encontrado, mostrar formulario para crear cuenta */}
      {foundPatient ? (
        <View style={styles.card}>
          {/* Mostrar información del paciente encontrado */}
          <Text>Paciente: {foundPatient.nombre}</Text>
          <Text>RUT: {foundPatient.rut}</Text>

          {/* Input para la edad del paciente */}
          <TextInput
            style={styles.input}
            placeholder="Edad"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          {/* Input para el correo electrónico del paciente */}
          <TextInput
            style={styles.input}
            placeholder="Correo (ej. ejemplo@gmail.com)"
            value={emailInput}
            onChangeText={setEmailInput}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Mostrar tipo de diabetes si existe */}
          {diabetesType ? (
            <Text>
              Tipo de diabetes:{" "}
              {diabetesType === "1"
                ? "Tipo 1"
                : diabetesType === "2"
                  ? "Tipo 2"
                  : diabetesType}
            </Text>
          ) : null}

          {/* Input para la contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Botón para crear la cuenta del paciente */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  card: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  typeBtn: { padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 6 },
  typeBtnActive: { backgroundColor: "#cfe8ff" },
});
