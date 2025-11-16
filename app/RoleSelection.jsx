import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const RoleSelection = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MAPI</Text>
        <Text style={styles.subtitle}>¿Eres paciente o médico?</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPatient]}
            onPress={() => router.push('patientLogin')}
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Paciente</Text>
            <Text style={[styles.buttonEmoji]}>😉</Text>
            <Text style={[styles.buttonDescription, styles.buttonDescriptionPrimary]}>
              ¡Te acompañamos en tu día a día!
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDoctor]}
            onPress={() => router.push('doctorLogin')}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Médico</Text>
            <Text style={[styles.buttonEmoji]}>🧑‍⚕️</Text>
            <Text style={[styles.buttonDescription, styles.buttonDescriptionSecondary]}>
              Gestiona pacientes y registros
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 60,
    fontWeight: '800',
    color: '#2196F3',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 24,
    color: '#666',
    marginBottom: 48,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 360,
    gap: 16,
  },
  button: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  buttonPatient: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonDoctor: {
    backgroundColor: '#ffffff',
    borderColor: '#00897B',
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextSecondary: {
    color: '#00897B',
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  buttonDescription: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  buttonDescriptionPrimary: {
    color: '#ffffff',
    opacity: 0.9,
  },
  buttonDescriptionSecondary: {
    color: '#00897B',
    opacity: 0.9,
  }
});

export default RoleSelection;
