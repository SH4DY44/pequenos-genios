// src/services/tutorService.js
import { 
    doc, 
    getDoc, 
    updateDoc, 
    serverTimestamp 
  } from 'firebase/firestore';
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
  }