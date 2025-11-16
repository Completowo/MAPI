import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { registerDoctor } from '../services/supabase';
import postalCodes from '../assets/cl_cods_post.json';

export default function DoctorRegister() {
  const router = useRouter();
  // Estado del formulario con todos los campos necesarios para registrar un médico
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    id_especialidad: '',
    institucionMedica: '',
    codigoPostalInstitucion: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
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

  // Función para validar RUT usando el algoritmo del dígito verificador
  function validateRut(value) {
    const cleaned = cleanRut(value);
    if (!cleaned || cleaned.length < 2) return false;
    const body = cleaned.slice(0, -1);
    let dv = cleaned.slice(-1);
    dv = dv === 'K' ? 'K' : dv;
    if (!/^\d{7,8}$/.test(body)) return false;
    // Calcular el dígito verificador usando el algoritmo mod-11
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
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [postalValid, setPostalValid] = useState(null);
  const [postalInfo, setPostalInfo] = useState(null);

  // Procesar y cargar códigos postales desde el archivo JSON
  let postalSet = null;
  let postalMap = null;
  try {
    // Crear un mapa de códigos postales para validación rápida
    if (Array.isArray(postalCodes)) {
      const map = new Map();
      const list = postalCodes
        .map((item) => {
          if (item == null) return null;
          if (typeof item === 'object') {
            const code = item['Código Postal'] ?? item['codigo_postal'] ?? item.codigo ?? item.code ?? item.postal ?? null;
            if (code == null) return null;
            const cleaned = String(code).replace(/\D/g, '').padStart(7, '0');
            map.set(cleaned, item);
            return cleaned;
          }
          const cleaned = String(item).replace(/\D/g, '').padStart(7, '0');
          map.set(cleaned, item);
          return cleaned;
        })
        .filter(Boolean);
      postalSet = new Set(list);
      postalMap = map;
    }
  } catch (e) {
    postalSet = null;
    postalMap = null;
    console.warn('Error building postalSet from assets/cl_cods_post.json', e);
  }

  // Función para validar un código postal
  function isValidChilePostalCode(value) {
    if (value === undefined || value === null) return false;
    const cleaned = String(value).replace(/\D/g, '');
    if (!/^\d{7}$/.test(cleaned)) return false;
    if (!postalSet) return true;
    return postalSet.has(cleaned);
  }

  // Función para obtener información del código postal
  function getPostalInfo(value) {
    if (!postalMap) return null;
    const cleaned = String(value).replace(/\D/g, '');
    if (!/^\d{7}$/.test(cleaned)) return null;
    return postalMap.get(cleaned) ?? null;
  }

  // Valida todos los campos, RUT y código postal antes de enviar
  async function handleRegister() {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Validar campos requeridos
    if (!formData.nombre || !formData.rut || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }
    if (!formData.id_especialidad) {
      setErrorMsg('Seleccione una especialidad.');
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    
    // Validar RUT
    const rutValid = validateRut(formData.rut);
    if (!rutValid) {
      setErrorMsg('RUT inválido. Por favor verifica el RUT ingresado.');
      return;
    }

    // Validar código postal
    const postalOk = isValidChilePostalCode(formData.codigoPostalInstitucion || '');
    if (!postalOk) {
      setErrorMsg('Código postal inválido. Por favor verifica el código postal de la institución.');
      return;
    }

    // Formatear RUT antes de enviarlo
    const formattedRut = formatRut(formData.rut);
    setFormData(prev => ({ ...prev, rut: formattedRut }));

    setLoading(true);
    try {
      // Llamar función de registro desde servicio Supabase
      const { error, user } = await registerDoctor(formData);
      if (error) {
        setErrorMsg(error.message || 'Error al registrar. Intenta de nuevo.');
      } else {
        setSuccessMsg('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => router.push('doctorLogin'), 1200);

      }
    } catch (err) {
      setErrorMsg('Error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        <Text style={styles.title}>Registro Médico</Text>
        <Text style={styles.subtitle}>Complete sus datos para registrarse</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Combre completo"
              value={formData.nombre}
              onChangeText={(text) => setFormData({...formData, nombre: text})}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>RUT</Text>
            <TextInput
              style={styles.input}
              placeholder="00.000.000-K"
              value={formData.rut}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9kK\.\-\s]/g, '');
                const cleaned = cleanRut(filtered);
                if (/^\d{7,8}[0-9Kk]$/.test(cleaned)) {
                  setFormData(prev => ({ ...prev, rut: formatRut(cleaned) }));
                } else {
                  setFormData(prev => ({ ...prev, rut: filtered }));
                }
              }}
              keyboardType="default"
            />
            {/* Mostrar validación del RUT */}
            {formData.rut ? (
              validateRut(formData.rut) ? (
                <Text style={[styles.helperText, { color: '#2e7d32' }]}>✔ RUT válido</Text>
              ) : (
                <Text style={[styles.helperText, { color: '#d32f2f' }]}>✖ RUT inválido</Text>
              )
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Especialidad</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.id_especialidad}
                onValueChange={(value) => setFormData({...formData, id_especialidad: value})}
                style={styles.picker}>
                <Picker.Item label="Seleccione especialidad..." value="" />
                <Picker.Item label="Endocrinología" value={1} />
                <Picker.Item label="Medicina Interna" value={2} />
                <Picker.Item label="Pediatría" value={3} />
                <Picker.Item label="Medicina Familiar" value={4} />
                <Picker.Item label="Nutrición y Dietética" value={5} />
                <Picker.Item label="Diabetólogo" value={6} />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Institución Médica</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Hospital San José"
              value={formData.institucionMedica}
              onChangeText={(text) => setFormData({...formData, institucionMedica: text})}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Código Postal (Institución)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 0000000"
              value={formData.codigoPostalInstitucion}
              onChangeText={(text) => {
                const filtered = text.replace(/\D/g, '');
                setFormData(prev => ({...prev, codigoPostalInstitucion: filtered}));
                if (filtered.length === 7) {
                  const ok = !!isValidChilePostalCode(filtered);
                  setPostalValid(ok);
                  setPostalInfo(ok ? getPostalInfo(filtered) : null);
                } else {
                  setPostalValid(null);
                  setPostalInfo(null);
                }
              }}
              onBlur={() => {
                const value = formData.codigoPostalInstitucion || '';
                const ok = isValidChilePostalCode(value);
                setPostalValid(!!ok);
                setPostalInfo(ok ? getPostalInfo(value) : null);
              }}
              keyboardType="numeric"
            />
            {/* Mostrar validación del código postal */}
            {formData.codigoPostalInstitucion ? (
              postalValid === null ? (
                <Text style={styles.helperText}>Verificando código postal...</Text>
              ) : postalValid ? (
                postalInfo ? (
                  <Text style={[styles.helperText, { color: '#2e7d32' }]}>✔ Código postal válido — {postalInfo['Comuna/Localidad'] || postalInfo.comuna || ''}, {postalInfo['Región'] || postalInfo.region || ''}</Text>
                ) : (
                  <Text style={[styles.helperText, { color: '#2e7d32' }]}>✔ Código postal válido</Text>
                )
              ) : (
                <Text style={[styles.helperText, { color: '#d32f2f' }]}>✖ Código postal inválido</Text>
              )
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme su contraseña"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry
            />
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          {/* Link para ir a login si ya tiene cuenta */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.push('doctorLogin')}
          >
            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: '800',
    color: '#2196F3',
    marginBottom: Platform.OS === 'web' ? 8 : 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#666',
    marginBottom: Platform.OS === 'web' ? 32 : 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 480,
    gap: Platform.OS === 'web' ? 16 : 12,
    alignSelf: 'center',
  },
  inputContainer: {
    gap: Platform.OS === 'web' ? 8 : 6,
    marginBottom: Platform.OS === 'web' ? 0 : 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  picker: {
    width: '100%',
    minHeight: Platform.OS === 'web' ? 48 : 56,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'web' ? 10 : 12,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
  },
  uploadButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2196F3',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
  uploadButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  registerButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    padding: 16,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#2196F3',
    fontSize: 14,
  },
  errorText: {
    color: '#e53935',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
});
