import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Login.css';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/personal/auth/password-reset-confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          ...passwords
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Contraseña actualizada exitosamente. Redirigiendo...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorMsg = data.confirm_password?.[0] || 
                        data.token?.[0] || 
                        data.uid?.[0] || 
                        'Error al actualizar la contraseña';
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/copia.png" alt="Logo Consultorio Manjón" className="login-logo" />
          <h1>Nueva Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>
        
        {message && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#16a34a',
            padding: '14px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="new_password">Nueva Contraseña</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              placeholder="Mínimo 6 caracteres"
              value={passwords.new_password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm_password">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              placeholder="Repite tu contraseña"
              value={passwords.confirm_password}
              onChange={handleChange}
              disabled={loading}
              required
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
                Actualizando...
              </>
            ) : (
              'Actualizar Contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;