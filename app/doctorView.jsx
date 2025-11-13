import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { getSession, logout, getDoctorByUserId, insertPatientByDoctor } from '../services/supabase';

// Pantalla principal para médicos después de iniciar sesión
// Permite ver información del médico y registrar nuevos pacientes
export default function DoctorView() {
  const router = useRouter();
  // Estados para mostrar datos del médico y manejar el registro de pacientes
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);

  // Estados para el formulario de registro de paciente
  const [patientName, setPatientName] = useState('');
  const [patientRut, setPatientRut] = useState('');
  const [patientDiabetesType, setPatientDiabetesType] = useState('1');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Efecto para cargar datos del médico al montar el componente
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      // Obtener sesión actual del usuario autenticado
      const { session, error: sessErr } = await getSession();
      if (sessErr) {
        if (mounted) router.replace('doctorLogin');
        return;
      }
      if (!session) {
        if (mounted) router.replace('doctorLogin');
        return;
      }

      // Obtener ID del usuario de la sesión
      const userId = session.user?.id;
      if (!userId) {
        if (mounted) router.replace('doctorLogin');
        return;
      }

      // Obtener perfil completo del médico desde la base de datos
      const { profile, error: profErr } = await getDoctorByUserId(userId);
      if (profErr) {
        setName(session.user?.email ?? '');
      } else {
        setProfile(profile ?? null);
        setName(profile?.nombre ?? session.user?.email ?? '');
      }

      if (mounted) setLoading(false);
    })();

    return () => { mounted = false; };
  }, [router]);

  // Función para cerrar sesión del médico
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    router.replace('doctorLogin');
  };

  // Función para limpiar el RUT (eliminar puntos, guiones y espacios)
  function cleanRut(value) {
    if (!value) return '';
    return value.replace(/\.|\-|\s/g, '').toUpperCase();
  }

  // Función para validar RUT chileno usando el algoritmo del dígito verificador
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

  // Función para registrar un nuevo paciente asociado a este médico
  const handleAddPatient = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanedRut = cleanRut(patientRut);
    
    // Validar que nombre y RUT no estén vacíos
    if (!patientName || !cleanedRut) {
      setErrorMsg('Por favor completa nombre y RUT del paciente.');
      return;
    }
    
    // Validar que el RUT sea válido
    if (!validateRut(cleanedRut)) {
      setErrorMsg('RUT inválido.');
      return;
    }
    
    setLoading(true);
    try {
      // Obtener ID del usuario del médico para asociar el paciente
      const doctorUserId = profile?.user_id ?? null;
      // Insertar nuevo paciente en la base de datos
      const { paciente, error } = await insertPatientByDoctor({ 
        nombre: patientName, 
        rut: cleanedRut, 
        doctor_user_id: doctorUserId, 
        diabetes_type: patientDiabetesType ? parseInt(patientDiabetesType, 10) : null 
      });
      if (error) {
        setErrorMsg(error.message || String(error));
      } else {
        setSuccessMsg('Paciente agregado correctamente.');
        // Limpiar formulario después de agregar paciente
        setPatientName('');
        setPatientRut('');
        setPatientDiabetesType('1');
      }
    } catch (e) {
      setErrorMsg(e.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar pantalla de carga mientras se obtienen los datos
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado con bienvenida al médico */}
      <Text style={styles.text}>Bienvenido {name}</Text>
      <View style={styles.divider} />
      
      {/* Sección para registrar un nuevo paciente */}
      <Text style={styles.sectionTitle}>Registrar paciente</Text>
      
      {/* Input para nombre del paciente */}
      <TextInput
        style={styles.input}
        placeholder="Nombre paciente"
        value={patientName}
        onChangeText={setPatientName}
      />
      
      {/* Input para RUT del paciente */}
      <TextInput
        style={styles.input}
        placeholder="RUT paciente (ej: 12.345.678-9)"
        value={patientRut}
        onChangeText={setPatientRut}
      />
      
      {/* Botones para seleccionar tipo de diabetes */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <TouchableOpacity 
          onPress={() => setPatientDiabetesType('1')} 
          style={[styles.typeBtn, patientDiabetesType === '1' && styles.typeBtnActive]}
        >
          <Text>Diabetes 1</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setPatientDiabetesType('2')} 
          style={[styles.typeBtn, patientDiabetesType === '2' && styles.typeBtnActive]}
        >
          <Text>Diabetes 2</Text>
        </TouchableOpacity>
      </View>
      
      {/* Mostrar mensajes de error y éxito */}
      {errorMsg ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null}
      {successMsg ? <Text style={{ color: 'green' }}>{successMsg}</Text> : null}
      
      {/* Botón para agregar paciente */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddPatient} disabled={loading}>
        <Text style={styles.addButtonText}>{loading ? 'Guardando...' : 'Agregar paciente'}</Text>
      </TouchableOpacity>
      
      {/* Botón para ir a certificados del médico */}
      <TouchableOpacity style={styles.certButton} onPress={() => router.push('/doctorCertificates')}>
        <Text style={styles.certButtonText}>Ver certificados</Text>
      </TouchableOpacity>
      
      {/* Botón para cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#e53935',
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '80%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  typeBtn: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginRight: 8 },
  typeBtnActive: { backgroundColor: '#cfe8ff' },
  certButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginTop: 8,
  },
  certButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
