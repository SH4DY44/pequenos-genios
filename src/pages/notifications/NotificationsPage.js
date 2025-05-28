// src/pages/notifications/NotificationsPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import NotificationDemo from '../../components/notifications/NotificationDemo';
import banner from '../../assets/images/banner.jpeg';

function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[var(--primary-yellow)]">
      <nav className="bg-[var(--primary-blue)] p-4">
        <div className="flex items-center justify-between">
          <Link to="/profile-selection" className="flex items-center">
            <img src={banner} alt="Pequeños Genios" className="h-12" />
            <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
          </Link>
          
          <Link 
            to="/profile-selection"
            className="text-white hover:text-yellow-300 transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Centro de notificaciones principal */}
        <NotificationCenter />
        
        {/* Demo solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <div className="border-t border-gray-300 my-8"></div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🧪 Modo Desarrollo
              </h3>
              <p className="text-yellow-700 text-sm">
                El panel de pruebas aparece solo en desarrollo. En producción, los usuarios solo verán el centro de notificaciones.
              </p>
            </div>
            <NotificationDemo />
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;