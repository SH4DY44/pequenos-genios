import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Función para crear actividades en Firebase
export const crearActividades = async () => {
  try {
    const actividadesData = [
      {
        titulo: "Reconocimiento de Emociones",
        descripcion: "Aprende a identificar diferentes emociones en rostros y situaciones",
        categoria: "habilidades-sociales",
        duracionEstimada: 15,
        nivelRecomendado: ["básico", "básico-alto", "intermedio"],
        componente: "ReconocimientoEmociones",
        imagenPortada: "https://via.placeholder.com/400x300?text=Emociones"
      },
      {
        titulo: "Búsqueda de Diferencias",
        descripcion: "Encuentra las diferencias entre dos imágenes para mejorar tu atención al detalle",
        categoria: "atencion",
        duracionEstimada: 10,
        nivelRecomendado: ["todos"],
        componente: "BusquedaDiferencias",
        imagenPortada: "https://via.placeholder.com/400x300?text=Diferencias"
      },
      {
        titulo: "Control de Impulsos",
        descripcion: "Ejercicios para mejorar el autocontrol y la regulación emocional",
        categoria: "control-impulsos",
        duracionEstimada: 20,
        nivelRecomendado: ["básico-alto", "intermedio", "avanzado"],
        componente: "ControlImpulsos",
        imagenPortada: "https://via.placeholder.com/400x300?text=Control+Impulsos"
      }
    ];

    // Obtener las actividades existentes
    const actividadesSnapshot = await getDocs(collection(db, 'actividades'));
    const actividadesExistentes = actividadesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Contador para actividades añadidas y existentes
    let contadorAñadidas = 0;
    let contadorExistentes = 0;

    // Añadir cada actividad a la colección si no existe ya
    for (const actividad of actividadesData) {
      // Comprobar si la actividad ya existe (por título y componente)
      const actividadExistente = actividadesExistentes.find(
        act => act.titulo === actividad.titulo && act.componente === actividad.componente
      );

      if (!actividadExistente) {
        // Si no existe, añadirla
        await addDoc(collection(db, 'actividades'), actividad);
        console.log(`Actividad "${actividad.titulo}" añadida correctamente`);
        contadorAñadidas++;
      } else {
        console.log(`Actividad "${actividad.titulo}" ya existe, no se añadirá`);
        contadorExistentes++;
      }
    }

    console.log(`Proceso completado: ${contadorAñadidas} actividades añadidas, ${contadorExistentes} ya existían`);
    return {
      success: true,
      añadidas: contadorAñadidas,
      existentes: contadorExistentes
    };
  } catch (error) {
    console.error('Error al crear actividades:', error);
    return {
      success: false,
      error: error.message
    };
  }
};