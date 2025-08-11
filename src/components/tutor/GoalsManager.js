import React, { useState } from 'react';
import { 
  FaBullseye, 
  FaPlus, 
  FaCheck, 
  FaClock, 
  FaStar,
  FaTrophy,
  FaEdit,
  FaTrash,
  FaCalendarCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const GoalsManager = ({ perfilNino, profileId }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'daily',
    category: 'activities',
    target: 5,
    reward: 100,
    endDate: ''
  });

  // Metas predeterminadas (en un proyecto real vendrían de Firebase)
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Completar 5 actividades diarias',
      description: 'Realizar al menos 5 actividades educativas cada día',
      type: 'daily',
      category: 'activities',
      target: 5,
      current: 3,
      reward: 50,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
      completed: false
    },
    {
      id: 2,
      title: 'Racha de 7 días',
      description: 'Mantener una racha de actividad por una semana completa',
      type: 'streak',
      category: 'consistency',
      target: 7,
      current: perfilNino?.racha || 0,
      reward: 200,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
      completed: false
    },
    {
      id: 3,
      title: 'Obtener 1000 puntos',
      description: 'Acumular 1000 puntos en total',
      type: 'points',
      category: 'achievements',
      target: 1000,
      current: perfilNino?.puntosTotales || 0,
      reward: 300,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
      completed: (perfilNino?.puntosTotales || 0) >= 1000
    }
  ]);

  const goalTypes = [
    { id: 'daily', name: 'Objetivo Diario', icon: '📅' },
    { id: 'weekly', name: 'Objetivo Semanal', icon: '📆' },
    { id: 'monthly', name: 'Objetivo Mensual', icon: '🗓️' },
    { id: 'streak', name: 'Racha', icon: '🔥' },
    { id: 'points', name: 'Puntos', icon: '💰' }
  ];

  const goalCategories = [
    { id: 'activities', name: 'Actividades', icon: '📚' },
    { id: 'games', name: 'Juegos', icon: '🎮' },
    { id: 'consistency', name: 'Consistencia', icon: '⭐' },
    { id: 'achievements', name: 'Logros', icon: '🏆' },
    { id: 'time', name: 'Tiempo', icon: '⏰' }
  ];

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const goal = {
      ...newGoal,
      id: Date.now(),
      current: 0,
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      completed: false
    };

    setGoals([...goals, goal]);
    toast.success('Meta creada exitosamente');
    setShowAddGoal(false);
    setNewGoal({
      title: '',
      description: '',
      type: 'daily',
      category: 'activities',
      target: 5,
      reward: 100,
      endDate: ''
    });
  };

  const toggleGoalActive = (goalId) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, active: !goal.active }
        : goal
    ));
    toast.success('Meta actualizada');
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast.success('Meta eliminada');
  };

  const getProgressPercentage = (goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getTypeInfo = (type) => {
    return goalTypes.find(t => t.id === type) || goalTypes[0];
  };

  const getCategoryInfo = (category) => {
    return goalCategories.find(c => c.id === category) || goalCategories[0];
  };

  const GoalCard = ({ goal }) => {
    const progress = getProgressPercentage(goal);
    const typeInfo = getTypeInfo(goal.type);
    const categoryInfo = getCategoryInfo(goal.category);
    const daysRemaining = getDaysRemaining(goal.endDate);

    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
        goal.completed 
          ? 'border-green-200 bg-green-50' 
          : goal.active 
            ? 'border-blue-200 hover:shadow-md' 
            : 'border-gray-200 opacity-60'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${goal.completed ? 'bg-green-100' : 'bg-blue-50'}`}>
                <span className="text-xl">{categoryInfo.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {goal.completed && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  ✅ Completado
                </div>
              )}
              <button
                onClick={() => toggleGoalActive(goal.id)}
                className={`p-2 rounded-lg transition-colors ${
                  goal.active 
                    ? 'text-blue-600 hover:bg-blue-50' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <FaClock />
              </button>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>{goal.current} de {goal.target}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  goal.completed ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>{typeInfo.icon} {typeInfo.name}</span>
              {daysRemaining > 0 && (
                <span>📅 {daysRemaining} días restantes</span>
              )}
            </div>
            <div className="flex items-center text-orange-600">
              <FaStar className="mr-1" />
              <span>{goal.reward} puntos</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const GoalStats = () => {
    const activeGoals = goals.filter(g => g.active);
    const completedGoals = goals.filter(g => g.completed);
    const totalRewards = completedGoals.reduce((sum, goal) => sum + goal.reward, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Metas Activas</h3>
              <p className="text-2xl font-bold text-blue-700">{activeGoals.length}</p>
            </div>
            <FaBullseye className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Metas Completadas</h3>
              <p className="text-2xl font-bold text-green-700">{completedGoals.length}</p>
            </div>
            <FaCheck className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-900">Recompensas Ganadas</h3>
              <p className="text-2xl font-bold text-orange-700">{totalRewards}</p>
            </div>
            <FaTrophy className="text-orange-500 text-2xl" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metas y Objetivos</h2>
          <p className="text-gray-600 mt-1">Establece objetivos para motivar a {perfilNino?.fullName}</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          Nueva Meta
        </button>
      </div>

      <GoalStats />

      {/* Lista de metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {/* Modal para agregar meta */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Crear Nueva Meta</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la Meta
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="Ej: Completar 5 actividades diarias"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe el objetivo..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tipo y categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {goalTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {goalCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objetivo y recompensa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo (cantidad)
                  </label>
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value)})}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recompensa (puntos)
                  </label>
                  <input
                    type="number"
                    value={newGoal.reward}
                    onChange={(e) => setNewGoal({...newGoal, reward: parseInt(e.target.value)})}
                    min="10"
                    step="10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Límite (opcional)
                </label>
                <input
                  type="date"
                  value={newGoal.endDate}
                  onChange={(e) => setNewGoal({...newGoal, endDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsManager;
