import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getSession, getDoctorByUserId, insertPatientByDoctor } from '../services/supabase';

export default function AddPatient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Estados del formulario
  const [patientName, setPatientName] = useState('');
  const [patientRut, setPatientRut] = useState('');
  const [patientDiabetesType, setPatientDiabetesType] = useState('1');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Verificar que el usuario está autenticado
  useEffect(() => {
    let mounted = true;
    (async () => {
      setChecking(true);
      const { session, error: sessErr } = await getSession();
      if (sessErr || !session) {
        if (mounted) router.replace('doctorLogin');
        return;
      }

      const userId = session.user?.id;
      if (!userId) {
        if (mounted) router.replace('doctorLogin');
        return;
      }

      const { profile, error: profErr } = await getDoctorByUserId(userId);
      if (profErr || !profile) {
        if (mounted) router.replace('doctorLogin');
        return;
      }

      if (mounted) {
        setProfile(profile);
        setChecking(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Función para limpiar RUT
  function cleanRut(value) {
    if (!value) return '';
    return value.replace(/\.|\-|\s/g, '').toUpperCase();
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

  // Manejar agregar paciente
  const handleAddPatient = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanedRut = cleanRut(patientRut);

    if (!patientName || !cleanedRut) {
      setErrorMsg('Por favor completa nombre y RUT del paciente.');
      return;
    }

    if (!validateRut(cleanedRut)) {
      setErrorMsg('RUT inválido. Verifica el formato.');
      return;
    }

    setLoading(true);
    try {
      const doctorUserId = profile?.user_id ?? null;
      const { paciente, error } = await insertPatientByDoctor({
        nombre: patientName,
        rut: cleanedRut,
        doctor_user_id: doctorUserId,
        diabetes_type: patientDiabetesType ? parseInt(patientDiabetesType, 10) : null,
      });

      if (error) {
        setErrorMsg(error.message || String(error));
      } else {
        setSuccessMsg('✓ Paciente agregado correctamente');
        setTimeout(() => {
          setPatientName('');
          setPatientRut('');
          setPatientDiabetesType('1');
          setErrorMsg('');
          setSuccessMsg('');
          router.push('/doctorView');
        }, 1500);
      }
    } catch (e) {
      setErrorMsg(e.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Agregar Nuevo Paciente</Text>
          <Text style={styles.subtitle}>Completa los datos del paciente</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Nombre del paciente */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez García"
              value={patientName}
              onChangeText={setPatientName}
              placeholderTextColor="#ccc"
            />
          </View>

          {/* RUT del paciente */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>RUT *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 12.345.678-9"
              value={patientRut}
              onChangeText={setPatientRut}
              keyboardType="default"
              placeholderTextColor="#ccc"
            />
          </View>

          {/* Tipo de diabetes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tipo de Diabetes</Text>
            <View style={styles.diabetesOptions}>
              <TouchableOpacity
                onPress={() => setPatientDiabetesType('1')}
                style={[styles.diabetesBtn, patientDiabetesType === '1' && styles.diabetesBtnActive]}
              >
                <Text style={[styles.diabetesBtnText, patientDiabetesType === '1' && styles.diabetesBtnTextActive]}>
                  Tipo 1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPatientDiabetesType('2')}
                style={[styles.diabetesBtn, patientDiabetesType === '2' && styles.diabetesBtnActive]}
              >
                <Text style={[styles.diabetesBtnText, patientDiabetesType === '2' && styles.diabetesBtnTextActive]}>
                  Tipo 2
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mensajes */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}
          
          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {/* Botón enviar */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleAddPatient}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Guardando...' : 'Agregar Paciente'}
            </Text>
          </TouchableOpacity>

          {/* Botón cancelar */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Navbar inferior */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/doctorView')}
        >
          <Text style={styles.navItemText}>📊 Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {}}
        >
          <Text style={styles.navItemText}>➕ Agregar Paciente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('doctorCertificates')}
        >
          <Text style={styles.navItemText}>👤 Tu Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 80, // Espacio para el navbar
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  diabetesOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  diabetesBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  diabetesBtnActive: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  diabetesBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  diabetesBtnTextActive: {
    color: '#2196F3',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e53935',
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
  // Estilos del navbar
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  navItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
});
