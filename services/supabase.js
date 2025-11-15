import { createClient } from '@supabase/supabase-js';
// URL del backend de Supabase donde se almacenan los datos
const SUPABASE_URL = 'https://zmmtdshapymhnfywolln.supabase.co';
// Clave anonima para autenticar solicitudes desde la aplicación cliente
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbXRkc2hhcHltaG5meXdvbGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDU4NzcsImV4cCI6MjA3ODAyMTg3N30.jZ3FI2_RyFapA-c1XK5V84FaTaZSwfPvWd2ngXefj0M';
// Crear cliente de Supabase para comunicarse con la base de datos
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Registra un nuevo médico en la aplicación
// Crea una cuenta de autenticación en Supabase Auth y agrega los datos del médico en la tabla 'doctores'
export async function registerDoctor(formData) {
	const { email, password, nombre, rut, id_especialidad, institucionMedica, codigoPostalInstitucion } = formData;
	
	// Crear usuario de autenticación con email y contraseña
	const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
	if (signUpError) {
		return { error: signUpError };
	}

	// Obtener los datos del usuario creado
	const user = data?.user || null;

	// Construir objeto base con datos comunes del médico
	const baseRow = {
		user_id: user?.id || null,
		nombre,
		rut,
		institucion_medica: institucionMedica,
		codigo_postal_institucion: codigoPostalInstitucion,
		email,
	};

	// Intentar normalizar el ID de especialidad a número
	// Si es un número, usarlo directamente; si es string numérico, convertir; si no, dejar como null
	const variants = [];
	let parsedEspecialidad = null;
	if (id_especialidad !== undefined && id_especialidad !== '') {
		if (typeof id_especialidad === 'number') {
			parsedEspecialidad = id_especialidad;
		} else if (/^\d+$/.test(String(id_especialidad))) {
			parsedEspecialidad = parseInt(String(id_especialidad), 10);
		}
	}
	
	// Crear variantes del registro: con especialidad y sin especialidad (en caso que falle una)
	if (parsedEspecialidad !== null) {
		variants.push({ ...baseRow, id_especialidad: parsedEspecialidad });
	} else {
		variants.push({ ...baseRow, id_especialidad: null });
		variants.push({ ...baseRow });
	}

	// Intentar insertar el registro médico en la tabla 'doctores' con diferentes variantes
	// Si una falla, intenta con la siguiente
	let lastError = null;
	for (const row of variants) {
		try {
			console.debug('Attempting insert into doctores with row keys:', Object.keys(row), 'row:', row);
			const { error: insertError } = await supabase.from('doctores').insert([row]);
			if (!insertError) {
				return { user };
			}
			lastError = insertError;
			const msg = String(insertError.message || insertError);
			console.warn('doctores insert failed:', msg);
			continue;
		} catch (e) {
			lastError = e;
			console.warn('doctores insert threw:', e?.message || e);
			continue;
		}
	}
	return { error: lastError };
}

// Inicia sesión de un médico existente
// Valida credenciales y recupera el perfil completo del médico
export async function loginDoctor({ email, password }) {
	// Autenticar con email y contraseña en Supabase Auth
	const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
	if (signInError) {
		return { error: signInError };
	}
	const user = data?.user || null;
	if (!user) {
		return { error: new Error('No se obtuvo usuario desde Auth') };
	}
	try {
		// Buscar el perfil completo del médico en la tabla 'doctores' usando su ID de usuario
		const { data: profile, error: profileErr } = await supabase
			.from('doctores')
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (profileErr) {
			return { user, error: profileErr };
		}
		return { user, profile };
	} catch (e) {
		return { user, error: e };
	}
}

// Obtiene la sesión actual del usuario autenticado
// Retorna los datos de sesión si existe una sesión activa
export async function getSession() {
	try {
		const { data, error } = await supabase.auth.getSession();
		if (error) return { error };
		return { session: data?.session ?? null };
	} catch (e) {
		return { error: e };
	}
}

// Cierra la sesión del usuario actual
// Invalida el token de autenticación
export async function logout() {
	try {
		const { error } = await supabase.auth.signOut();
		return { error };
	} catch (e) {
		return { error: e };
	}
}

// Obtiene el perfil completo de un médico por su ID de usuario
// Busca en la tabla 'doctores' el registro asociado al usuario
export async function getDoctorByUserId(userId) {
	try {
		const { data, error } = await supabase
			.from('doctores')
			.select('*')
			.eq('user_id', userId)
			.single();
		if (error) return { error };
		return { profile: data };
	} catch (e) {
		return { error: e };
	}
}

