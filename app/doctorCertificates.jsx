import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Linking, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { getSession, getDoctorByUserId, uploadDoctorCertificate, logout, getDoctorCertificates, deleteDoctorCertificate, updateDoctorCertificateUrl } from '../services/supabase';
import { supabase } from '../services/supabase';

// Mapeo de IDs de especialidad a nombres
const ESPECIALIDADES = {
  1: 'Endocrinología',
  2: 'Medicina Interna',
  3: 'Pediatría',
  4: 'Medicina Familiar',
  5: 'Nutrición y Dietética',
  6: 'Diabetólogo',
};

export default function DoctorCertificates() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      setChecking(true);
      const { session, error } = await getSession();
      if (error || !session) {
        if (mounted) setAllowed(false);
        setChecking(false);
        return;
      }
      const user = session?.user ?? null;
      if (!user) {
        if (mounted) setAllowed(false);
        setChecking(false);
        return;
      }
      const { profile, error: profileErr } = await getDoctorByUserId(user.id);
      if (profileErr || !profile) {
        if (mounted) setAllowed(false);
        setChecking(false);
        return;
      }
      if (mounted) {
        setUserId(user.id);
        setProfile(profile);
        setAllowed(true);
        
        // Verificar si ya tiene certificado
        checkForCertificate(user.id, profile?.nombre);
      }
      setChecking(false);
    }
    check();
    return () => { mounted = false; };
  }, []);

  // Verificar si el doctor ya tiene un certificado
  const checkForCertificate = async (doctorUserId, doctorName) => {
    try {
      const { certificates } = await getDoctorCertificates(doctorUserId, doctorName);
      if (certificates && certificates.length > 0) {
        setHasCertificate(true);
        // Obtener URL del primer certificado
        const firstCert = certificates[0];
        const folderName = doctorName || doctorUserId;
        const path = `certificados/${folderName}/${firstCert.name}`;
        const { data } = supabase.storage.from('docsDoctor').getPublicUrl(path);
        setCertificateUrl(data?.publicUrl);
      } else {
        setHasCertificate(false);
      }
    } catch (err) {
      console.log('Error verificando certificados:', err);
      setHasCertificate(false);
    }
  };

  const pickAndUpload = async () => {
    try {
      setStatus('Seleccionando archivo...');
      const res = await DocumentPicker.getDocumentAsync({ 
        copyToCacheDirectory: false,
        type: 'application/pdf'
      });
      
      console.log('DocumentPicker response:', res);
      
      if (res.type === 'cancel') {
        setStatus('Selección cancelada');
        return;
      }

      // Obtener el archivo
      let selectedFile = res;
      if (res.assets && res.assets.length > 0) {
        selectedFile = res.assets[0];
      }
      
      console.log('Selected file:', selectedFile);

      if (!selectedFile || !selectedFile.uri) {
        setStatus('Error: No se obtuvo el archivo correctamente');
        return;
      }

      const filename = selectedFile.name || selectedFile.fileName || selectedFile.uri.split('/').pop() || 'documento.pdf';
      const fileUri = selectedFile.uri;

      if (!filename.toLowerCase().endsWith('.pdf')) {
        setStatus('Error: Solo se permiten archivos PDF');
        return;
      }

      setStatus(`Cargando archivo: ${filename}...`);
      setUploading(true);
      setUploadedUrl(null);

      const { publicUrl, error } = await uploadDoctorCertificate({
        fileUri: fileUri,
        filename: filename,
        doctorUserId: userId,
        doctorName: profile?.nombre,
      });
      
      if (error) {
        console.error('Upload error:', error);
        setStatus(`Error: ${String(error.message || error)}`);
      } else {
        setUploadedUrl(publicUrl);
        setStatus('Archivo subido correctamente');
        
        // Guardar la URL en el campo certificado_url de la tabla doctores
        await updateDoctorCertificateUrl(userId, publicUrl);
        
        // Actualizar estado para mostrar que ya tiene certificado
        setTimeout(() => {
          setHasCertificate(true);
          setCertificateUrl(publicUrl);
        }, 1500);
      }
    } catch (e) {
      console.error('Catch error:', e);
      setStatus(`Error: ${String(e.message || e)}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCertificate = async () => {
    try {
      setDeleting(true);
      setStatus('Eliminando certificado...');
      
      // Extraer el nombre del archivo de la URL
      const filename = certificateUrl.split('/').pop();
      
      //Usar la función del servicio para eliminar
      const { success, error } = await deleteDoctorCertificate(userId, filename, profile?.nombre);
      
      if (error) {
        setStatus(`Error al eliminar: ${error.message}`);
      } else if (success) {
        setHasCertificate(false);
        setCertificateUrl(null);
        setUploadedUrl(null);
        setStatus('Certificado eliminado correctamente');
      }
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    router.replace('doctorLogin2');
  };

  if (checking) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#7F7F7F" />
      <Text style={styles.loadingText}>Verificando permisos...</Text>
    </View>
  );

  if (!allowed) return (
    <View style={styles.center}>
      <Text style={styles.title}>Acceso denegado</Text>
      <Text style={styles.errorText}>Esta vista es solo para médicos autenticados.</Text>
      <Button title="Ir al login" onPress={() => router.replace('doctorLogin2')} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} scrollEnabled={true} nestedScrollEnabled={true}>
        <View style={styles.header}>
          <Text style={styles.title}>Tu Perfil</Text>
          <Text style={styles.subtitle}>Información y certificados</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Información Personal</Text>
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{profile?.nombre || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>RUT:</Text>
              <Text style={styles.infoValue}>{profile?.rut || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{profile?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Institución:</Text>
              <Text style={styles.infoValue}>{profile?.institucion_medica || 'N/A'}</Text>
            </View>
            {profile?.codigo_postal_institucion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Código Postal:</Text>
                <Text style={styles.infoValue}>{profile.codigo_postal_institucion}</Text>
              </View>
            )}
            {profile?.id_especialidad && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Especialidad:</Text>
                <Text style={styles.infoValue}>{ESPECIALIDADES[profile.id_especialidad] || 'No especificada'}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.certificateCard}>
          <Text style={styles.cardTitle}>Mis Certificados</Text>
          
          {hasCertificate ? (
            <View>
              <Text style={styles.successMessage}>Certificado subido correctamente</Text>
              {certificateUrl && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(certificateUrl)}
                  style={styles.viewCertificateButton}
                >
                  <Text style={styles.viewCertificateButtonText}>Ver certificado</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxText}>
                  Para actualizar tu certificado, elimínalo y sube el nuevo.
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
                onPress={handleDeleteCertificate}
                disabled={deleting}
              >
                <Text style={styles.deleteButtonText}>
                  {deleting ? 'Eliminando...' : 'Eliminar certificado'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.alertBox}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>¡Sube tu certificado profesional!</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={pickAndUpload}
                disabled={uploading}
              >
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'Subiendo...' : 'Seleccionar y subir PDF'}
                </Text>
              </TouchableOpacity>

              {uploading && <ActivityIndicator style={{ marginTop: 12 }} color="#2196F3" />}
              
              {status && (
                <View style={[styles.statusBox, status.includes('Error') && styles.statusBoxError]}>
                  <Text style={[styles.statusText, status.includes('Error') && styles.statusTextError]}>
                    {status}
                  </Text>
                </View>
              )}

              {uploadedUrl && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(uploadedUrl)}
                  style={styles.urlBox}
                >
                  <Text style={styles.urlLabel}>Ver archivo subido:</Text>
                  <Text style={styles.url} numberOfLines={2}>{uploadedUrl}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.logoutButtonWrapper}>
          <TouchableOpacity
            style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Text style={styles.logoutButtonText}>
              {loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/doctorView')}
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
          onPress={() => {}}
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
    paddingBottom: 200, // Espacio para el navbar y botones del sistema
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#7F7F7F',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F7F7F',
  },
  errorText: {
    marginVertical: 12,
    color: '#7F7F7F',
    textAlign: 'center',
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
  certificateCard: {
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
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  alertBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  alertText: {
    fontSize: 13,
    color: '#d32f2f',
    fontWeight: '600',
    flex: 1,
  },
  successMessage: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  infoBox: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  infoBoxText: {
    fontSize: 13,
    color: '#7F7F7F',
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff5252',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  profileInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#7F7F7F',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  uploadButton: {
    backgroundColor: '#7F7F7F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  statusBoxError: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#e53935',
  },
  statusText: {
    color: '#2e7d32',
    fontSize: 13,
    fontWeight: '500',
  },
  statusTextError: {
    color: '#c62828',
  },
  urlBox: {
    backgroundColor: '#efefef',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#7F7F7F',
  },
  urlLabel: {
    fontSize: 12,
    color: '#7F7F7F',
    fontWeight: '600',
    marginBottom: 4,
  },
  url: {
    fontSize: 11,
    color: '#7F7F7F',
    fontWeight: '500',
  },
  viewCertificateButton: {
    backgroundColor: '#7F7F7F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'center',
  },
  viewCertificateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 150,
  },
  logoutButtonWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
    alignItems: 'flex-end',
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
    color: '#7F7F7F',
    textAlign: 'center',
  },
});
