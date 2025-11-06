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
import { saveMedicoMultipart } from "../services/api";

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

export function Register({ onSwitchToLogin, onRegisterSuccess, onBack }) {
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [rutError, setRutError] = useState("");
  const [phone, setPhone] = useState("+56 9 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const validatePasswords = () => {
    if (password.length === 0 || confirmPassword.length === 0) {
      setPasswordError("Ambos campos de contraseña son requeridos");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  const formatPhoneNumber = (value) => {
    let numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return "+56 9 ";
    if (numbers.startsWith('56')) {
      numbers = numbers.substring(2);
    }
    if (numbers.startsWith('9')) {
      numbers = numbers.substring(1);
    }
    numbers = numbers.substring(0, 8);
    
    if (numbers.length > 0) {
      let formatted = "+56 9";
      if (numbers.length > 0) {
        formatted += " " + numbers.substring(0, 4);
      }
      if (numbers.length > 4) {
        formatted += " " + numbers.substring(4);
      }
      return formatted;
    }
    
    return "+56 9 ";
  };

  const validatePhone = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\s/g, '');
    return /^\+569\d{8}$/.test(cleaned);
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
            setSelectedFile(null);
            setFileError("Solo se permiten archivos PDF");
            return;
          }
          setSelectedFile(file);
          setSelectedFileName(file.name);
          setFileError("");
        };
        input.click();
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setFileError("");
    } catch (err) {
      setFileError("Error al seleccionar el archivo");
      console.error("Error picking document:", err);
    }
  };

  const handleRegister = async () => {
    try {
      console.log('Iniciando proceso de registro...');

      // Validar campos obligatorios
      if (!name || !rut || !phone || !email || !password || !confirmPassword) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
        return;
      }

      // Validar contraseñas
      if (!validatePasswords()) {
        return; // validatePasswords ya muestra el error
      }

      // Validar email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Alert.alert('Error', 'Email inválido');
        return;
      }

      // Validar teléfono
      if (!validatePhone(phone)) {
        Alert.alert('Error', 'Número de teléfono inválido');
        return;
      }

      // Validar archivo
      if (!selectedFile) {
        Alert.alert('Error', 'Debes subir un documento PDF');
        return;
      }

      // Validar RUT
      const formattedRut = formatRut(rut);
      if (formattedRut.length < 11) {
        setRutError("RUT inválido");
        Alert.alert("Error", "RUT inválido");
        return;
      }

      setIsRegistering(true);

      // Preparar el archivo según la plataforma
      const fileToUpload = Platform.OS === 'web' ? selectedFile : {
        uri: selectedFile.uri,
        name: selectedFile.name || 'document.pdf',
        type: selectedFile.mimeType || 'application/pdf'
      };

      console.log('Enviando registro con:', {
        nombre: name,
        run: formattedRut,
        telefono: phone,
        email,
        tieneArchivo: !!fileToUpload,
        plataforma: Platform.OS
      });

      const res = await saveMedicoMultipart({
        nombre: name,
        run: formattedRut,
        telefono: phone,
        email,
        password,
        file: fileToUpload
      });

      if (!res || !res._id) {
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('Registro exitoso:', res);

      if (onRegisterSuccess) {
        onRegisterSuccess({
          id: res._id,
          name: res.nombre,
          rut: res.run,
          phone: res.telefono,
          email: res.email,
          role: 'medico'
        });
      }

      Alert.alert(
        'Éxito',
        'Registro completado correctamente',
        [{ text: 'OK', onPress: () => onSwitchToLogin?.() }]
      );

    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert(
        'Error',
        error.message.includes('Network request failed')
          ? 'Error de conexión. Verifica tu red y el servidor.'
          : 'No se pudo completar el registro. Intenta nuevamente.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backRow}>
        <Text style={styles.backText}>Volver</Text>
      </Pressable>
      
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

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => setPhone(formatPhoneNumber(text))}
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