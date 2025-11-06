import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { getMedicos, deleteMedico } from '../services/api';

export function AdminDoctores({ onBack }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await getMedicos();
      setDoctors(data);
    } catch (error) {
      console.error('Error cargando médicos:', error);
      Alert.alert('Error', 'No se pudieron cargar los médicos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro que deseas eliminar al Dr. ${doctor.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedico(doctor._id);
              Alert.alert('Éxito', 'Médico eliminado correctamente');
              loadDoctors(); // Recargar la lista
            } catch (error) {
              console.error('Error eliminando médico:', error);
              Alert.alert('Error', 'No se pudo eliminar al médico');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Administrar Médicos</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Cargando...</Text>
        </View>
      ) : (
        <ScrollView style={styles.doctorList}>
          {doctors.map((doctor) => (
            <View key={doctor._id} style={styles.doctorItem}>
              <View>
                <Text style={styles.doctorName}>{doctor.nombre}</Text>
                <Text style={styles.doctorDetails}>RUN: {doctor.run}</Text>
                <Text style={styles.doctorDetails}>Email: {doctor.email}</Text>
              </View>
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteDoctor(doctor)}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: '#83C1FF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2B2B2B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorList: {
    flex: 1,
    padding: 16,
  },
  doctorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B2B2B',
    marginBottom: 4,
  },
  doctorDetails: {
    fontSize: 14,
    color: '#5A7B9B',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});