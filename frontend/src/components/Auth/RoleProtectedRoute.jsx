import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles = [], requirePermission = null }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkUserPermissions();
  }, []);

  const checkUserPermissions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Obtener información del personal actual
      const response = await fetch('http://localhost:8000/api/personal/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const personalData = await response.json();
        const currentUserId = getCurrentUserId(token);
        const currentPersonal = personalData.find(person => person.user === currentUserId);

        if (currentPersonal) {
          const role = currentPersonal.puesto.nombre_puesto.toLowerCase();
          setUserRole(role);

          // Verificar si el rol está permitido
          const roleAllowed = allowedRoles.length === 0 || 
                             allowedRoles.some(allowedRole => 
                               role.includes(allowedRole.toLowerCase())
                             );

          // Verificar permisos específicos si se requieren
          let permissionAllowed = true;
          if (requirePermission) {
            permissionAllowed = await checkSpecificPermission(token, requirePermission);
          }

          setHasAccess(roleAllowed && permissionAllowed);
        } else {
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setHasAccess(false);
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

  const checkSpecificPermission = async (token, permission) => {
    try {
      // Aquí puedes hacer una llamada a un endpoint que verifique permisos específicos
      // Por ahora, usamos la lógica básica de roles
      return true;
    } catch {
      return false;
    }
  };

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

  if (!hasAccess) {
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
          onClick={() => window.history.back()}
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
          Volver Atrás
        </button>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;