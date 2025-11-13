import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loginDoctor } from '../services/supabase';

// Pantalla de inicio de sesión para médicos
// Permite que un médico registrado inicie sesión con email y contraseña
export default function DoctorLogin() {
  const router = useRouter();
  // Estados para almacenar email, contraseña y estado de carga
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para manejar el inicio de sesión
  const handleLogin = () => {
    setError('');
    setLoading(true);
    (async () => {
      try {
        // Llamar función de login desde servicio Supabase
        const { error, user, profile } = await loginDoctor({ email, password });
        if (error) {
          setError(error.message || 'Error al iniciar sesión');
        } else {
          // Si login es exitoso, obtener el nombre del médico y navegar a doctorView
          const name = (profile && profile.nombre) ? profile.nombre : (user?.email || '');
          router.push(`doctorView?name=${encodeURIComponent(name)}`);
        }
      } catch (e) {
        setError(e.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Título y subtítulo de bienvenida */}
        <Text style={styles.title}>Acceso Médico</Text>
        <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

        <View style={styles.form}>
          {/* Campo de entrada para email */}
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Campo de entrada para contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Botón para iniciar sesión */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Mostrar mensaje de error si existe */}
          {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}

          {/* Botón para navegar a registro de médico */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('doctorRegister')}
          >
            <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 360,
    gap: 16,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
});