// Sube un certificado de un médico al bucket público `docsDoctor` dentro de la carpeta `certificados`
// Parámetros:
// - fileUri: URI local (por ejemplo DocumentPicker) o Blob/File
// - filename: nombre que se desea guardar (p. ej. 'certificado.pdf')
// - doctorUserId: id del usuario médico para organizar en subcarpeta (opcional)
// Retorna: { publicUrl } o { error }
export async function uploadDoctorCertificate({ fileUri, filename, doctorUserId }) {
	try {
		// Validar que el filename no sea undefined o vacío
		if (!filename || filename === 'undefined' || typeof filename !== 'string') {
			return { error: new Error('Nombre de archivo inválido. Por favor selecciona un archivo válido.') };
		}

		// Sanitizar el nombre del archivo para que sea una clave válida en Supabase
		// Reemplaza espacios, caracteres especiales por guiones bajos o guiones
		const sanitizedFilename = filename
			.replace(/[^\w\s.-]/g, '_') // Reemplaza caracteres especiales por guiones bajos
			.replace(/\s+/g, '_') // Reemplaza espacios por guiones bajos
			.replace(/_+/g, '_') // Colapsa múltiples guiones bajos en uno
			.toLowerCase() // Convierte a minúsculas para consistencia
			.trim();

		if (!sanitizedFilename || sanitizedFilename === '_') {
			return { error: new Error('El nombre del archivo no es válido después de sanitizar.') };
		}

		// Obtener la sesión actual para validar que el usuario esté autenticado
		const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
		if (sessionErr || !sessionData?.session?.user?.id) {
			return { error: new Error('No autenticado. Por favor inicia sesión primero.') };
		}
		
		// Usar el ID del usuario autenticado
		const currentUserId = sessionData.session.user.id;
		const userIdToUse = doctorUserId || currentUserId;

		// Construir ruta dentro del bucket: certificados/<doctorUserId>/<filename>
		const folder = `certificados/${userIdToUse}`;
		const path = `${folder}/${sanitizedFilename}`;

		// Si nos pasan un Blob/File, lo usamos directamente, si nos pasan un URI (string) lo fetch-eamos
		let uploadBody = fileUri;
		if (typeof fileUri === 'string') {
			const response = await fetch(fileUri);
			uploadBody = await response.blob();
		}

		const { data, error: uploadError } = await supabase.storage
			.from('docsDoctor')
			.upload(path, uploadBody, { upsert: true });

		if (uploadError) {
			return { error: uploadError };
		}

		// Obtener URL pública (bucket público)
		const { data: publicData } = supabase.storage.from('docsDoctor').getPublicUrl(path);
		
		// Intentar registrar el certificado en la tabla doctor_certificates si existe
		try {
			await supabase.from('doctor_certificates').insert([{
				doctor_user_id: userIdToUse,
				file_path: path,
				file_name: filename, // Guardar el nombre original en la BD
				sanitized_name: sanitizedFilename, // Guardar el nombre sanitizado
				uploaded_at: new Date().toISOString(),
			}]).then(res => {
				// Si la tabla no existe o hay error, lo ignoramos
				if (res.error) {
					console.warn('No se pudo registrar el certificado en la BD:', res.error.message);
				}
			});
		} catch (dbErr) {
			// Si falla el registro en BD pero la subida fue exitosa, continuamos
			console.warn('Error al registrar certificado en BD:', dbErr);
		}
		
		return { publicUrl: publicData?.publicUrl ?? null };
	} catch (e) {
		return { error: e };
	}
}

// Registra un nuevo paciente asociado a un médico
// El médico puede registrar pacientes en el sistema especificando sus datos
export async function insertPatientByDoctor({ nombre, rut, doctor_user_id, diabetes_type }) {
	try {
		const row = {
			nombre,
			rut,
			doctor_user_id: doctor_user_id || null,
			email: null,
			diabetes_type: diabetes_type ?? null,
		};
		const { data, error } = await supabase.from('pacientes').insert([row]);
		if (error) return { error };
		return { paciente: data?.[0] ?? null };
	} catch (e) {
		return { error: e };
	}
}

// Busca un paciente existente por su RUT
// Se utiliza para verificar si un paciente ya fue registrado por algún médico
export async function findPatientByRut(rut) {
	try {
		const { data, error } = await supabase.from('pacientes').select('*').eq('rut', rut).maybeSingle();
		if (error) return { error };
		return { paciente: data ?? null };
	} catch (e) {
		return { error: e };
	}
}

// Crea una cuenta de usuario para un paciente existente
// El paciente debe estar previamente registrado por un médico para usar esta función
// Requiere: RUT (para identificar al paciente), edad, contraseña y email
export async function createPatientAccount({ rut, age, password, email, diabetes_type }) {
	try {
		// Buscar si el paciente ya existe en el sistema (registrado por médico)
		const { paciente, error: findErr } = await findPatientByRut(rut);
		if (findErr) return { error: findErr };
		if (!paciente) return { error: new Error('RUT no registrado por ningún médico') };
		if (paciente.user_id) return { error: new Error('Paciente ya tiene cuenta') };

		// Definir email: usar el proporcionado o el registrado, o generar uno por defecto
		const emailToUse = (email && email.length > 3) ? email : (paciente.email && paciente.email.length > 3 ? paciente.email : `${rut}@mapi.local`);

		// Crear usuario de autenticación para el paciente
		const { data, error: signUpErr } = await supabase.auth.signUp({ email: emailToUse, password });
		if (signUpErr) return { error: signUpErr };
		const user = data?.user || null;

		// Preparar actualizaciones: agregar ID de usuario, edad y email del paciente
		const updates = { user_id: user?.id ?? null };
		if (age !== undefined) updates.age = age;

		if (emailToUse && (!paciente.email || paciente.email !== emailToUse)) {
			updates.email = emailToUse;
		}

		// Actualizar el tipo de diabetes si se proporciona
		if (diabetes_type !== undefined && diabetes_type !== null) {
			updates.diabetes_type = diabetes_type;
		}

		// Actualizar registro del paciente en la base de datos con su nuevo ID de usuario
		const { error: updateErr } = await supabase.from('pacientes').update(updates).eq('rut', rut);
		if (updateErr) return { error: updateErr };

		return { user, paciente: { ...paciente, ...updates } };
	} catch (e) {
		return { error: e };
	}
}
