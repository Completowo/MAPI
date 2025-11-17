import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { TextInput } from "react-native";
import {
  createPatientAccount,
  findPatientByRut,
  loginPatient,
} from "../services/supabase";

const RoleSelection = () => {
  const router = useRouter();
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Función para formatear el RUT (XX.XXX.XXX-X)
  const formatRut = (value) => {
    const cleaned = value.replace(/[^\dkK]/g, "").toUpperCase();

    if (cleaned.length === 0) return "";

    // El último carácter es el DV (dígito verificador)
    // El resto es el cuerpo del RUT
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    if (body.length === 0) return cleaned; // Solo se escribió el DV

    // Formatear según la longitud del cuerpo (sin DV)
    // Formato: X.XXX.XXX-X
    if (body.length === 1) {
      return body + "-" + dv;
    } else if (body.length === 2) {
      return body.slice(0, 1) + "." + body.slice(1) + "-" + dv;
    } else if (body.length === 3) {
      return (
        body.slice(0, 1) + "." + body.slice(1) + "." + body.slice(2) + "-" + dv
      );
    } else if (body.length === 4) {
      return (
        body.slice(0, 1) +
        "." +
        body.slice(1, 4) +
        "." +
        body.slice(4) +
        "-" +
        dv
      );
    } else if (body.length === 5) {
      return (
        body.slice(0, 2) +
        "." +
        body.slice(2, 5) +
        "." +
        body.slice(5) +
        "-" +
        dv
      );
    } else if (body.length === 6) {
      return (
        body.slice(0, 2) +
        "." +
        body.slice(2, 5) +
        "." +
        body.slice(5) +
        "-" +
        dv
      );
    } else if (body.length === 7) {
      return (
        body.slice(0, 1) +
        "." +
        body.slice(1, 4) +
        "." +
        body.slice(4) +
        "-" +
        dv
      );
    } else if (body.length === 8) {
      return (
        body.slice(0, 2) +
        "." +
        body.slice(2, 5) +
        "." +
        body.slice(5) +
        "-" +
        dv
      );
    }

    return cleaned; // Si excede 8 dígitos, retornar sin formato
  };

  const handleRutChange = (value) => {
    // Si el valor es más corto que el anterior, es un borrado, no formatear aún
    if (value.length < rut.length) {
      setRut(value);
    } else {
      // Limpiar el valor
      const cleaned = value.replace(/[^\dkK]/g, "").toUpperCase();

      // Solo formatear si tiene 8-9 caracteres limpios (7-8 dígitos + DV)
      if (/^\d{7,8}[0-9Kk]$/.test(cleaned)) {
        const formatted = formatRut(cleaned);
        setRut(formatted);
      } else {
        // Si no cumple el patrón, mostrar el valor sin formato
        setRut(value);
      }
    }
  };

  // Función para validar RUT
  const validateRut = (rutValue) => {
    const cleaned = rutValue.replace(/[^\dkK]/g, "").toUpperCase();

    if (cleaned.length < 8) {
      return { valid: false, message: "El RUT debe tener al menos 8 dígitos" };
    }

    if (cleaned.length > 9) {
      return {
        valid: false,
        message: "El RUT no puede tener más de 9 caracteres",
      };
    }

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    if (!/^\d+$/.test(body)) {
      return {
        valid: false,
        message: "El RUT debe contener solo números y dígito verificador",
      };
    }

    let s = 0;
    let m = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      s += parseInt(body.charAt(i)) * m;
      m++;
      if (m > 7) m = 2;
    }

    const r = 11 - (s % 11);
    const expectedDv = r === 11 ? "0" : r === 10 ? "K" : String(r);

    if (dv !== expectedDv) {
      return { valid: false, message: "El RUT ingresado no es válido" };
    }

    return { valid: true };
  };

  // Función para manejar el login del paciente
  const handleLogin = async () => {
    setError("");

    if (!rut.trim()) {
      setError("Por favor ingresa tu RUT");
      return;
    }

    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    // Validar formato del RUT
    const rutValidation = validateRut(rut);
    if (!rutValidation.valid) {
      setError(rutValidation.message);
      return;
    }

    setLoading(true);
    try {
      // Buscar si el paciente existe (registrado por médico)
      const cleaned = rut.replace(/[^\dkK]/g, "").toUpperCase();
      const { paciente, error: findErr } = await findPatientByRut(cleaned);

      if (findErr) {
        setError("Error al buscar el paciente. Intenta de nuevo.");
        return;
      }

      if (!paciente) {
        setError(
          "RUT no registrado. Verifica si un médico te registró primero."
        );
        return;
      }

      if (paciente.user_id) {
        // Paciente ya tiene cuenta habilitada, intentar login
        const { error: loginErr } = await loginPatient({
          rut: cleaned,
          password,
        });
        if (loginErr) {
          setError("Credenciales incorrectas. Revisa tu contraseña.");
          return;
        }

        const name = paciente.nombre || "Paciente";
        router.push("/Main");
      } else {
        // Paciente registrado pero sin cuenta habilitada (sin user_id)
        setError(
          "Tu RUT está registrado pero aún no tienes cuenta. Presiona el botón inferior para activar tu cuenta."
        );
        return;
      }
    } catch (e) {
      setError("Error al iniciar sesión. Intenta de nuevo.");
      console.error("Error en handleLogin:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BIENVENIDO</Text>
      <Text style={styles.subtitle}>Pacientes</Text>
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
            source={require("../assets/MAPI-emociones/Burbujas/Burbuja1.png")}
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
              height: 100,
              width: 190,
              top: -105,
              left: 175,
              textAlign: "center",
              color: "white",
              fontSize: 12,
              fontWeight: "800",
            }}
          >
            !Porfavor ingresa tu rut para empezar¡
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu Rut"
            value={rut}
            onChangeText={handleRutChange}
            onFocus={() => setFocusedInput("rut")}
            onBlur={() => setFocusedInput(null)}
            maxLength={12}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/doctorLogin2")}>
          <Text style={styles.downText}>
            Si formas parte del personal médico inicia sesión aquí
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 25 }}
          onPress={() => router.push("/patientRegister")}
        >
          <Text style={styles.downText}>
            ¿Ya te registraron? Valida tu rut aquí
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontWeight: "bold", color: "#7e7e7eff" }}>M.A.P.I</Text>
        <Text style={{ fontWeight: "bold", color: "#7e7e7eff" }}>Software</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    color: "#4EA4FB",
    textAlign: "center",
    marginTop: 80,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 20,
    color: "#4EA4FB",
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
    marginTop: "auto",
  },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#e6e6e6ff",
    fontSize: 16,
    textAlign: "center",
    color: "#616161ff",
  },
  button: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    textAlign: "center",
  },
  downText: {
    marginTop: 12,
    color: "#228adfff",
    fontSize: 12,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RoleSelection;
