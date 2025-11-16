import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform, FlatList, useWindowDimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getSession, logout, getDoctorByUserId } from '../services/supabase';
import { supabase } from '../services/supabase';

// Pantalla principal para médicos después de iniciar sesión
export default function DoctorView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);

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
      const { data: patientsData, error: patientsErr } = await supabase
        .from('pacientes')
        .select('*')
        .eq('doctor_user_id', userId)
        .order('created_at', { ascending: false });

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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Pantalla de inicio (home)
  const renderHome = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Saludo personalizado */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola Dr. {name}!</Text>
        <Text style={styles.subGreeting}>Tus pacientes registrados</Text>
      </View>

      {/* Card de resumen de pacientes */}
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{patients.length}</Text>
        <Text style={styles.statsLabel}>Pacientes Registrados</Text>
      </View>

      {/* Lista de pacientes */}
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
              <View style={styles.patientCard}>
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
                  <Text style={styles.badgeText}>Paciente</Text>
                </View>
              </View>
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
      {/* Contenido principal */}
      {renderHome()}

      {/* Navbar inferior */}
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
    color: '#2196F3',
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
    backgroundColor: '#2196F3',
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
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 2,
  },
  patientDate: {
    fontSize: 11,
    color: '#999',
  },
  patientBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#2196F3',
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
