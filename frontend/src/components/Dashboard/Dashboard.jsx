import React, { useState, useEffect, useCallback } from 'react'; // 👈 Se añadió 'useCallback'
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Manejar el Logout con useCallback
  const handleLogout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    
    // Redirigir al login
    navigate('/login');
  }, [navigate]); // Dependencia: navigate

  // 2. Manejar la Carga de Información del Usuario con useCallback
  const loadUserInfo = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    
    // 🚨 1. VERIFICACIÓN CRÍTICA: Si no hay token, forzar logout/redirección.
    if (!token) {
        console.error("Token de acceso no encontrado. Redirigiendo a login.");
        setLoading(false);
        handleLogout(); // Usamos la función memoizada para salir
        return; 
    }

    try {
      // 💥 USO DE LA NUEVA RUTA EFICIENTE /me/
      const response = await fetch('http://localhost:8000/api/personal/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const currentUser = await response.json();
        setUserInfo(currentUser);
        // 💾 Guardar información para que RoleProtectedRoute la use rápidamente
        localStorage.setItem('user_info', JSON.stringify(currentUser)); 
      } else if (response.status === 401) {
        // 🚨 2. MANEJO DE 401: Token inválido/expirado
        console.error('Token expirado o inválido. Redirigiendo al login.');
        handleLogout(); // Usamos la función memoizada para salir
      } else {
        // 3. Fallo en la API (usar info básica del token como fallback)
        console.warn(`Fallo al obtener info de personal (HTTP ${response.status}). Usando datos del token.`);
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fallbackInfo = {
          nombre: payload.first_name || 'Usuario',
          apellido: payload.last_name || '',
          username: payload.username,
          user: payload.user_id,
        };
        setUserInfo(fallbackInfo);
        // Guardar la info básica también, aunque es menos útil
        localStorage.setItem('user_info', JSON.stringify(fallbackInfo)); 
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]); // Dependencia: handleLogout

  // 3. useEffect corregido: se llama solo cuando loadUserInfo cambie (lo cual es raro gracias a useCallback)
  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]); // 👈 Se añadió 'loadUserInfo'

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // ⚠️ 4. USO SEGURO DE PROPIEDADES (Se asume que userInfo existe después de `if (loading)`)
  // Si usaste el fallback, puesto_info no existirá, por eso es importante el encadenamiento opcional.
  
  // Extraemos el rol para el botón de control de acceso
  const userRole = userInfo?.puesto_info?.nombre_puesto; 
  


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
          <p><strong>Usuario:</strong> {userInfo?.nombre}</p> {/* 👈 Uso seguro */}
          <p><strong>Puesto:</strong> {userRole || 'N/A'}</p> {/* 👈 Uso seguro de userRole */}
    
          {userInfo?.email && (
            <p><strong>Email:</strong> {userInfo.email}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;