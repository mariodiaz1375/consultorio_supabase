import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../hooks/useAlert';
import LiquidEther from './LiquidEther'; // Importar el componente
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useAlert();

  useEffect(() => {
    setShowBackground(true);
  }, []);


  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación manual de campos vacíos
    if (!credentials.username.trim()) {
      showWarning('Por favor ingrese su usuario');
      return;
    }
    
    if (!credentials.password.trim()) {
      showWarning('Por favor ingrese su contraseña');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/personal/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar tokens en localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Obtener información del usuario
        await getUserInfo(data.access);
        
        // Mostrar alerta de éxito
        showSuccess('¡Inicio de sesión exitoso!', 2000);
        
        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        // Manejar diferentes tipos de error con alertas personalizadas
        if (response.status === 401) {
          showError('Usuario o contraseña incorrectos');
        } else {
          showError(data.detail || 'Error en el inicio de sesión');
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      showError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/personal/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        localStorage.setItem('user_info', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.log('No se pudo obtener información del usuario');
    }
  };

  return (
    <div className="login-container">
      {/* Fondo Fluido */}
      {showBackground && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 0 
        }}>
          <LiquidEther
            colors={['#5227FF', '#FF9FFC', '#B19EEF']}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>
      )}
      
      <div className="login-card">
        <div className="login-header">
          <img src="/copia.png" alt="Logo Consultorio Manjón" className="login-logo" />
          <h1>Consultorio Manjón</h1>
          <p>Sistema de Gestión</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Ingrese su usuario"
              value={credentials.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Ingrese su contraseña"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>¿Olvidaste tu contraseña? <a href="/forgot-password">Recuperar</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
