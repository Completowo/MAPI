import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function PatientHome({ onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.info}>Zona de paciente</Text>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontSize: 18,
    color: '#2B2B2B',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#83C1FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PatientHome;
