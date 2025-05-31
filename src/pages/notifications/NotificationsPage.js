// src/pages/notifications/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import NotificationDemo from '../../components/notifications/NotificationDemo';
import banner from '../../assets/images/banner.jpeg';

function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ AGREGADO: Verificar autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setError(null);
      } else {
        // Redirigir a login si no está autenticado
        navigate('/login');
        return;
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  // ✅ AGREGADO: Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--primary-yellow)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
          <p className="mt-4 text-[var(--primary-blue)] font-medium">
            Cargando centro de notificaciones...
          </p>
        </div>
      </div>
    );
  }

  // ✅ AGREGADO: Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--primary-yellow)] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ✅ AGREGADO: Error boundary para componentes
  const ErrorBoundary = ({ children, fallback }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      const handleError = (error) => {
        console.error('Error en NotificationsPage:', error);
        setHasError(true);
        setError('Error al cargar el componente de notificaciones');
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
      return fallback || (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error al cargar</h3>
          <p className="text-red-600 text-sm">Hubo un problema cargando este componente.</p>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="min-h-screen bg-[var(--primary-yellow)]">
      {/* ✅ MEJORADO: Header con información de usuario */}
      <nav className="bg-[var(--primary-blue)] p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/profile-selection" className="flex items-center">
            <img src={banner} alt="Pequeños Genios" className="h-12" />
            <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* ✅ AGREGADO: Info de usuario */}
            {user && (
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[var(--primary-blue)] font-bold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white text-sm font-medium">
                  {user.email}
                </span>
              </div>
            )}
            
            {/* ✅ MEJORADO: Botón de volver con icono */}
            <Link 
              to="/profile-selection"
              className="flex items-center space-x-2 text-white hover:text-yellow-300 
                       transition-colors bg-white bg-opacity-10 rounded-lg px-4 py-2 
                       hover:bg-opacity-20"
            >
              <span>←</span>
              <span className="hidden sm:inline">Volver</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ✅ MEJORADO: Contenido principal con mejor estructura */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* ✅ AGREGADO: Header de página */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[var(--primary-blue)] mb-2">
            📢 Centro de Notificaciones
          </h1>
          <p className="text-gray-600">
            Mantente al día con el progreso y actividades de tus pequeños
          </p>
        </div>

        {/* ✅ MEJORADO: Centro de notificaciones con error boundary */}
        <ErrorBoundary
          fallback={
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-red-800 font-semibold mb-2">Error al cargar notificaciones</h3>
              <p className="text-red-600 text-sm mb-4">
                Hubo un problema cargando las notificaciones. Por favor, recarga la página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Recargar página
              </button>
            </div>
          }
        >
          <NotificationCenter />
        </ErrorBoundary>
        
        {/* ✅ MEJORADO: Demo solo en desarrollo con mejor styling */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <div className="border-t border-gray-300 my-8"></div>
            
            {/* ✅ MEJORADO: Banner de desarrollo más atractivo */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🧪</div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Panel de Desarrollo
                  </h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    Este panel aparece solo en modo desarrollo. Aquí puedes probar 
                    todas las funcionalidades del sistema de notificaciones.
                  </p>
                  <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    NODE_ENV: {process.env.NODE_ENV}
                  </div>
                </div>
              </div>
            </div>
            
            {/* ✅ AGREGADO: Demo con error boundary */}
            <ErrorBoundary
              fallback={
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-yellow-800 font-semibold">Error en Demo</h3>
                  <p className="text-yellow-600 text-sm">El panel de demo no se pudo cargar.</p>
                </div>
              }
            >
              <NotificationDemo />
            </ErrorBoundary>
          </>
        )}

        {/* ✅ AGREGADO: Footer informativo */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ¿Sabías que...?
          </h3>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Las notificaciones te ayudan a mantener un seguimiento constante del progreso 
            de tus pequeños y te alertan sobre actividades importantes, logros alcanzados 
            y recomendaciones personalizadas.
          </p>
          
          {/* ✅ AGREGADO: Estadísticas rápidas */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 font-bold text-lg">5</div>
              <div className="text-blue-800 text-xs">Tipos de notificaciones</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 font-bold text-lg">24/7</div>
              <div className="text-green-800 text-xs">Monitoreo automático</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-purple-600 font-bold text-lg">∞</div>
              <div className="text-purple-800 text-xs">Notificaciones ilimitadas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;