import React, { useState, useEffect, useCallback } from 'react'; // Importar useCallback
import { useNavigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  // 💥 FUNCIÓN CORREGIDA: Toda la lógica de verificación está aquí dentro
  const checkAccess = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const userInfoJson = localStorage.getItem('user_info');
    
    // 1. Verificar Autenticación (Token)
    if (!token || !userInfoJson) {
      // Si no hay token, redirigir a login
      setHasAccess(false);
      setLoading(false);
      navigate('/login');
      return;
    }
    
    try {
      const userInfo = JSON.parse(userInfoJson);
      
      // 2. Obtener el Rol (nombre del puesto)
      const role = userInfo.puesto_info?.nombre_puesto?.toUpperCase() || 'SIN ROL';
      setUserRole(role);

      // 3. Verificar si el Rol está permitido
      // Si no se especifican roles (allowedRoles.length === 0), se permite el acceso por defecto.
      const isRoleAllowed = allowedRoles.length === 0 || 
                            allowedRoles.some(allowedRole => allowedRole.toUpperCase() === role);

      setHasAccess(isRoleAllowed);

    } catch (e) {
      console.error('Error al parsear user_info de localStorage:', e);
      setHasAccess(false);
    } finally {
      // 4. Se usa 'finally' para asegurar que loading se ponga en false
      setLoading(false);
    }

  }, [allowedRoles, navigate]); // Cierre correcto de useCallback con sus dependencias

  useEffect(() => {
    checkAccess();
    
    // Función de limpieza
    return () => setLoading(false);
  }, [checkAccess]); // Dependencia de la función memoizada

  // -------------------------------------------------------------
  // Renderizado
  // -------------------------------------------------------------

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e1e5e9',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verificando permisos...</p>
      </div>
    );
  }

  // 4. Redirigir si no tiene acceso
  if (!hasAccess) {
    // Si no está autorizado, mostrar mensaje
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2>🚫 Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
        <p><strong>Tu rol actual:</strong> {userRole}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  // 5. Permitir el acceso
  return children;
};

export default RoleProtectedRoute;