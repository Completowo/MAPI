import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';

export default function PatientRegister() {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState(null);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const [age, setAge] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [diabetesType, setDiabetesType] = useState('');

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

  // Función para verificar si el RUT fue registrado por algún médico
  const handleCheckRut = async () => {
    setError('');
    setFoundPatient(null);
    const cleaned = cleanRut(rut);

    if (!cleaned || !validateRut(cleaned)) {
      setError('RUT inválido');
      return;
    }

    setLoading(true);

    try {
      const { data: pacienteData, error: pacienteErr } = await supabase
        .from('pacientes')
        .select('*')
        .eq('rut', cleaned)
        .single();

      if (pacienteErr || !pacienteData) {
        setError('RUT no registrado por ningún médico');
        setLoading(false);
        return;
      }

      // Si ya tiene user_id, significa que ya creó cuenta
      if (pacienteData.user_id) {
        setError('Este RUT ya tiene cuenta. Inicia sesión');
        setLoading(false);
        return;
      }

      setFoundPatient(pacienteData);
      setEmailInput('');
      setDiabetesType(pacienteData.diabetes_type ?? '');
      setLoading(false);
    } catch (err) {
      console.error('Error al verificar RUT:', err);
      setError('Error al verificar RUT. Intenta de nuevo');
      setLoading(false);
    }
  };

  // Función para crear la cuenta del paciente
  const handleCreateAccount = async () => {
    setError('');

    if (!foundPatient) {
      setError('Primero verifica el RUT');
      return;
    }

    if (!age || !password || !emailInput) {
      setError('Completa edad, email y contraseña');
      return;
    }

    if (emailInput.length < 5) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    const cleaned = cleanRut(rut);

    try {
      // Verificar que el paciente existe en la tabla y no tiene user_id
      const { data: verifyPatient, error: verifyErr } = await supabase
        .from('pacientes')
        .select('*')
        .eq('rut', cleaned)
        .single();

      console.log('[patientRegister] Verificar paciente - verifyErr:', verifyErr);
      console.log('[patientRegister] Verificar paciente - data:', verifyPatient);

      if (verifyErr || !verifyPatient) {
        setError('RUT no registrado por ningún médico');
        setLoading(false);
        return;
      }

      if (verifyPatient.user_id) {
        setError('Este RUT ya tiene una cuenta registrada');
        setLoading(false);
        return;
      }

      // Crear usuario en Auth
      console.log('[patientRegister] Creando usuario en Auth con email:', emailInput);
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: emailInput,
        password,
      });

      if (authErr) {
        console.error('[patientRegister] Auth error:', authErr);
        setError(authErr.message || 'Error al crear usuario');
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Error al crear usuario. Intenta de nuevo');
        setLoading(false);
        return;
      }

      console.log('[patientRegister] Usuario Auth creado:', authData.user.id);

      // Actualizar paciente con user_id, edad y email
      console.log('[patientRegister] Actualizando paciente ID:', verifyPatient.id);
      console.log('[patientRegister] Actualizando paciente con:', {
        user_id: authData.user.id,
        edad: parseInt(age, 10),
        email: emailInput,
        doctor_user_id: verifyPatient.doctor_user_id,
      });

      const { error: updateErr, data: updateData } = await supabase
        .from('pacientes')
        .update({
          user_id: authData.user.id,
          age: parseInt(age, 10),
          email: emailInput,
          doctor_user_id: verifyPatient.doctor_user_id,
        })
        .eq('id', verifyPatient.id);

      console.log('[patientRegister] Update response - data:', updateData);
      console.log('[patientRegister] Update response - error:', updateErr);

      if (updateErr) {
        console.error('[patientRegister] Error al actualizar:', updateErr.message || updateErr);
        console.error('[patientRegister] Error code:', updateErr.code);
        console.error('[patientRegister] Error details:', JSON.stringify(updateErr, null, 2));
        setError(`Error: ${updateErr.message || 'Error al guardar datos'}`);
        setLoading(false);
        return;
      }

      console.log('[patientRegister] Paciente actualizado exitosamente');
      setLoading(false);
      // Redirigir a Main
      router.replace('Main');
    } catch (err) {
      console.error('Error al crear cuenta:', err);
      setError('Error al crear cuenta. Intenta de nuevo');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>Activar Cuenta</Text>
        <Text style={styles.subtitle}>Paciente</Text>

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
            editable={!loading && !foundPatient}
            placeholderTextColor="#ccc"
          />

          <TouchableOpacity
            style={[styles.verifyButton, (loading || foundPatient) && styles.verifyButtonDisabled]}
            onPress={handleCheckRut}
            disabled={loading || !!foundPatient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : foundPatient ? (
              <Text style={styles.verifyButtonText}>RUT Verificado ✓</Text>
            ) : (
              <Text style={styles.verifyButtonText}>Verificar RUT</Text>
            )}
          </TouchableOpacity>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Si el RUT fue encontrado, mostrar formulario para crear cuenta */}
          {foundPatient ? (
            <>
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Paciente registrado:</Text>
                <Text style={styles.infoValue}>{foundPatient.nombre}</Text>
                {foundPatient.diabetes_type && (
                  <>
                    <Text style={styles.infoLabel}>Tipo de Diabetes:</Text>
                    <Text style={styles.infoValue}>
                      {foundPatient.diabetes_type === '1'
                        ? 'Tipo 1'
                        : foundPatient.diabetes_type === '2'
                        ? 'Tipo 2'
                        : foundPatient.diabetes_type}
                    </Text>
                  </>
                )}
              </View>

              <TextInput
                style={[styles.input, focusedInput === 'age' && styles.inputFocused]}
                placeholder="Edad"
                value={age}
                onChangeText={setAge}
                onFocus={() => setFocusedInput('age')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                editable={!loading}
                placeholderTextColor="#ccc"
              />

              <TextInput
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                placeholder="Email"
                value={emailInput}
                onChangeText={setEmailInput}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                placeholderTextColor="#ccc"
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
                style={[styles.createButton, loading && styles.createButtonDisabled]}
                onPress={handleCreateAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Crear Cuenta</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity onPress={() => router.push('patientLogin')}>
            <Text style={styles.registerButtonText}>¿Ya estás registrado? ¡Inicia sesión aquí!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
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
  verifyButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
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
  infoSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  registerButtonText: {
    color: '#2196F3',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    fontWeight: '600',
  },
});
