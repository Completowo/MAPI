import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform, FlatList, useWindowDimensions, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getSession, logout, getDoctorByUserId, getPatientDocuments, uploadPatientDocument, deletePatientDocument, getPatientDocumentUrl } from '../services/supabase';
import { supabase } from '../services/supabase';
import * as DocumentPicker from 'expo-document-picker';

// Pantalla principal para médicos después de iniciar sesión
export default function DoctorView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); // Para vista detallada
  const [patientDocuments, setPatientDocuments] = useState([]); // Documentos del paciente seleccionado
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docStatus, setDocStatus] = useState('');

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

  // Cargar datos del médico y pacientes
  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const { session, error: sessErr } = await getSession();
      if (sessErr || !session) {
        router.replace('doctorLogin');
        return;
      }

      const userId = session.user?.id;
      if (!userId) {
        router.replace('doctorLogin');
        return;
      }

      // Obtener perfil del médico
      const { profile, error: profErr } = await getDoctorByUserId(userId);
      if (profErr) {
        setName(session.user?.email ?? '');
      } else {
        setProfile(profile ?? null);
        setName(profile?.nombre ?? session.user?.email ?? '');
      }

      // Obtener lista de pacientes registrados por este médico
      console.log('[doctorView] Buscando pacientes con doctor_user_id:', userId);
      
      const { data: patientsData, error: patientsErr } = await supabase
        .from('pacientes')
        .select('*')
        .eq('doctor_user_id', userId)
        .order('created_at', { ascending: false });

      console.log('[doctorView] Pacientes encontrados:', patientsData);
      console.log('[doctorView] Error en pacientes:', patientsErr);

      if (!patientsErr && patientsData) {
        setPatients(patientsData);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar y cuando se enfoca la pantalla
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadDoctorData();
    }
    return () => { mounted = false; };
  }, []);

  // Recargar pacientes cuando vuelve a esta pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadDoctorData();
    }, [])
  );

  // Función para cerrar sesión
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    router.replace('doctorLogin');
  };

  // Cargar documentos cuando se selecciona un paciente
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setDocStatus('');
    setPatientDocuments([]);
    
    // Cargar documentos del paciente
    const { documents } = await getPatientDocuments(patient.nombre);
    setPatientDocuments(documents || []);
  };

  // Volver a la lista de pacientes
  const handleBackToList = () => {
    setSelectedPatient(null);
    setPatientDocuments([]);
    setDocStatus('');
  };

  // Seleccionar y subir documento para el paciente seleccionado
  const handleSelectDocument = async () => {
    if (!selectedPatient) return;

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
        patientId: selectedPatient.id,
        patientName: selectedPatient.nombre,
      });

      if (error) {
        console.error('Upload error:', error);
        setDocStatus(`Error: ${String(error.message || error)}`);
      } else {
        setDocStatus('Documento subido correctamente');
        // Recargar lista de documentos
        const { documents } = await getPatientDocuments(selectedPatient.nombre);
        setPatientDocuments(documents || []);
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

  // Eliminar documento del paciente
  const handleDeleteDocument = async (filename) => {
    if (!selectedPatient) return;

    try {
      setDocStatus(`Eliminando ${filename}...`);
      const { success, error } = await deletePatientDocument(selectedPatient.nombre, filename);

      if (error) {
        console.error('Delete error:', error);
        setDocStatus(`Error: ${String(error.message || error)}`);
      } else {
        setDocStatus('Documento eliminado correctamente');
        // Recargar lista de documentos
        const { documents } = await getPatientDocuments(selectedPatient.nombre);
        setPatientDocuments(documents || []);
        setTimeout(() => {
          setDocStatus('');
        }, 2000);
      }
    } catch (e) {
      console.error('Error al eliminar documento:', e);
      setDocStatus(`Error: ${e.message}`);
    }
  };

  // Abrir/Descargar documento
  const handleOpenDocument = async (filename) => {
    if (!selectedPatient) return;

    try {
      const { publicUrl, error } = await getPatientDocumentUrl(selectedPatient.nombre, filename);
      
      if (error || !publicUrl) {
        setDocStatus('Error al obtener el link del documento');
        return;
      }

      // Abrir el documento en el navegador
      Linking.openURL(publicUrl);
    } catch (e) {
      console.error('Error al abrir documento:', e);
      setDocStatus(`Error: ${e.message}`);
    }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  // Pantalla de detalles del paciente
  const renderPatientDetails = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToList} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Documentos del Paciente</Text>
      </View>

      <View style={styles.patientDetailCard}>
        <Text style={styles.cardTitle}>{selectedPatient?.nombre}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>RUT:</Text>
          <Text style={styles.detailValue}>{formatRut(selectedPatient?.rut)}</Text>
        </View>
        {selectedPatient?.diabetes_type && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diabetes:</Text>
            <Text style={styles.detailValue}>Tipo {selectedPatient.diabetes_type}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.uploadDocButton, uploadingDoc && styles.uploadDocButtonDisabled]}
        onPress={handleSelectDocument}
        disabled={uploadingDoc}
      >
        <Text style={styles.uploadDocButtonText}>
          {uploadingDoc ? 'Cargando...' : 'Seleccionar y cargar Documento'}
        </Text>
      </TouchableOpacity>

      {docStatus ? (
        <View style={[styles.docStatusBox, docStatus.includes('Error') && styles.docStatusError]}>
          <Text style={[styles.docStatusText, docStatus.includes('Error') && styles.docStatusErrorText]}>
            {docStatus}
          </Text>
        </View>
      ) : null}

      <View style={styles.documentsSection}>
        <Text style={styles.documentsTitle}>
          Documentos ({patientDocuments.length})
        </Text>
        
        {patientDocuments.length === 0 ? (
          <View style={styles.noDocuments}>
            <Text style={styles.noDocumentsText}>Sin documentos aún</Text>
          </View>
        ) : (
          patientDocuments.map((doc, index) => (
            <View key={index} style={styles.documentItemContainer}>
              <TouchableOpacity
                style={styles.documentItemContent}
                onPress={() => handleOpenDocument(doc.name)}
              >
                <Text style={styles.documentItemName} numberOfLines={2}>
                  📄 {doc.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteDocButton}
                onPress={() => handleDeleteDocument(doc.name)}
              >
                <Text style={styles.deleteDocButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  const renderHome = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola Dr. {name}!</Text>
        <Text style={styles.subGreeting}>Tus pacientes registrados</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{patients.length}</Text>
        <Text style={styles.statsLabel}>Pacientes Registrados</Text>
      </View>

      {patients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No has registrado pacientes aún</Text>
          <Text style={styles.emptyStateSubText}>Usa la opción "Agregar Paciente" para comenzar</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.patientsListTitle}>Mis Pacientes</Text>
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id?.toString() || item.rut}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectPatient(item)}
                style={styles.patientCard}
              >
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{item.nombre}</Text>
                  <Text style={styles.patientRut}>RUT: {formatRut(item.rut)}</Text>
                  {item.diabetes_type && (
                    <Text style={styles.patientDiabetes}>
                      Diabetes Tipo {item.diabetes_type}
                    </Text>
                  )}
                  {item.created_at && (
                    <Text style={styles.patientDate}>
                      Registrado: {new Date(item.created_at).toLocaleDateString('es-CL')}
                    </Text>
                  )}
                </View>
                <View style={styles.patientBadge}>
                  <Text style={styles.badgeText}>Ver Docs</Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {selectedPatient ? renderPatientDetails() : renderHome()}

      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {}}
        >
          <Text style={styles.navItemText}>📊 Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('addPatient')}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 120, // Espacio para el navbar y botones del sistema
  },
  header: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00897B',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  profileInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#00897B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  statsLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  // Estilos para la sección de pacientes
  patientsListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  emptyStateSubText: {
    fontSize: 13,
    color: '#bbb',
  },
  patientListContent: {
    paddingBottom: 16,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  patientRut: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  patientDiabetes: {
    fontSize: 12,
    color: '#00897B',
    fontWeight: '500',
    marginBottom: 2,
  },
  patientDate: {
    fontSize: 11,
    color: '#999',
  },
  patientBadge: {
    backgroundColor: '#e0f2f1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#00897B',
    fontWeight: '600',
  },
  // Estilos para vista de detalles del paciente
  backButtonContainer: {
    marginBottom: 12,
  },
  backButton: {
    fontSize: 14,
    color: '#00897B',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
  },
  patientDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
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
  documentsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  noDocuments: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noDocumentsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  documentItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00897B',
  },
  documentItemContent: {
    flex: 1,
    marginRight: 8,
  },
  documentItemName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  deleteDocButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  deleteDocButtonText: {
    fontSize: 16,
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
