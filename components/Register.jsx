import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';

// Función para formatear RUT
const formatRut = (rutValue) => {
  // Eliminar todos los caracteres no numéricos ni K/k
  let cleaned = rutValue.replace(/[^0-9kK]/g, "").toUpperCase();
  
  // Si está vacío, retornar vacío
  if (!cleaned) return "";
  
  // Separar dígito verificador
  let dv = cleaned.slice(-1);
  let numbers = cleaned.slice(0, -1);
  
  // Asegurar que solo tenemos números en la parte principal
  numbers = numbers.replace(/[^0-9]/g, "");
  
  // Rellenar con ceros a la izquierda si es necesario
  while (numbers.length < 8) {
    numbers = "0" + numbers;
  }
  
  // Tomar solo los últimos 8 dígitos si es más largo
  numbers = numbers.slice(-8);
  
  // Formatear con puntos
  let formatted = "";
  for (let i = numbers.length - 1; i >= 0; i--) {
    formatted = numbers[i] + formatted;
    if (i > 0 && (numbers.length - i) % 3 === 0) {
      formatted = "." + formatted;
    }
  }
  
  // Agregar guión y dígito verificador
  return formatted + "-" + dv;
};

export function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [rutError, setRutError] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const inputRef = useRef(null);

  const validatePasswords = () => {
    if (password.length === 0 || confirmPassword.length === 0) {
      setPasswordError("");
      return true;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handlePickFile = async () => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/pdf, .pdf";
        input.onchange = (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          if (!file.name.toLowerCase().endsWith(".pdf")) {
            setSelectedFileName("");
            setFileError("Solo se permiten archivos PDF");
            return;
          }
          setSelectedFileName(file.name);
          setFileError("");
        };
        input.click();
        return;
      }

      // Selección nativa usando expo-document-picker
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // En iOS/Android, result.assets[0] contiene la info del archivo
      const file = result.assets[0];
      setSelectedFileName(file.name);
      setFileError("");
    } catch (err) {
      setFileError("Error al seleccionar el archivo");
      console.error("Error picking document:", err);
    }
  };

  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    const pwOk = validatePasswords();
    if (!pwOk) return;

    // Validación mínima de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email inválido", "Por favor ingresa un correo válido.");
      return;
    }

    if (!name || !rut || !phone) {
      Alert.alert("Datos incompletos", "Por favor completa todos los campos.");
      return;
    }

    // Validar formato de RUT antes de enviar
    const formattedRut = formatRut(rut);
    if (formattedRut.length < 11) {
      setRutError("RUT inválido");
      Alert.alert("RUT inválido", "Por favor ingresa un RUT válido.");
      return;
    }
    setRut(formattedRut); // Asegurar formato final

    setIsRegistering(true);

    try {
      // Pasar datos al callback de éxito (sin incluir contraseña)
      if (onRegisterSuccess) {
        await onRegisterSuccess({
          name,
          rut,
          phone,
          email,
          pdfFileName: selectedFileName,
          // No enviar la contraseña al estado, solo usarla para auth
        });
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo completar el registro");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />

      <TextInput
        style={[styles.input, rutError ? styles.inputError : null]}
        placeholder="RUT (ej: 12.345.678-9)"
        value={rut}
        onChangeText={(text) => {
          // Permitir escribir sin formato
          setRut(text);
          setRutError("");
        }}
        onBlur={() => {
          // Al perder foco, formatear y validar
          if (rut) {
            const formattedRut = formatRut(rut);
            setRut(formattedRut);
            
            // Validación básica: largo mínimo con formato XX.XXX.XXX-X
            if (formattedRut.length < 11) {
              setRutError("RUT inválido");
            }
          }
        }}
        placeholderTextColor="#999"
        maxLength={12}
      />
      {rutError ? <Text style={styles.errorText}>{rutError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Gmail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <View style={styles.uploadRow}>
        <Pressable style={styles.uploadButton} onPress={handlePickFile}>
          <Text style={styles.uploadButtonText}>Subir PDF</Text>
        </Pressable>
        <Text style={styles.fileName}>{selectedFileName || "Ningún archivo"}</Text>
      </View>
      {fileError ? <Text style={styles.errorText}>{fileError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (confirmPassword) validatePasswords();
        }}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(t) => {
          setConfirmPassword(t);
          validatePasswords();
        }}
        placeholderTextColor="#999"
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <Pressable 
        style={[styles.primaryButton, isRegistering && styles.disabledButton]} 
        onPress={handleRegister}
        disabled={isRegistering}>
        <Text style={styles.primaryButtonText}>
          {isRegistering ? "Registrando..." : "Registrarse"}
        </Text>
      </Pressable>

      <View style={styles.rowCenter}>
        <Text style={styles.smallText}>¿Ya tienes cuenta?</Text>
        <Pressable onPress={onSwitchToLogin}>
          <Text style={styles.linkText}> Iniciar sesión</Text>
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
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF9F9",
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    backgroundColor: "#F8FBFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6F3FF",
  },
  uploadButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#83C1FF",
    borderRadius: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 15,
  },
  fileName: {
    color: "#5A7B9B",
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 20,
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
  disabledButton: {
    opacity: 0.7,
    backgroundColor: "#A5D3FF",
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
  errorText: {
    color: "#FF6B6B",
    marginBottom: 12,
    fontSize: 14,
    textAlign: "center",
  },
});

export default Register;
