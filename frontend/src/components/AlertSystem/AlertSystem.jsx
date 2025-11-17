import React from 'react';
import { useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';
import styles from './AlertSystem.module.css';

const AlertComponent = ({ alert, onClose }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`${styles.alert} ${styles[`alert-${alert.type}`]}`}>
      <span className={styles.icon}>{icons[alert.type]}</span>
      <p className={styles.message}>{alert.message}</p>
      <button 
        className={styles.closeBtn}
        onClick={() => onClose(alert.id)}
        aria-label="Cerrar alerta"
      >
        ✕
      </button>
    </div>
  );
};

const ConfirmDialog = ({ dialog }) => {
  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmDialog}>
        <h2 className={styles.confirmTitle}>{dialog.title}</h2>
        <p className={styles.confirmMessage}>{dialog.message}</p>
        <div className={styles.confirmButtons}>
          <button 
            className={`${styles.btn} ${styles.btnCancel}`}
            onClick={dialog.onCancel}
          >
            Cancelar
          </button>
          <button 
            className={`${styles.btn} ${styles.btnConfirm}`}
            onClick={dialog.onConfirm}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export const AlertSystem = () => {
  const { alerts, hideAlert, confirmDialog } = useContext(AlertContext);

  return (
    <>
      <div className={styles.alertsContainer}>
        {alerts.map(alert => (
          <AlertComponent 
            key={alert.id} 
            alert={alert} 
            onClose={hideAlert}
          />
        ))}
      </div>
      
      {confirmDialog && <ConfirmDialog dialog={confirmDialog} />}
    </>
  );
};
