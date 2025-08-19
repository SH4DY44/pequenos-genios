import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validar que las variables de entorno estén presentes
const requiredEnvVars = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Verificar que todas las variables estén definidas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `REACT_APP_FIREBASE_${key.toUpperCase()}`);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno de Firebase faltantes:', missingVars);
  // En desarrollo, mostrar error detallado
  if (process.env.NODE_ENV === 'development') {
    throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
  }
}

const firebaseConfig = requiredEnvVars;

// Inicializar Firebase con manejo de errores
let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
  // En producción, crear objetos mock para evitar crashes
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Creando servicios mock para producción');
    // Crear objetos básicos para evitar crashes
    auth = null;
    db = null;
    storage = null;
  } else {
    throw error;
  }
}

export { auth, db, storage };

export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    console.error("Error enviando email de verificación:", error);
    return false;
  }
};

export default app;