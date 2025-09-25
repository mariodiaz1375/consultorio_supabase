import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Intentar obtener info del usuario desde la API
      const response = await fetch('http://localhost:8000/api/personal/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Buscar el personal que corresponde al usuario actual
        const currentUser = data.find(person => person.user === getCurrentUserId(token));
        setUserInfo(currentUser);
      } else {
        // Si falla, usar info básica del token
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          nombre: payload.first_name || 'Usuario',
          apellido: payload.last_name || '',
          username: payload.username
        });
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id;
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    
    // Redirigir al login
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Consultorio Odontológico</h1>
          <div className="user-info">
            <span>Bienvenido/a, {userInfo?.nombre} {userInfo?.apellido}</span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          
          {/* Tarjeta Pacientes */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>👥 Pacientes</h3>
            </div>
            <div className="card-content">
              <p>Gestión de pacientes del consultorio</p>
              <button 
                className="card-button"
                onClick={() => navigate('/pacientes')}
              >
                Ver Pacientes
              </button>
            </div>
          </div>

          {/* Tarjeta Turnos */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>📅 Turnos</h3>
            </div>
            <div className="card-content">
              <p>Programación y gestión de citas</p>
              <button 
                className="card-button"
                onClick={() => navigate('/turnos')}
              >
                Ver Turnos
              </button>
            </div>
          </div>

          {/* Tarjeta Historias Clínicas */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>📋 Historias Clínicas</h3>
            </div>
            <div className="card-content">
              <p>Registros médicos y tratamientos</p>
              <button 
                className="card-button"
                onClick={() => navigate('/historias')}
              >
                Ver Historias
              </button>
            </div>
          </div>

          {/* Tarjeta Personal */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>👨‍⚕️ Personal</h3>
            </div>
            <div className="card-content">
              <p>Gestión del personal médico</p>
              <button 
                className="card-button"
                onClick={() => navigate('/personal')}
              >
                Ver Personal
              </button>
            </div>
          </div>

        </div>

        {/* Información del usuario actual */}
        <div className="user-details">
          <h4>Información de sesión:</h4>
          <p><strong>Usuario:</strong> {userInfo?.username}</p>
          {userInfo?.puesto && (
            <p><strong>Puesto:</strong> {userInfo.puesto.nombre_puesto}</p>
          )}
          {userInfo?.email && (
            <p><strong>Email:</strong> {userInfo.email}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;