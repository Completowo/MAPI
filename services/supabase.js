import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmmtdshapymhnfywolln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbXRkc2hhcHltaG5meXdvbGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDU4NzcsImV4cCI6MjA3ODAyMTg3N30.jZ3FI2_RyFapA-c1XK5V84FaTaZSwfPvWd2ngXefj0M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Registers a doctor: creates an Auth user and inserts a profile row in `doctores` table.
 * Expects formData with: nombre, rut, especialidad, institucionMedica, codigoPostalInstitucion, email, password
 */
export async function registerDoctor(formData) {
	const { email, password, nombre, rut, especialidad, institucionMedica, codigoPostalInstitucion } = formData;

	// Create auth user
	const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
	if (signUpError) {
		return { error: signUpError };
	}

	const user = data?.user || null;

	// Insert profile row linked to auth user (user_id)
	const { error: insertError } = await supabase
		.from('doctores')
		.insert([
			{
				user_id: user?.id || null,
				nombre,
				rut,
				especialidad,
				institucion_medica: institucionMedica,
				codigo_postal_institucion: codigoPostalInstitucion,
				email,
			},
		]);

	if (insertError) {
		// Optionally: cleanup auth user if profile insert fails
		return { error: insertError };
	}

	return { user };
}
