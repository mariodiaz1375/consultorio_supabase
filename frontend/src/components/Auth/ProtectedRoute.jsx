import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Verificar si existe token de acceso
  const token = localStorage.getItem('access_token');
  
  // Función para verificar si el token no ha expirado
  const isTokenValid = () => {
    if (!token) return false;
    
    try {
      // Decodificar el payload del JWT (sin verificar firma, solo para obtener exp)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000; // Convertir a segundos
      
      // Verificar si el token no ha expirado
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token inválido:', error);
      return false;
    }
  };

  // Si no hay token válido, redirigir al login
  if (!token || !isTokenValid()) {
    // Limpiar tokens inválidos
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    
    return <Navigate to="/login" replace />;
  }

  // Si hay token válido, mostrar el componente protegido
  return children;
};

export default ProtectedRoute;