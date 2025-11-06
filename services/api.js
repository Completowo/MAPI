import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Función para obtener la URL base del API
const getApiBaseUrl = () => {
  // Si hay una URL de API configurada (ngrok), usarla
  if (process.env.API_URL) {
    return `${process.env.API_URL}/api`;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api';
  }

  // En desarrollo con Expo
  const debuggerHost = Constants.manifest2?.extra?.expoGo?.debuggerHost ||
                      Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    // El debuggerHost tiene el formato 'ip:port'
    const hostname = debuggerHost.split(':')[0];
    
    // Verificar si podemos acceder al servidor en esta IP
    const serverUrl = `http://${hostname}:4000/api`;
    
    // Devolver la URL con la IP del host de Expo
    console.log('🔗 Conectando a servidor en:', serverUrl);
    return serverUrl;
  }

  // Si no podemos determinar la IP, intentar con localhost
  console.warn('⚠️ No se pudo determinar la IP del servidor, usando localhost');
  return 'http://localhost:4000/api';
};

const BASE = getApiBaseUrl();
console.log('API Base URL:', BASE); // Para debug
console.log('API Base URL:', BASE); // Para debugging

export async function saveMessage({ text, sender }) {
  const res = await fetch(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, sender })
  });
  if (!res.ok) throw new Error("Error saving message");
  return res.json();
}

export async function getMessages() {
  const res = await fetch(`${BASE}/messages`);
  if (!res.ok) throw new Error("Error getting messages");
  return res.json();
}

export async function saveMedico({ nombre, run, especialidad, telefono, email }) {
  const res = await fetch(`${BASE}/medicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, run, especialidad, telefono, email })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error saving medico: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getMedicos() {
  const res = await fetch(`${BASE}/medicos`);
  if (!res.ok) throw new Error("Error getting medicos");
  return res.json();
}

// Verificar si un médico existe por email
export async function verificarMedico({ email }) {
  const res = await fetch(`${BASE}/medicos/verificar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    throw new Error('Médico no encontrado');
  }
  return res.json();
}

// Upload medico with PDF and password using FormData
export async function saveMedicoMultipart({ nombre, run, telefono, email, password, file }) {
  try {
    const form = new FormData();
    form.append('nombre', nombre);
    form.append('run', run);
    if (telefono) form.append('telefono', telefono);
    if (email) form.append('email', email);
    form.append('password', password);

    // Manejar el archivo según la plataforma
    if (file) {
      if (Platform.OS === 'web') {
        form.append('file', file);
      } else {
        // En React Native, asegurarnos de que el archivo tenga la estructura correcta
        form.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: file.type || 'application/pdf'
        });
      }
    }

      console.log('Enviando petición a:', `${BASE}/medicos`);
      console.log('Platform:', Platform.OS);
      console.log('FormData:', JSON.stringify([...form.entries()]));

      const res = await fetch(`${BASE}/medicos`, {
      method: 'POST',
      headers: Platform.OS === 'web' ? {} : {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: form
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error del servidor: ${res.status} ${txt}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error en saveMedicoMultipart:', error);
    if (error.message.includes('Network request failed')) {
      throw new Error(`No se pudo conectar al servidor en ${BASE}. Verifica tu conexión y que el servidor esté corriendo.`);
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed: ${res.status} ${txt}`);
  }
  return res.json();
}