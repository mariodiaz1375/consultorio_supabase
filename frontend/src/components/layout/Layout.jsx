import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import { useConfirm } from '../../hooks/useConfirm';
import { useAlert } from '../../hooks/useAlert';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { showConfirm } = useConfirm();
  const { showSuccess } = useAlert();

  const handleLogout = async () => {
    // Mostrar diálogo de confirmación
    const confirmed = await showConfirm(
      '¿Estás seguro que deseas cerrar sesión?',
      'Cerrar Sesión'
    );

    if (confirmed) {
      // Limpiar localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      
      // Mostrar alerta de éxito
      showSuccess('Sesión cerrada correctamente', 2000);
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        navigate('/login');
      }, 500);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar onLogout={handleLogout} />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default Layout;