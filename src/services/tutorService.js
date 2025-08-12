// src/services/tutorService.js
import { 
    doc, 
    getDoc, 
    updateDoc, 
    collection,
    query,
    where,
    getDocs,
    writeBatch,
    serverTimestamp 
  } from 'firebase/firestore';
  import { deleteUser } from 'firebase/auth';
  import { db, auth } from '../config/firebase';
  
  export class TutorService {
    
    /**
     * Obtener todos los datos del tutor actual
     * @returns {Promise<Object|null>} - Datos del tutor o null si no existe
     */
    static async obtenerDatosTutor(tutorId = null) {
      try {
        const userId = tutorId || auth.currentUser?.uid;
        if (!userId) {
          throw new Error('No hay usuario autenticado');
        }
  
        const tutorDoc = await getDoc(doc(db, 'tutors', userId));
        
        if (tutorDoc.exists()) {
          return {
            id: tutorDoc.id,
            ...tutorDoc.data()
          };
        } else {
          console.warn(`Tutor ${userId} no encontrado en la base de datos`);
          return null;
        }
      } catch (error) {
        console.error('Error obteniendo datos del tutor:', error);
        throw error;
      }
    }
  
    /**
     * Obtener solo el teléfono del tutor
     * @param {string} tutorId - ID del tutor (opcional, usa el actual si no se proporciona)
     * @returns {Promise<string|null>} - Número de teléfono o null
     */
    static async obtenerTelefono(tutorId = null) {
      try {
        const datosTutor = await this.obtenerDatosTutor(tutorId);
        return datosTutor?.phone || null;
      } catch (error) {
        console.error('Error obteniendo teléfono del tutor:', error);
        return null;
      }
    }
  
    /**
     * Actualizar el teléfono del tutor
     * @param {string} nuevoTelefono - Nuevo número de teléfono
     * @param {string} tutorId - ID del tutor (opcional)
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     */
    static async actualizarTelefono(nuevoTelefono, tutorId = null) {
      try {
        const userId = tutorId || auth.currentUser?.uid;
        if (!userId) {
          throw new Error('No hay usuario autenticado');
        }
  
        // Validar el número antes de guardarlo
        const numeroLimpio = nuevoTelefono.replace(/\D/g, '');
        if (numeroLimpio.length < 10) {
          throw new Error('El número de teléfono debe tener al menos 10 dígitos');
        }
  
        await updateDoc(doc(db, 'tutors', userId), {
          phone: numeroLimpio,
          updatedAt: serverTimestamp()
        });
  
        console.log('Teléfono actualizado correctamente:', numeroLimpio);
        return true;
      } catch (error) {
        console.error('Error actualizando teléfono:', error);
        throw error;
      }
    }
  
    /**
     * Actualizar datos generales del tutor
     * @param {Object} nuevosDatos - Objeto con los campos a actualizar
     * @param {string} tutorId - ID del tutor (opcional)
     * @returns {Promise<boolean>} - True si se actualizó correctamente
     */
    static async actualizarDatos(nuevosDatos, tutorId = null) {
      try {
        const userId = tutorId || auth.currentUser?.uid;
        if (!userId) {
          throw new Error('No hay usuario autenticado');
        }
  
        // Agregar timestamp de actualización
        const datosAActualizar = {
          ...nuevosDatos,
          updatedAt: serverTimestamp()
        };
  
        await updateDoc(doc(db, 'tutors', userId), datosAActualizar);
        console.log('Datos del tutor actualizados correctamente');
        return true;
      } catch (error) {
        console.error('Error actualizando datos del tutor:', error);
        throw error;
      }
    }
  
    /**
     * Verificar si el tutor existe en la base de datos
     * @param {string} tutorId - ID del tutor (opcional)
     * @returns {Promise<boolean>} - True si existe
     */
    static async existeTutor(tutorId = null) {
      try {
        const userId = tutorId || auth.currentUser?.uid;
        if (!userId) return false;
  
        const tutorDoc = await getDoc(doc(db, 'tutors', userId));
        return tutorDoc.exists();
      } catch (error) {
        console.error('Error verificando existencia del tutor:', error);
        return false;
      }
    }
  
    /**
     * Obtener información de contacto completa (para notificaciones)
     * @param {string} tutorId - ID del tutor (opcional)
     * @returns {Promise<Object>} - Objeto con datos de contacto
     */
    static async obtenerInfoContacto(tutorId = null) {
      try {
        const datosTutor = await this.obtenerDatosTutor(tutorId);
        
        if (!datosTutor) {
          return {
            telefono: null,
            email: null,
            nombre: 'Usuario',
            tieneContacto: false
          };
        }
  
        return {
          telefono: datosTutor.phone || null,
          email: datosTutor.email || auth.currentUser?.email || null,
          nombre: datosTutor.fullName || 'Usuario',
          relacion: datosTutor.relationship || null,
          tieneContacto: !!(datosTutor.phone || datosTutor.email),
          tutorId: datosTutor.id
        };
      } catch (error) {
        console.error('Error obteniendo información de contacto:', error);
        return {
          telefono: null,
          email: null,
          nombre: 'Usuario',
          tieneContacto: false
        };
      }
    }
  
    /**
     * Validar si se puede enviar notificaciones por WhatsApp
     * @param {string} tutorId - ID del tutor (opcional)
     * @returns {Promise<Object>} - Estado de disponibilidad de WhatsApp
     */
    static async validarWhatsAppDisponible(tutorId = null) {
      try {
        const infoContacto = await this.obtenerInfoContacto(tutorId);
        
        if (!infoContacto.telefono) {
          return {
            disponible: false,
            razon: 'No hay número de teléfono registrado',
            accion: 'Agregar número en el perfil'
          };
        }
  
        // Validar formato del número
        const numeroLimpio = infoContacto.telefono.replace(/\D/g, '');
        if (numeroLimpio.length < 10) {
          return {
            disponible: false,
            razon: 'Número de teléfono inválido',
            accion: 'Verificar el número en el perfil'
          };
        }
  
        return {
          disponible: true,
          telefono: numeroLimpio,
          nombre: infoContacto.nombre
        };
      } catch (error) {
        console.error('Error validando WhatsApp:', error);
        return {
          disponible: false,
          razon: 'Error verificando datos',
          accion: 'Intentar más tarde'
        };
      }
    }
  
    /**
     * Obtener estadísticas básicas del tutor (para dashboard)
     * @param {string} tutorId - ID del tutor (opcional)
     * @returns {Promise<Object>} - Estadísticas del tutor
     */
    static async obtenerEstadisticasTutor(tutorId = null) {
      try {
        const datosTutor = await this.obtenerDatosTutor(tutorId);
        
        if (!datosTutor) {
          return {
            fechaRegistro: null,
            tiempoEnPlataforma: 0,
            ultimaActividad: null
          };
        }
  
        const fechaRegistro = datosTutor.createdAt?.toDate() || null;
        const ahora = new Date();
        const tiempoEnPlataforma = fechaRegistro 
          ? Math.floor((ahora - fechaRegistro) / (1000 * 60 * 60 * 24)) 
          : 0;
  
        return {
          fechaRegistro,
          tiempoEnPlataforma,
          ultimaActividad: datosTutor.updatedAt?.toDate() || fechaRegistro,
          nombreCompleto: datosTutor.fullName,
          relacion: datosTutor.relationship,
          email: datosTutor.email
        };
      } catch (error) {
        console.error('Error obteniendo estadísticas del tutor:', error);
        return {
          fechaRegistro: null,
          tiempoEnPlataforma: 0,
          ultimaActividad: null
        };
      }
    }

    /**
     * Eliminar completamente la cuenta del tutor y todos sus datos asociados
     * IMPORTANTE: Esta acción es irreversible
     * @param {string} tutorId - ID del tutor (opcional, usa el actual si no se proporciona)
     * @returns {Promise<Object>} - Resultado de la operación
     */
    static async eliminarCuentaTutor(tutorId = null) {
      try {
        const userId = tutorId || auth.currentUser?.uid;
        if (!userId) {
          throw new Error('No hay usuario autenticado');
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('Usuario no encontrado para eliminación');
        }

        console.log('🗑️ Iniciando eliminación de cuenta del tutor:', userId);

        // 1. Obtener todos los perfiles de niños asociados al tutor
        const perfilesQuery = query(
          collection(db, 'childProfiles'), 
          where('tutorId', '==', userId)
        );
        const perfilesSnapshot = await getDocs(perfilesQuery);

        // 2. Crear un lote de operaciones para eliminar todo de forma atómica
        const batch = writeBatch(db);
        let perfilesEliminados = 0;

        // 3. Eliminar todos los perfiles de niños y sus datos asociados
        for (const perfilDoc of perfilesSnapshot.docs) {
          const perfilId = perfilDoc.id;
          console.log('🧒 Eliminando perfil de niño:', perfilId);

          // Eliminar el perfil del niño
          batch.delete(doc(db, 'childProfiles', perfilId));

          // Buscar y eliminar evaluaciones asociadas
          const evaluacionesQuery = query(
            collection(db, 'evaluaciones'),
            where('profileId', '==', perfilId)
          );
          const evaluacionesSnapshot = await getDocs(evaluacionesQuery);
          evaluacionesSnapshot.docs.forEach(evalDoc => {
            batch.delete(doc(db, 'evaluaciones', evalDoc.id));
          });

          // Buscar y eliminar progreso/estadísticas
          const progresoQuery = query(
            collection(db, 'userProgress'),
            where('profileId', '==', perfilId)
          );
          const progresoSnapshot = await getDocs(progresoQuery);
          progresoSnapshot.docs.forEach(progDoc => {
            batch.delete(doc(db, 'userProgress', progDoc.id));
          });

          // Buscar y eliminar recompensas
          const recompensasQuery = query(
            collection(db, 'rewards'),
            where('profileId', '==', perfilId)
          );
          const recompensasSnapshot = await getDocs(recompensasQuery);
          recompensasSnapshot.docs.forEach(rewDoc => {
            batch.delete(doc(db, 'rewards', rewDoc.id));
          });

          perfilesEliminados++;
        }

        // 4. Eliminar el documento del tutor
        batch.delete(doc(db, 'tutors', userId));

        // 5. Ejecutar todas las eliminaciones de Firestore
        await batch.commit();

        console.log('✅ Datos de Firestore eliminados, procediendo a eliminar cuenta de Auth');

        // 6. Finalmente, eliminar la cuenta de autenticación de Firebase Auth
        // NOTA: Esto automáticamente deslogueará al usuario
        await deleteUser(currentUser);

        console.log('✅ Cuenta del tutor eliminada completamente:', {
          tutorId: userId,
          perfilesEliminados,
          timestamp: new Date().toISOString()
        });

        return {
          success: true,
          message: 'Cuenta eliminada exitosamente',
          details: {
            tutorId: userId,
            perfilesEliminados,
            eliminadoEn: new Date()
          }
        };

      } catch (error) {
        console.error('❌ Error eliminando cuenta del tutor:', error);
        
        // Categorizar el error para dar un mensaje más específico
        let errorMessage = 'Error desconocido al eliminar la cuenta';
        
        if (error.code === 'auth/requires-recent-login') {
          errorMessage = 'Por seguridad, necesitas volver a iniciar sesión antes de eliminar tu cuenta';
        } else if (error.code === 'permission-denied') {
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (error.code === 'network-request-failed') {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo';
        } else if (error.message.includes('No hay usuario autenticado')) {
          errorMessage = 'Sesión expirada. Inicia sesión de nuevo';
        }

        return {
          success: false,
          message: errorMessage,
          error: error.code || error.message,
          timestamp: new Date()
        };
      }
    }

    /**
     * Verificar si el usuario puede eliminar su cuenta (validaciones de seguridad)
     * @param {string} tutorId - ID del tutor (opcional)
     * @returns {Promise<Object>} - Estado de elegibilidad para eliminación
     */
    static async verificarElegibilidadEliminacion(tutorId = null) {
      try {
        const userId = tutorId || auth.currentUser?.uid;
        if (!userId) {
          return {
            puedeEliminar: false,
            razon: 'No hay usuario autenticado',
            requiereAccion: 'Iniciar sesión'
          };
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
          return {
            puedeEliminar: false,
            razon: 'Usuario no encontrado',
            requiereAccion: 'Volver a iniciar sesión'
          };
        }

        // Verificar si la sesión es reciente (menos de 5 minutos)
        const tiempoUltimoLogin = currentUser.metadata.lastSignInTime;
        const ahora = new Date();
        const tiempoTranscurrido = ahora - new Date(tiempoUltimoLogin);
        const requiereReautenticacion = tiempoTranscurrido > (5 * 60 * 1000); // 5 minutos

        // Contar perfiles asociados
        const perfilesQuery = query(
          collection(db, 'childProfiles'),
          where('tutorId', '==', userId)
        );
        const perfilesSnapshot = await getDocs(perfilesQuery);
        const numPerfiles = perfilesSnapshot.size;

        return {
          puedeEliminar: true,
          requiereReautenticacion,
          numeroPerfiles: numPerfiles,
          advertencias: [
            'Esta acción eliminará permanentemente tu cuenta',
            `Se eliminarán ${numPerfiles} perfil(es) de niño(s)`,
            'Se perderá todo el progreso y evaluaciones',
            'Esta acción no se puede deshacer'
          ],
          ultimoLogin: tiempoUltimoLogin
        };

      } catch (error) {
        console.error('Error verificando elegibilidad:', error);
        return {
          puedeEliminar: false,
          razon: 'Error verificando datos de la cuenta',
          requiereAccion: 'Intentar más tarde'
        };
      }
    }
  }