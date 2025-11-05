import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function RoleSelection({ onSelectDoctor, onSelectPatient }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona cómo deseas autenticarte</Text>

      <Pressable style={styles.primaryButton} onPress={onSelectDoctor}>
        <Text style={styles.primaryButtonText}>Autenticarse como médico</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onSelectPatient}>
        <Text style={styles.secondaryButtonText}>Autenticarse como paciente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 540,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    color: '#2B2B2B',
    marginBottom: 18,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#83C1FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2B2B2B',
    fontWeight: '500',
  },
});

export default RoleSelection;
