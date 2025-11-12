import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getSession, logout, getDoctorByUserId } from '../services/supabase';

export default function DoctorView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { session, error: sessErr } = await getSession();
      if (sessErr) {
        if (mounted) router.replace('doctorLogin');
        return;
      }
      if (!session) {
        if (mounted) router.replace('doctorLogin');
        return;
      }

      const userId = session.user?.id;
      if (!userId) {
        if (mounted) router.replace('doctorLogin');
        return;
      }

      const { profile, error: profErr } = await getDoctorByUserId(userId);
      if (profErr) {
        setName(session.user?.email ?? '');
      } else {
        setName(profile?.nombre ?? session.user?.email ?? '');
      }

      if (mounted) setLoading(false);
    })();

    return () => { mounted = false; };
  }, [router]);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    router.replace('doctorLogin');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido {name}</Text>
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
});
