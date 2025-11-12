import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { findPatientByRut, createPatientAccount } from '../services/supabase';

export default function PatientEntry() {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState(null);
  const [error, setError] = useState('');

  const [age, setAge] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [diabetesType, setDiabetesType] = useState('');

  function cleanRut(value) {
    if (!value) return '';
    return value.replace(/\.|\-|\s/g, '').toUpperCase();
  }

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

  const handleCheckRut = async () => {
    setError('');
    setFoundPatient(null);
    const cleaned = cleanRut(rut);
    if (!validateRut(cleaned)) {
      setError('RUT inválido');
      return;
    }
    setLoading(true);
    const { paciente, error } = await findPatientByRut(cleaned);
    setLoading(false);
    if (error) {
      setError(error.message || String(error));
      return;
    }
    if (!paciente) {
      setError('RUT no registrado por ningún médico');
      return;
    }
    setFoundPatient(paciente);
    // Do not prefill the patient's email from the doctor's entry — patient must provide their own email.
    setEmailInput('');
    // Keep diabetes type in state only for read-only display (doctor sets it), do not allow patient to change it here.
    setDiabetesType(paciente.diabetes_type ?? '');
  };

  const handleCreateAccount = async () => {
    setError('');
    if (!foundPatient) {
      setError('Primero verifique el RUT');
      return;
    }
    if (!age || !password) {
      setError('Ingrese edad y contraseña');
      return;
    }
    if (!emailInput || emailInput.length < 5) {
      setError('Ingrese correo electrónico válido');
      setLoading(false);
      return;
    }
    setLoading(true);
    const cleaned = cleanRut(rut);
    const emailToUse = emailInput;
    const { user, paciente, error } = await createPatientAccount({ rut: cleaned, age: parseInt(age, 10), password, email: emailToUse });
    setLoading(false);
    if (error) {
      setError(error.message || String(error));
      return;
    }
    // After account created navigate to a simple patient view or main
    router.replace('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acceso Paciente</Text>
      <TextInput
        style={styles.input}
        placeholder="RUT"
        value={rut}
        onChangeText={setRut}
      />
      <TouchableOpacity style={styles.button} onPress={handleCheckRut} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar RUT</Text>}
      </TouchableOpacity>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

      {foundPatient ? (
        <View style={styles.card}>
          <Text>Paciente: {foundPatient.nombre}</Text>
          <Text>RUT: {foundPatient.rut}</Text>
          <TextInput style={styles.input} placeholder="Edad" value={age} onChangeText={setAge} keyboardType="numeric" />
          {/* Patient should enter their own email. Do not allow selecting diabetes type here (doctor sets it). */}
          <TextInput style={styles.input} placeholder="Correo (ej. ejemplo@gmail.com)" value={emailInput} onChangeText={setEmailInput} keyboardType="email-address" autoCapitalize="none" />
          {diabetesType ? <Text>Tipo de diabetes: {diabetesType === '1' ? 'Tipo 1' : diabetesType === '2' ? 'Tipo 2' : diabetesType}</Text> : null}
          <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.button} onPress={handleCreateAccount} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8 },
  button: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { marginTop: 12, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  typeBtn: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6 },
  typeBtnActive: { backgroundColor: '#cfe8ff' },
});
