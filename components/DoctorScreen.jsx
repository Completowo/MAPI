import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { getDoctors, addDoctor } from '../services/doctorService'; // Importa las funciones de servicio

export default function DoctorScreen() {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener los doctores
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctors();  // Llamada a la función de servicio
      setDoctors(data);
    } catch (err) {
      setError('Error al consultar doctores');
    }
    setLoading(false);
  };

  // Llamada inicial a la base de datos para obtener los doctores
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Función para agregar un nuevo doctor
  const handleAddDoctor = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addDoctor(name);  // Llamada a la función de servicio
      setName('');  // Limpiar el campo de nombre
      fetchDoctors();  // Refrescar la lista de doctores
    } catch (err) {
      setError('Error al agregar doctor');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Doctores</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={doctors}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.name_doctor}</Text>
        )}
        refreshing={loading}
        onRefresh={fetchDoctors}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre del doctor"
        value={name}
        onChangeText={setName}
      />
      <Button title="Agregar Doctor" onPress={handleAddDoctor} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  item: {
    fontSize: 18,
    paddingVertical: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
