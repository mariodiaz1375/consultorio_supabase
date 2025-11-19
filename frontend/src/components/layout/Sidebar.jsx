import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const userInfoJson = localStorage.getItem('user_info');
    if (userInfoJson) {
      setUserInfo(JSON.parse(userInfoJson));
    }
  }, []);

  const userRole = userInfo?.puesto_info?.nombre_puesto;
  const isAdmin = userRole === 'Admin';

  const menuItems = [
    {
      path: '/dashboard',
      icon: '🏠',
      label: 'Inicio',
      roles: ['Admin', 'Secretario/a', 'Odontólogo/a']
    },
    {
      path: '/perfil',
      icon: '👤',
      label: 'Mi Perfil',
      roles: ['Admin', 'Secretario/a', 'Odontólogo/a']
    },
    {
      path: '/pacientes',
      icon: '👥',
      label: 'Pacientes',
      roles: ['Admin', 'Secretario/a', 'Odontólogo/a']
    },
    {
      path: '/turnos',
      icon: '📅',
      label: 'Turnos',
      roles: ['Admin', 'Secretario/a', 'Odontólogo/a']
    },
    {
      path: '/personal',
      icon: '👨‍⚕️',
      label: 'Personal',
      roles: ['Admin']
    }
  ];

  const auditoriaItems = [
    {
      path: '/auditoria_pagos',
      icon: '💰',
      label: 'Auditoría Pagos',
      roles: ['Admin']
    },
    {
      path: '/auditoria_turnos',
      icon: '📋',
      label: 'Auditoría Turnos',
      roles: ['Admin']
    }
  ];

  const hasAccess = (roles) => {
    return roles.includes(userRole);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Cerrar sidebar en móvil
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button className={styles.hamburger} onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay para móvil */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Header del Sidebar */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {/* <span className={styles.logoIcon}>🦷</span> */}
            <img src="/copia.png" alt="Logo" className={styles.logoIcon} />
            <h2>Consultorio Manjón</h2>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {userInfo?.nombre?.charAt(0)}{userInfo?.apellido?.charAt(0)}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>
              {userInfo?.nombre} {userInfo?.apellido}
            </p>
            <span className={styles.userRole}>{userRole}</span>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <h3 className={styles.navTitle}>MENÚ PRINCIPAL</h3>
            {menuItems.map((item) => 
              hasAccess(item.roles) && (
                <button
                  key={item.path}
                  className={`${styles.navItem} ${
                    location.pathname === item.path ? styles.active : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              )
            )}
          </div>

          {/* Sección Auditoría (solo Admin) */}
          {isAdmin && (
            <div className={styles.navSection}>
              <h3 className={styles.navTitle}>AUDITORÍA</h3>
              {auditoriaItems.map((item) => (
                <button
                  key={item.path}
                  className={`${styles.navItem} ${
                    location.pathname === item.path ? styles.active : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Botón Cerrar Sesión */}
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={onLogout}>
            <span className={styles.navIcon}>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;