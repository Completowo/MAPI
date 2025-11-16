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
		// Traducir errores comunes de registro
		const message = (signUpError.message || '').toLowerCase();
		let errorMessage = 'Error al registrar. Intenta de nuevo.';
		
		if (message.includes('password') && message.includes('6 characters')) {
			errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
		} else if (message.includes('already registered') || message.includes('user already exists')) {
			errorMessage = 'Este correo ya está registrado. Intenta con otro correo.';
		} else if (message.includes('invalid email')) {
			errorMessage = 'Correo electrónico inválido. Verifica tu correo.';
		}
		
		const translatedError = new Error(errorMessage);
		return { error: translatedError };
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
	
	// Si falló la inserción, crear error con mensaje específico
	if (lastError) {
		const message = (lastError.message || '').toLowerCase();
		let errorMessage = 'Error al registrar. Intenta de nuevo.';
		
		if (message.includes('duplicate') || message.includes('rut')) {
			errorMessage = 'Este RUT ya está registrado.';
		} else if (message.includes('email')) {
			errorMessage = 'Este correo ya está registrado.';
		}
		
		const translatedError = new Error(errorMessage);
		return { error: translatedError };
	}
	
	return { error: lastError };
}

// Inicia sesión de un médico existente
// Valida credenciales y recupera el perfil completo del médico
export async function loginDoctor({ email, password }) {
	const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
	if (signInError) {
		return { error: true }; // Solo retorna que hubo error, sin el mensaje de Supabase
	}
	const user = data?.user || null;
	if (!user) {
		return { error: true };
	}
	try {
		const { data: profile, error: profileErr } = await supabase
			.from('doctores')
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (profileErr) {
			return { error: true };
		}
		return { user, profile };
	} catch (e) {
		return { error: true };
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
export async function uploadDoctorCertificate({ fileUri, filename, doctorUserId, doctorName }) {
	try {
		// Validar que el filename no sea undefined o vacío
		if (!filename || filename === 'undefined' || typeof filename !== 'string') {
			return { error: new Error('Nombre de archivo inválido. Por favor selecciona un archivo válido.') };
		}

		// Sanitizar el nombre del archivo
		const sanitizedFilename = filename
			.replace(/[^\w\s.-]/g, '_')
			.replace(/\s+/g, '_')
			.replace(/_+/g, '_')
			.toLowerCase()
			.trim();

		if (!sanitizedFilename || sanitizedFilename === '_') {
			return { error: new Error('El nombre del archivo no es válido después de sanitizar.') };
		}

		// Obtener la sesión actual
		const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
		if (sessionErr || !sessionData?.session?.user?.id) {
			return { error: new Error('No autenticado. Por favor inicia sesión primero.') };
		}
		
		const currentUserId = sessionData.session.user.id;
		const userIdToUse = doctorUserId || currentUserId;

		if (!userIdToUse) {
			return { error: new Error('ID del médico requerido.') };
		}

		// Usar nombre del médico si se proporciona, si no usar ID
		const folderName = doctorName || userIdToUse;

		// Construir ruta: certificados/{doctor_name}/{filename}
		const folder = `certificados/${folderName}`;
		const path = `${folder}/${sanitizedFilename}`;

		// Obtener el blob del archivo
		let uploadBody = fileUri;
		
		if (typeof fileUri === 'string') {
			console.log('Intentando fetch de URI:', fileUri);
			const response = await fetch(fileUri);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			uploadBody = await response.blob();
			console.log('Blob obtenido del fetch, tamaño:', uploadBody.size);
		} else {
			console.log('fileUri no es string, tipo:', typeof fileUri);
		}

		if (!uploadBody) {
			return { error: new Error('El archivo está vacío o no se pudo procesar.') };
		}
		
		console.log('Listos para subir, tipo:', uploadBody.constructor?.name, 'tamaño:', uploadBody.size);

		// Convertir Blob a base64 para compatibilidad con Supabase en Expo
		let base64Data = null;
		
		if (uploadBody.uri) {
			// Expo Blob tiene uri
			console.log('Leyendo archivo desde URI:', uploadBody.uri);
			const response = await fetch(uploadBody.uri);
			const blob = await response.blob();
			const reader = new FileReader();
			base64Data = await new Promise((resolve, reject) => {
				reader.onload = () => {
					const base64 = reader.result.split(',')[1];
					resolve(base64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		} else if (uploadBody instanceof Blob) {
			// Blob estándar
			const reader = new FileReader();
			base64Data = await new Promise((resolve, reject) => {
				reader.onload = () => {
					const base64 = reader.result.split(',')[1];
					resolve(base64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(uploadBody);
			});
		}
		
		if (!base64Data) {
			return { error: new Error('No se pudo convertir el archivo a base64.') };
		}
		
		console.log('Base64 listo, tamaño:', base64Data.length);
		
		// Convertir base64 a Uint8Array
		const binaryString = atob(base64Data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		
		// Upload
		return await uploadToSupabase(path, bytes, sanitizedFilename, userIdToUse, folderName, filename);
		
	} catch (e) {
		console.error('Error en uploadDoctorCertificate:', e);
		return { error: e };
	}
}

async function uploadToSupabase(path, fileBytes, sanitizedFilename, userIdToUse, folderName, filename) {
	try {
		console.log('Iniciando upload a:', path, 'tamaño:', fileBytes.length);
		
		const { data, error: uploadError } = await supabase.storage
			.from('docsDoctor')
			.upload(path, fileBytes, { 
				upsert: true,
				contentType: 'application/pdf'
			});

		if (uploadError) {
			console.error('Error de upload:', uploadError);
			return { error: uploadError };
		}

		console.log('Upload exitoso, data:', data);

		// Verificar que el archivo existe en el bucket
		const { data: fileList, error: listError } = await supabase.storage
			.from('docsDoctor')
			.list(`certificados/${folderName}`);

		if (listError) {
			console.warn('No se pudo verificar archivo en lista:', listError.message);
		} else {
			const fileExists = fileList.some(f => f.name === sanitizedFilename);
			if (fileExists) {
				console.log('✓ Archivo verificado en bucket:', sanitizedFilename);
			} else {
				console.warn('Archivo no encontrado en lista del bucket');
			}
		}

		// Obtener URL pública
		const { data: publicData } = supabase.storage.from('docsDoctor').getPublicUrl(path);
		console.log('✓ URL pública generada:', publicData?.publicUrl);
		
		return { publicUrl: publicData?.publicUrl ?? null };
	} catch (e) {
		console.error('Error en uploadToSupabase:', e);
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
		console.log('[insertPatientByDoctor] Inserting row:', row);
		const { data, error } = await supabase.from('pacientes').insert([row]);
		console.log('[insertPatientByDoctor] Insert result - data:', data, 'error:', error);
		if (error) return { error };
		return { paciente: data?.[0] ?? null };
	} catch (e) {
		console.error('[insertPatientByDoctor] Error:', e);
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

// Obtiene los certificados subidos por un médico en el bucket
export async function getDoctorCertificates(doctorUserId, doctorName) {
	try {
		if (!doctorName && !doctorUserId) {
			return { certificates: [] };
		}
		const folderName = doctorName || doctorUserId;
		const folderPath = `certificados/${folderName}`;
		const { data, error } = await supabase.storage
			.from('docsDoctor')
			.list(folderPath);

		if (error) {
			// Si la carpeta no existe, retornar vacío
			return { certificates: [] };
		}

		// Filtrar solo archivos (no carpetas)
		const files = data.filter(item => !item.metadata?.mimetype || item.metadata.mimetype.includes('pdf'));
		return { certificates: files };
	} catch (e) {
		console.error('Error al obtener certificados:', e);
		return { certificates: [] };
	}
}

// Obtiene la URL pública de un certificado
export async function getCertificateUrl(doctorUserId, filename, doctorName) {
	try {
		const folderName = doctorName || doctorUserId;
		const path = `certificados/${folderName}/${filename}`;
		const { data } = supabase.storage.from('docsDoctor').getPublicUrl(path);
		return { publicUrl: data?.publicUrl ?? null };
	} catch (e) {
		return { error: e };
	}
}

// Elimina un certificado del bucket
export async function deleteDoctorCertificate(doctorUserId, filename, doctorName) {
	try {
		// Obtener la sesión actual para verificar que es el propietario
		const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
		if (sessionErr || !sessionData?.session?.user?.id) {
			return { error: new Error('No autenticado. Por favor inicia sesión primero.') };
		}
		
		const currentUserId = sessionData.session.user.id;
		
		// Verificar que el usuario intenta eliminar sus propios certificados
		if (currentUserId !== doctorUserId) {
			return { error: new Error('No tienes permiso para eliminar este certificado.') };
		}

		const folderName = doctorName || doctorUserId;
		const path = `certificados/${folderName}/${filename}`;
		
		console.log('Eliminando certificado:', path);
		
		const { error } = await supabase.storage
			.from('docsDoctor')
			.remove([path]);

		if (error) {
			console.error('Error al eliminar certificado:', error);
			return { error };
		}

		console.log('✓ Certificado eliminado correctamente:', filename);
		
		// Limpiar el campo certificado_url en la tabla doctores
		const { error: updateError } = await supabase
			.from('doctores')
			.update({ certificado_url: null })
			.eq('user_id', doctorUserId);
		
		if (updateError) {
			console.warn('No se pudo actualizar certificado_url:', updateError);
		}
		
		return { success: true };
	} catch (e) {
		console.error('Error en deleteDoctorCertificate:', e);
		return { error: e };
	}
}

// Actualiza el campo certificado_url en la tabla doctores
export async function updateDoctorCertificateUrl(doctorUserId, certificateUrl) {
	try {
		const { error } = await supabase
			.from('doctores')
			.update({ certificado_url: certificateUrl })
			.eq('user_id', doctorUserId);
		
		if (error) {
			console.error('Error al actualizar certificado_url:', error);
			return { error };
		}
		
		console.log('✓ Campo certificado_url actualizado:', certificateUrl);
		return { success: true };
	} catch (e) {
		console.error('Error en updateDoctorCertificateUrl:', e);
		return { error: e };
	}
}

// Sube un documento de un paciente al bucket público `docsPatient`
// Los documentos se organizan en: documentos/{patientNombre}/{filename}
// Solo los médicos pueden subir documentos de sus pacientes
export async function uploadPatientDocument({ fileUri, filename, patientId, patientName }) {
	try {
		// Validar que el filename no sea undefined o vacío
		if (!filename || filename === 'undefined' || typeof filename !== 'string') {
			return { error: new Error('Nombre de archivo inválido. Por favor selecciona un archivo válido.') };
		}

		if (!patientId) {
			return { error: new Error('ID del paciente requerido.') };
		}

		// Usar patientName si se proporciona, si no usar patientId
		const folderName = patientName || patientId;

		// Sanitizar el nombre del archivo
		const sanitizedFilename = filename
			.replace(/[^\w\s.-]/g, '_')
			.replace(/\s+/g, '_')
			.replace(/_+/g, '_')
			.toLowerCase()
			.trim();

		if (!sanitizedFilename || sanitizedFilename === '_') {
			return { error: new Error('El nombre del archivo no es válido después de sanitizar.') };
		}

		// Obtener la sesión actual (solo médicos autenticados)
		const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
		if (sessionErr || !sessionData?.session?.user?.id) {
			return { error: new Error('No autenticado. Por favor inicia sesión primero.') };
		}

		// Construir ruta: documentos/{patientName}/{filename}
		const path = `documentos/${folderName}/${sanitizedFilename}`;

		// Obtener el blob del archivo
		let uploadBody = fileUri;
		
		if (typeof fileUri === 'string') {
			console.log('Intentando fetch de URI:', fileUri);
			const response = await fetch(fileUri);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			uploadBody = await response.blob();
			console.log('Blob obtenido del fetch, tamaño:', uploadBody.size);
		}

		if (!uploadBody) {
			return { error: new Error('El archivo está vacío o no se pudo procesar.') };
		}
		
		console.log('Listos para subir, tipo:', uploadBody.constructor?.name, 'tamaño:', uploadBody.size);

		// Convertir Blob a base64 para compatibilidad con Supabase en Expo
		let base64Data = null;
		
		if (uploadBody.uri) {
			// Expo Blob tiene uri
			console.log('Leyendo archivo desde URI:', uploadBody.uri);
			const response = await fetch(uploadBody.uri);
			const blob = await response.blob();
			const reader = new FileReader();
			base64Data = await new Promise((resolve, reject) => {
				reader.onload = () => {
					const base64 = reader.result.split(',')[1];
					resolve(base64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		} else if (uploadBody instanceof Blob) {
			// Blob estándar
			const reader = new FileReader();
			base64Data = await new Promise((resolve, reject) => {
				reader.onload = () => {
					const base64 = reader.result.split(',')[1];
					resolve(base64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(uploadBody);
			});
		}
		
		if (!base64Data) {
			return { error: new Error('No se pudo convertir el archivo a base64.') };
		}
		
		console.log('Base64 listo, tamaño:', base64Data.length);
		
		// Convertir base64 a Uint8Array
		const binaryString = atob(base64Data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		
		// Upload
		return await uploadPatientDocumentToSupabase(path, bytes, sanitizedFilename, filename);
		
	} catch (e) {
		console.error('Error en uploadPatientDocument:', e);
		return { error: e };
	}
}

async function uploadPatientDocumentToSupabase(path, fileBytes, sanitizedFilename, filename) {
	try {
		console.log('Iniciando upload a:', path, 'tamaño:', fileBytes.length);
		
		const { data, error: uploadError } = await supabase.storage
			.from('docsPatient')
			.upload(path, fileBytes, { 
				upsert: true,
				contentType: 'application/pdf'
			});

		if (uploadError) {
			console.error('Error de upload:', uploadError);
			return { error: uploadError };
		}

		console.log('Upload exitoso, data:', data);

		// Obtener URL pública
		const { data: publicData } = supabase.storage.from('docsPatient').getPublicUrl(path);
		console.log('✓ URL pública generada:', publicData?.publicUrl);
		
		return { publicUrl: publicData?.publicUrl ?? null };
	} catch (e) {
		console.error('Error en uploadPatientDocumentToSupabase:', e);
		return { error: e };
	}
}

// Obtiene los documentos de un paciente
export async function getPatientDocuments(patientName) {
	try {
		const folderPath = `documentos/${patientName}`;
		const { data, error } = await supabase.storage
			.from('docsPatient')
			.list(folderPath);

		if (error) {
			// Si la carpeta no existe, retornar vacío
			return { documents: [] };
		}

		// Filtrar solo archivos (no carpetas)
		const files = data.filter(item => !item.metadata?.mimetype || item.metadata.mimetype.includes('pdf'));
		return { documents: files };
	} catch (e) {
		console.error('Error al obtener documentos del paciente:', e);
		return { documents: [] };
	}
}

// Obtiene la URL pública de un documento de paciente
export async function getPatientDocumentUrl(patientName, filename) {
	try {
		const path = `documentos/${patientName}/${filename}`;
		const { data } = supabase.storage.from('docsPatient').getPublicUrl(path);
		return { publicUrl: data?.publicUrl ?? null };
	} catch (e) {
		return { error: e };
	}
}

// Elimina un documento de un paciente
export async function deletePatientDocument(patientName, filename) {
	try {
		// Obtener la sesión actual para verificar que es un médico autenticado
		const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
		if (sessionErr || !sessionData?.session?.user?.id) {
			return { error: new Error('No autenticado. Por favor inicia sesión primero.') };
		}

		const path = `documentos/${patientName}/${filename}`;
		
		console.log('Eliminando documento:', path);
		
		const { error } = await supabase.storage
			.from('docsPatient')
			.remove([path]);

		if (error) {
			console.error('Error al eliminar documento:', error);
			return { error };
		}

		console.log('✓ Documento eliminado correctamente:', filename);
		return { success: true };
	} catch (e) {
		console.error('Error en deletePatientDocument:', e);
		return { error: e };
	}
}