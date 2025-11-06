import { supabase } from './supabase'; // Asegúrate de que el path sea correcto

// Obtener la lista de doctores
export const getDoctors = async () => {
  try {
    // Realizar una consulta a la tabla 'doctors'
    const { data, error } = await supabase
      .from('doctors')  // El nombre de la tabla donde están los doctores
      .select('id, name_doctor');  // Seleccionamos los campos que necesitamos

    if (error) {
      throw error;  // Si hay un error, lo lanzamos
    }

    return data;  // Devolvemos la data de la consulta
  } catch (err) {
    console.error('Error al obtener los doctores:', err);
    throw new Error('Error al obtener doctores');
  }
};

// Agregar un nuevo doctor
export const addDoctor = async (name) => {
  try {
    // Insertar un nuevo doctor en la tabla 'doctors'
    const { data, error } = await supabase
      .from('doctors')  // El nombre de la tabla donde estamos insertando
      .insert([
        { name_doctor: name }  // El campo 'name_doctor' debe ser un campo de tipo VARCHAR en tu tabla
      ]);

    if (error) {
      throw error;  // Si hay un error en la inserción, lo lanzamos
    }

    return data;  // Devolvemos la data de la inserción (el doctor agregado)
  } catch (err) {
    console.error('Error al agregar doctor:', err);
    throw new Error('Error al agregar doctor');
  }
};
