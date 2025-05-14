import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Función para eliminar todas las actividades de Firebase
export const eliminarActividades = async () => {
  try {
    // Obtener todas las actividades
    const actividadesSnapshot = await getDocs(collection(db, 'actividades'));
    
    // Eliminar cada documento
    const promesasEliminacion = actividadesSnapshot.docs.map(documento => 
      deleteDoc(doc(db, 'actividades', documento.id))
    );
    
    // Esperar a que todas las eliminaciones se completen
    await Promise.all(promesasEliminacion);
    
    console.log(`Se eliminaron ${actividadesSnapshot.size} actividades correctamente`);
    return true;
  } catch (error) {
    console.error('Error al eliminar actividades:', error);
    return false;
  }
};