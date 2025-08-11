// Script para verificar datos de tutores en Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWK_3vF4OT-l16R95z8bqFHbFLfhO4-7o",
  authDomain: "pequenos-genios.firebaseapp.com", 
  projectId: "pequenos-genios",
  storageBucket: "pequenos-genios.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verificarTutores() {
  try {
    console.log('🔍 Verificando tutores en Firebase...');
    
    const tutoresSnapshot = await getDocs(collection(db, "tutors"));
    console.log(`📊 Encontrados ${tutoresSnapshot.size} tutores`);
    
    tutoresSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 Tutor ID: ${doc.id}`);
      console.log(`   Email: ${data.email || 'No configurado'}`);
      console.log(`   Nombre: ${data.fullName || data.displayName || 'No configurado'}`);
      console.log('   ---');
    });
    
    // También verificar perfiles de niños
    const perfilesSnapshot = await getDocs(collection(db, "childProfiles"));
    console.log(`👶 Encontrados ${perfilesSnapshot.size} perfiles de niños`);
    
    perfilesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 Perfil ID: ${doc.id}`);
      console.log(`   Niño: ${data.fullName || 'No configurado'}`);
      console.log(`   Tutor ID: ${data.tutorId || 'No asignado'}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verificarTutores();
