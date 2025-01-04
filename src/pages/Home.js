import React from 'react';
import { Link } from 'react-router-dom';
import banner from '../assets/images/banner.jpeg';
import menu from '../assets/images/menu.jpeg';

function Home() {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-[var(--primary-blue)] p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={banner} alt="Pequeños Genios" className="h-12" />
            <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
          </Link>
        </div>
        <div>
          <Link to="/login" className="text-white mx-4 hover:text-[var(--primary-yellow)]">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="bg-[var(--interactive-orange)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="bg-[var(--primary-yellow)] py-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <img src={menu} alt="Niños aprendiendo" className="rounded-lg shadow-xl w-full" />
            </div>
            
            <div className="w-full md:w-1/2 bg-white p-8 rounded-xl shadow-lg">
              <h1 className="text-4xl font-bold text-[var(--primary-blue)] mb-6 leading-tight">
                POTENCIANDO EL APRENDIZAJE, UN PASO A LA VEZ
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Bienvenido a Pequeños Genios, una plataforma diseñada para apoyar a niños con TDAH.
                Aquí encontrarás recursos y herramientas para ayudar a tu hijo a desarrollar sus 
                habilidades y alcanzar el máximo potencial.
              </p>
              <Link 
                to="/register" 
                className="inline-block bg-[var(--primary-blue)] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-all font-bold text-lg shadow-md"
              >
                Registrarse Gratis
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[var(--primary-blue)] mb-12">
            ¿Por qué elegir Pequeños Genios?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-[var(--primary-yellow)] p-6 rounded-xl shadow-lg hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4 flex justify-center">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-[var(--primary-blue)] mb-2 text-center">
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
      <footer className="bg-[var(--primary-blue)] text-white py-8">
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
                <li><Link to="/about" className="hover:text-[var(--primary-yellow)]">Sobre Nosotros</Link></li>
                <li><Link to="/privacy" className="hover:text-[var(--primary-yellow)]">Política de Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-[var(--primary-yellow)]">Términos y Condiciones</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/hector.vazquezluciano/" className="hover:text-[var(--primary-yellow)]">Facebook</a>
                <a href="#" className="hover:text-[var(--primary-yellow)]">Twitter</a>
                <a href="#" className="hover:text-[var(--primary-yellow)]">Instagram</a>
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