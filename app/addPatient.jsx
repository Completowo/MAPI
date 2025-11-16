import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Platform, useWindowDimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { getSession, getDoctorByUserId, insertPatientByDoctor, uploadPatientDocument, getPatientDocumentUrl } from '../services/supabase';
import * as DocumentPicker from 'expo-document-picker';

export default function AddPatient() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  
  //Estados del formulario
  const [patientName, setPatientName] = useState('');
  const [patientRut, setPatientRut] = useState('');
  const [patientDiabetesType, setPatientDiabetesType] = useState('1');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rutStatus, setRutStatus] = useState(null); // null, 'valid', 'invalid'
  const [patientDocuments, setPatientDocuments] = useState([]); // Documentos subidos del paciente
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docStatus, setDocStatus] = useState('');

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

  // Seleccionar y subir documento del paciente
  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setDocStatus('Selección cancelada');
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        setDocStatus('No se seleccionó ningún archivo');
        return;
      }

      const file = result.assets[0];
      const filename = file.name || `documento_${Date.now()}.pdf`;

      if (!filename.toLowerCase().endsWith('.pdf')) {
        setDocStatus('Error: Solo se permiten archivos PDF');
        return;
      }

      setDocStatus(`Cargando archivo: ${filename}...`);
      setUploadingDoc(true);

      const { publicUrl, error } = await uploadPatientDocument({
        fileUri: file.uri,
        filename: filename,
        patientId: profile?.id || null,
        patientName: patientName,
      });

      if (error) {
        console.error('Upload error:', error);
        setDocStatus(`Error: ${String(error.message || error)}`);
      } else {
        setDocStatus('Documento subido correctamente');
        // Agregar documento a la lista
        setPatientDocuments([...patientDocuments, { name: filename, url: publicUrl }]);
        setTimeout(() => {
          setDocStatus('');
        }, 2000);
      }
    } catch (e) {
      console.error('Error al seleccionar documento:', e);
      setDocStatus(`Error: ${e.message}`);
    } finally {
      setUploadingDoc(false);
    }
  };

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

    // Validar que el RUT del paciente no sea igual al RUT del doctor
    const doctorRutCleaned = cleanRut(profile?.rut || '');
    if (cleanedRut === doctorRutCleaned) {
      setErrorMsg('No puedes registrar a un paciente con tu propio RUT.');
      return;
    }

    setLoading(true);
    try {
      const doctorUserId = profile?.user_id ?? null;
      console.log('[addPatient] Profile:', profile);
      console.log('[addPatient] Doctor User ID:', doctorUserId);
      
      const { paciente, error } = await insertPatientByDoctor({
        nombre: patientName,
        rut: cleanedRut,
        doctor_user_id: doctorUserId,
        diabetes_type: patientDiabetesType ? parseInt(patientDiabetesType, 10) : null,
      });

      console.log('[addPatient] Paciente creado:', paciente);
      console.log('[addPatient] Error:', error);

      if (error) {
        setErrorMsg('Error al agregar paciente. Intenta de nuevo.');
      } else {
        setSuccessMsg('Paciente agregado correctamente');
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
          <Text style={styles.title}>Agregar Nuevo Paciente</Text>
          <Text style={styles.subtitle}>Completa los datos del paciente</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Nombre del paciente */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={[styles.input, focusedInput === 'nombre' && styles.inputFocused]}
              placeholder="Ej: Juan Pérez García"
              value={patientName}
              onChangeText={setPatientName}
              onFocus={() => setFocusedInput('nombre')}
              onBlur={() => setFocusedInput(null)}
              placeholderTextColor="#ccc"
            />
          </View>

          {/* RUT del paciente */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>RUT *</Text>
            <TextInput
              style={[styles.input, focusedInput === 'rut' && styles.inputFocused]}
              placeholder="Ej: 12.345.678-9"
              value={patientRut}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9kK\.\-\s]/g, '');
                const cleaned = cleanRut(filtered);
                if (/^\d{7,8}[0-9Kk]$/.test(cleaned)) {
                  setPatientRut(formatRut(cleaned));
                  
                  // Verificar si el RUT es válido
                  if (validateRut(cleaned)) {
                    setRutStatus('valid');
                  } else {
                    setRutStatus('invalid');
                  }
                } else {
                  setPatientRut(filtered);
                  setRutStatus(null);
                }
              }}
              onFocus={() => setFocusedInput('rut')}
              onBlur={() => setFocusedInput(null)}
              keyboardType="default"
              placeholderTextColor="#ccc"
            />
            {/* Mostrar estado del RUT */}
            {patientRut ? (
              validateRut(cleanRut(patientRut)) ? (
                <Text style={[styles.helperText, { color: '#2e7d32' }]}>✔ RUT válido</Text>
              ) : (
                <Text style={[styles.helperText, { color: '#d32f2f' }]}>✖ RUT inválido</Text>
              )
            ) : null}
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

          {/* Sección de documentos del paciente */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Documentos del Paciente</Text>
            <TouchableOpacity
              style={[styles.uploadDocButton, uploadingDoc && styles.uploadDocButtonDisabled]}
              onPress={handleSelectDocument}
              disabled={uploadingDoc}
            >
              <Text style={styles.uploadDocButtonText}>
                {uploadingDoc ? 'Cargando...' : 'Seleccionar Documento'}
              </Text>
            </TouchableOpacity>
            
            {docStatus ? (
              <View style={[styles.docStatusBox, docStatus.includes('Error') && styles.docStatusError]}>
                <Text style={[styles.docStatusText, docStatus.includes('Error') && styles.docStatusErrorText]}>
                  {docStatus}
                </Text>
              </View>
            ) : null}

            {patientDocuments.length > 0 && (
              <View style={styles.documentsListContainer}>
                <Text style={styles.documentsListTitle}>Documentos Cargados:</Text>
                {patientDocuments.map((doc, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.documentItem}
                    onPress={() => {
                      if (doc.url) {
                        Linking.openURL(doc.url);
                      }
                    }}
                  >
                    <Text style={styles.documentName}>📄 {doc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
    paddingBottom: 120, // Espacio para el navbar y botones del sistema
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
  inputFocused: {
    borderWidth: 2,
    borderColor: '#00897B',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
    borderColor: '#00897B',
    backgroundColor: '#e0f2f1',
  },
  diabetesBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  diabetesBtnTextActive: {
    color: '#00897B',
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
    backgroundColor: '#00897B',
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
  uploadDocButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadDocButtonDisabled: {
    opacity: 0.6,
  },
  uploadDocButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  docStatusBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  docStatusError: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#e53935',
  },
  docStatusText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
  },
  docStatusErrorText: {
    color: '#c62828',
  },
  documentsListContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  documentsListTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  documentItem: {
    backgroundColor: '#e0f2f1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#00897B',
  },
  documentName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 50,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  navItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minWidth: 80,
  },
  navItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
});
