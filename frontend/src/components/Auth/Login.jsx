import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../hooks/useAlert';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useAlert();

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
      <div className="login-card">
        <div className="login-header">
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
        
        {/* <div className="login-footer">
          <p>¿Olvidaste tu contraseña? <a href="#forgot">Recuperar</a></p>
          <small>
            Credenciales por defecto: <br/>
            Usuario: nombre.apellido | Contraseña: DNI
          </small>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
