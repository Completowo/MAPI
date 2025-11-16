import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';

export default function PatientLogin() {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  // Función para limpiar el RUT
  function cleanRut(value) {
    if (!value) return '';
    return value.replace(/\.|\-|\s/g, '').toUpperCase();
  }

  // Función para formatear el RUT
  function formatRut(value) {
    const cleaned = cleanRut(value);
    if (cleaned.length === 0) return '';
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    if (!body) return cleaned;
    const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withDots}-${dv}`;
  }

  // Función para validar RUT
  function validateRut(value) {
    const cleaned = cleanRut(value);
    if (!cleaned || cleaned.length < 2) return false;
    const body = cleaned.slice(0, -1);
    let dv = cleaned.slice(-1);
    dv = dv === 'K' ? 'K' : dv;
    if (!/^\d{7,8}$/.test(body)) return false;
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const remainder = sum % 11;
    const expected = 11 - remainder;
    let expectedDv = '';
    if (expected === 11) expectedDv = '0';
    else if (expected === 10) expectedDv = 'K';
    else expectedDv = String(expected);
    return expectedDv === dv;
  }

  // Función para iniciar sesión
  const handleLogin = async () => {
    setError('');
    const cleaned = cleanRut(rut);

    // Validar campos
    if (!cleaned || !password) {
      setError('Completa RUT y contraseña');
      return;
    }

    // Validar RUT
    if (!validateRut(cleaned)) {
      setError('RUT inválido');
      return;
    }

    setLoading(true);

    try {
      // Buscar paciente por RUT
      const { data: pacienteData, error: pacienteErr } = await supabase
        .from('pacientes')
        .select('*')
        .eq('rut', cleaned)
        .single();

      if (pacienteErr || !pacienteData) {
        setError('RUT no encontrado. Regístrate primero');
        setLoading(false);
        return;
      }

      // Si no tiene user_id, aún no ha creado cuenta
      if (!pacienteData.user_id) {
        setError('Cuenta no activada. Completa tu registro');
        setLoading(false);
        return;
      }

      // Obtener email del paciente para intentar login
      const email = pacienteData.email;
      if (!email) {
        setError('Error: No se encontró email del paciente');
        setLoading(false);
        return;
      }

      // Intentar iniciar sesión con el email y contraseña
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Login exitoso - navegar a Main
        setLoading(false);
        router.replace('Main');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Intenta de nuevo');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Acceso Paciente</Text>
        <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, focusedInput === 'rut' && styles.inputFocused]}
            placeholder="RUT"
            value={rut}
            onChangeText={(text) => {
              const filtered = text.replace(/[^0-9kK\.‑\s]/g, '');
              const cleaned = cleanRut(filtered);
              if (/^\d{7,8}[0-9Kk]$/.test(cleaned)) {
                setRut(formatRut(cleaned));
              } else {
                setRut(filtered);
              }
            }}
            onFocus={() => setFocusedInput('rut')}
            onBlur={() => setFocusedInput(null)}
            editable={!loading}
            placeholderTextColor="#ccc"
            keyboardType="default"
          />

          <TextInput
            style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry
            editable={!loading}
            placeholderTextColor="#ccc"
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity onPress={() => router.push('patientRegister')}>
            <Text style={styles.registerButtonText}>¿Aún no tienes cuenta? ¡Activa tu cuenta aquí!</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => router.push('RoleSelection')}
          >
            <Text style={styles.backButtonText}>Volver</Text>
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
  inputFocused: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loginButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e53935',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
  registerButtonText: {
    color: '#2196F3',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  backButtonContainer: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
});
