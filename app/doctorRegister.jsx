import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function DoctorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        <Text style={styles.title}>Registro Médico</Text>
        <Text style={styles.subtitle}>Complete sus datos para registrarse</Text>

        <View style={styles.form}>
          {/* Nombre completo */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez González"
              value={formData.nombre}
              onChangeText={(text) => setFormData({...formData, nombre: text})}
              autoCapitalize="words"
            />
          </View>

          {/* RUT */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>RUT</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 12.345.678-9"
              value={formData.rut}
              onChangeText={(text) => setFormData({...formData, rut: text})}
              keyboardType="numeric"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Botón para subir archivos */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Documentos Médicos</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>📎 Subir documentos</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Sube tu título médico y documentos que acrediten tu profesión
            </Text>
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry
            />
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme su contraseña"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry
            />
          </View>

          {/* Botón de registro */}
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>

          {/* Link para volver al login */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.push('doctorLogin')}
          >
            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: '800',
    color: '#2196F3',
    marginBottom: Platform.OS === 'web' ? 8 : 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#666',
    marginBottom: Platform.OS === 'web' ? 32 : 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 480,
    gap: Platform.OS === 'web' ? 16 : 12,
    alignSelf: 'center',
  },
  inputContainer: {
    gap: Platform.OS === 'web' ? 8 : 6,
    marginBottom: Platform.OS === 'web' ? 0 : 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  uploadButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2196F3',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
  uploadButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  registerButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    padding: 16,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#2196F3',
    fontSize: 14,
  },
});
