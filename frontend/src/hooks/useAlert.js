import { useContext } from 'react';
import { AlertContext } from '../context/AlertContext';

export const useAlert = () => {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de AlertProvider');
  }

  return {
    showAlert: (message, type = 'info', duration = 3000) => {
      context.showAlert(message, type, duration);
    },
    showSuccess: (message, duration = 3000) => {
      context.showAlert(message, 'success', duration);
    },
    showError: (message, duration = 4000) => {
      context.showAlert(message, 'error', duration);
    },
    showWarning: (message, duration = 3500) => {
      context.showAlert(message, 'warning', duration);
    },
    showInfo: (message, duration = 3000) => {
      context.showAlert(message, 'info', duration);
    }
  };
};
