import { useEffect } from 'react';
import { TareasPeriodicasNiveles } from '../services/tareasPeriodicasNiveles';

/**
 * Hook para inicializar el sistema de promoción automática de niveles
 * Se ejecuta al cargar la aplicación
 */
export function usePromocionAutomatica() {
  useEffect(() => {
    // Configurar verificación automática cada hora (60 minutos)
    const intervalo = TareasPeriodicasNiveles.configurarVerificacionPeriodica(60);

    console.log('🎓 Sistema de promoción automática iniciado');

    // Cleanup al desmontar
    return () => {
      if (intervalo) {
        clearInterval(intervalo);
        console.log('🔄 Sistema de promoción automática detenido');
      }
    };
  }, []);
}

/**
 * Componente wrapper para inicializar el sistema de promoción automática
 */
function PromocionAutomaticaWrapper({ children }) {
  usePromocionAutomatica();
  return children;
}

export default PromocionAutomaticaWrapper;
