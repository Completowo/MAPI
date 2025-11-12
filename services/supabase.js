import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://zmmtdshapymhnfywolln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbXRkc2hhcHltaG5meXdvbGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDU4NzcsImV4cCI6MjA3ODAyMTg3N30.jZ3FI2_RyFapA-c1XK5V84FaTaZSwfPvWd2ngXefj0M';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function registerDoctor(formData) {
	const { email, password, nombre, rut, id_especialidad, institucionMedica, codigoPostalInstitucion } = formData;

	const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
	if (signUpError) {
		return { error: signUpError };
	}

	const user = data?.user || null;

	const baseRow = {
		user_id: user?.id || null,
		nombre,
		rut,
		institucion_medica: institucionMedica,
		codigo_postal_institucion: codigoPostalInstitucion,
		email,
	};

	const variants = [];
	let parsedEspecialidad = null;
	if (id_especialidad !== undefined && id_especialidad !== '') {
		if (typeof id_especialidad === 'number') {
			parsedEspecialidad = id_especialidad;
		} else if (/^\d+$/.test(String(id_especialidad))) {
			parsedEspecialidad = parseInt(String(id_especialidad), 10);
		}
	}
	if (parsedEspecialidad !== null) {
		variants.push({ ...baseRow, id_especialidad: parsedEspecialidad });
	} else {
		variants.push({ ...baseRow, id_especialidad: null });
		variants.push({ ...baseRow });
	}

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

/**
 * Log in a doctor using email/password.
 * Returns { error, user, profile } where profile is the row from `doctores` (if any).
 */
export async function loginDoctor({ email, password }) {
	// Sign in via Supabase Auth
	const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
	if (signInError) {
		return { error: signInError };
	}

	const user = data?.user || null;
	if (!user) {
		return { error: new Error('No se obtuvo usuario desde Auth') };
	}

	// Try to fetch the profile from `doctores` by user_id
	try {
		const { data: profile, error: profileErr } = await supabase
			.from('doctores')
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (profileErr) {
			// If no profile found, return user but no profile
			return { user, error: profileErr };
		}

		return { user, profile };
	} catch (e) {
		return { user, error: e };
	}
}

/**
 * Returns the current session (if any).
 */
export async function getSession() {
	try {
		const { data, error } = await supabase.auth.getSession();
		if (error) return { error };
		return { session: data?.session ?? null };
	} catch (e) {
		return { error: e };
	}
}

/**
 * Signs out the current user.
 */
export async function logout() {
	try {
		const { error } = await supabase.auth.signOut();
		return { error };
	} catch (e) {
		return { error: e };
	}
}

/**
 * Fetch doctor profile by auth user id.
 */
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
