import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getSession, getDoctorByUserId, uploadDoctorCertificate } from '../services/supabase';

export default function DoctorCertificates({ navigation }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

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
        setAllowed(true);
      }
      setChecking(false);
    }
    check();
    return () => { mounted = false; };
  }, []);

  const pickAndUpload = async () => {
    try {
      setStatus('Seleccionando archivo...');
      const res = await DocumentPicker.getDocumentAsync({ 
        copyToCacheDirectory: false,
        type: 'application/pdf' // Solo permite PDFs
      });
      if (res.type === 'cancel') {
        setStatus('Selección cancelada');
        return;
      }

      // Extraer información del archivo desde la respuesta de DocumentPicker
      // Soporta diferentes formatos según la plataforma (assets, documentos, etc.)
      const file = res.assets?.[0] ?? res;
      const filename = file.name || file.fileName || file.uri?.split('/').pop() || 'documento.pdf';
      const fileUri = file.uri;
      const fileSize = file.size; // Tamaño en bytes

      if (!fileUri) {
        setStatus('Error: No se pudo obtener la URI del archivo');
        return;
      }

      // Validar que sea PDF
      if (!filename.toLowerCase().endsWith('.pdf')) {
        setStatus('Error: Solo se permiten archivos PDF');
        return;
      }

      // Validar tamaño máximo (5 MB = 5242880 bytes)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB en bytes
      if (fileSize && fileSize > MAX_FILE_SIZE) {
        const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        setStatus(`Error: El archivo es demasiado grande (${sizeMB} MB). Máximo permitido: 5 MB`);
        return;
      }

      setStatus(`Archivo seleccionado: ${filename} (${fileSize ? (fileSize / 1024).toFixed(2) : '?'} KB)`);
      setUploading(true);
      setUploadedUrl(null);

      const { publicUrl, error } = await uploadDoctorCertificate({
        fileUri: fileUri,
        filename: filename,
      });
      if (error) {
        setStatus(`Error subida: ${String(error.message || error)}`);
      } else {
        setUploadedUrl(publicUrl);
        setStatus('Subida completada');
      }
    } catch (e) {
      setStatus(`Error: ${String(e.message || e)}`);
    } finally {
      setUploading(false);
    }
  };

  if (checking) return (
    <View style={styles.center}>
      <ActivityIndicator />
      <Text>Verificando permisos...</Text>
    </View>
  );

  if (!allowed) return (
    <View style={styles.center}>
      <Text style={styles.title}>Acceso denegado</Text>
      <Text>Esta vista es solo para médicos autenticados.</Text>
      <Button title="Ir al login" onPress={() => navigation?.navigate?.('doctorLogin') || null} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subir certificados (médicos)</Text>
      <Text style={styles.info}>Bucket público: docsDoctor / carpeta: certificados</Text>
      <Button title="Seleccionar y subir certificado" onPress={pickAndUpload} disabled={uploading} />
      {uploading && <ActivityIndicator style={{ marginTop: 8 }} />}
      <Text style={styles.status}>{status}</Text>
      {uploadedUrl ? (
        <Text style={styles.link} onPress={() => Linking.openURL(uploadedUrl)}>{uploadedUrl}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  info: { marginBottom: 12, color: '#444' },
  status: { marginTop: 12, color: '#222' },
  link: { marginTop: 8, color: 'blue', textDecorationLine: 'underline' },
});
