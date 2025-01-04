import React, { useState, useEffect } from 'react';
import { FaBook, FaPuzzlePiece, FaBrain, FaComments } from 'react-icons/fa';

function Actividades({ perfilNino }) {
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [filtroActual, setFiltroActual] = useState('todas');

    // Categorías de actividades
    const categorias = [
        { 
            id: 'todas', 
            nombre: 'Todas', 
            icono: <FaBook />, 
            color: 'bg-blue-500' 
        },
        { 
            id: 'cognitivas', 
            nombre: 'Cognitivas', 
            icono: <FaBrain />, 
            color: 'bg-purple-500' 
        },
        { 
            id: 'comunicacion', 
            nombre: 'Comunicación', 
            icono: <FaComments />, 
            color: 'bg-green-500' 
        },
        { 
            id: 'habilidades', 
            nombre: 'Habilidades', 
            icono: <FaPuzzlePiece />, 
            color: 'bg-orange-500' 
        }
    ];

    // Lista de actividades (esto luego vendrá de Firebase)
    const actividades = [
        {
            id: 1,
            titulo: "Memoria Secuencial",
            descripcion: "Ejercita tu memoria con secuencias de imágenes",
            categoria: "cognitivas",
            nivel: "basico",
            duracion: "10 min",
            puntos: 100,
            progreso: 0,
            imagen: "🧠"
        },
        // Aquí añadiremos más actividades...
    ];

    return (
        <div className="space-y-6">
            {/* Filtros de categorías */}
            <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-bold mb-4">Categorías</h3>
                <div className="flex space-x-4">
                    {categorias.map((categoria) => (
                        <button
                            key={categoria.id}
                            onClick={() => setFiltroActual(categoria.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                filtroActual === categoria.id
                                    ? `${categoria.color} text-white`
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            <span className="text-lg">{categoria.icono}</span>
                            <span>{categoria.nombre}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de actividades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actividades.map((actividad) => (
                    <div
                        key={actividad.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className={`h-32 flex items-center justify-center text-6xl bg-gray-50`}>
                            {actividad.imagen}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-bold mb-2">{actividad.titulo}</h3>
                            <p className="text-gray-600 text-sm mb-4">{actividad.descripcion}</p>
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    <span>⏱️ {actividad.duracion}</span>
                                    <span className="ml-4">⭐ {actividad.puntos} pts</span>
                                </div>
                                <button className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90">
                                    Comenzar
                                </button>
                            </div>
                        </div>
                        {/* Barra de progreso */}
                        <div className="h-1 bg-gray-200">
                            <div 
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${actividad.progreso}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Actividades;