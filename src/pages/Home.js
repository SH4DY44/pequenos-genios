import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import banner from '../assets/images/banner.jpeg';
import menu from '../assets/images/menu.jpeg';

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const benefits = [
    {
      title: "Aprendizaje Personalizado",
      description: "Actividades adaptadas al ritmo y necesidades de cada niño",
      icon: "📚"
    },
    {
      title: "Juegos Educativos",
      description: "Aprende mientras se divierte con juegos interactivos",
      icon: "🎮"
    },
    {
      title: "Seguimiento Detallado",
      description: "Monitorea el progreso de tu hijo en tiempo real",
      icon: "📊"
    }
  ];

  useEffect(() => {
    // Activar animaciones después del montaje del componente
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Función para manejar transiciones elegantes
  const handleNavigate = (path) => {
    setIsTransitioning(true);
    
    // Animación de salida suave
    setTimeout(() => {
      navigate(path);
    }, 600); // 600ms para una transición elegante
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-600 ease-out ${
      isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
    }`}>
      {/* Navbar */}
      <nav className={`bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg fixed w-full top-0 z-50 transition-all duration-700 ease-out ${
        isLoaded ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src={banner} alt="Pequeños Genios" className="h-12" />
              <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleNavigate('/login')}
                className="text-white hover:text-yellow-300 transition-colors duration-300 font-medium bg-transparent border-none cursor-pointer"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => handleNavigate('/register')}
                className="bg-yellow-400 text-purple-800 px-6 py-2 rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg border-none cursor-pointer"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="bg-[var(--primary-yellow)] py-12 flex-grow pt-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`w-full md:w-1/2 transition-all duration-1000 ease-out ${
              isLoaded ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-10 opacity-0'
            }`}>
              <img src={menu} alt="Niños aprendiendo" className="rounded-lg shadow-xl w-full transform hover:scale-105 transition-transform duration-500 hover-lift animate-float" />
            </div>
            
            <div className={`w-full md:w-1/2 bg-white p-8 rounded-xl shadow-lg transition-all duration-1000 ease-out delay-300 ${
              isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
            }`}>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 mb-6 leading-tight">
                POTENCIANDO EL APRENDIZAJE, UN PASO A LA VEZ
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Bienvenido a Pequeños Genios, una plataforma diseñada para apoyar a niños con TDAH.
                Aquí encontrarás recursos y herramientas para ayudar a tu hijo a desarrollar sus 
                habilidades y alcanzar el máximo potencial.
              </p>
              <button 
                onClick={() => handleNavigate('/register')}
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 font-bold text-lg shadow-lg transform hover:scale-105 hover:shadow-xl border-none cursor-pointer"
              >
                Registrarse Gratis
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 mb-12 transition-all duration-1000 ease-out delay-500 ${
            isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
          }`}>
            ¿Por qué elegir Pequeños Genios?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`bg-[var(--primary-yellow)] p-6 rounded-xl shadow-lg hover:transform hover:scale-105 transition-all duration-500 ease-out hover-lift ${
                  isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
                }`}
                style={{
                  transitionDelay: `${700 + index * 200}ms`
                }}
              >
                <div className="text-4xl mb-4 flex justify-center transform hover:scale-110 transition-transform duration-300">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-purple-800 mb-2 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-700 text-center">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`bg-gradient-to-r from-purple-700 to-blue-600 text-white py-8 transition-all duration-1000 ease-out delay-1000 ${
        isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Pequeños Genios</h3>
              <p className="text-sm">
                Transformando el aprendizaje de niños con TDAH y autismo
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li>Email: vazquez645@gmail.com</li>
                <li>Tel: 5626194930</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Enlaces Útiles</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-[var(--primary-yellow)] transition-colors duration-300">Sobre Nosotros</Link></li>
                <li><Link to="/privacy" className="hover:text-[var(--primary-yellow)] transition-colors duration-300">Política de Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-[var(--primary-yellow)] transition-colors duration-300">Términos y Condiciones</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/hector.vazquezluciano/" className="hover:text-[var(--primary-yellow)] transition-colors duration-300 transform hover:scale-110">Facebook</a>
                <button type="button" className="hover:text-[var(--primary-yellow)] transition-colors duration-300 transform hover:scale-110 text-left">Twitter</button>
                <button type="button" className="hover:text-[var(--primary-yellow)] transition-colors duration-300 transform hover:scale-110 text-left">Instagram</button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p>&copy; 2024 Pequeños Genios. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;