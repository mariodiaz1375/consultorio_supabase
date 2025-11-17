import { useContext } from 'react';
import { AlertContext } from '../context/AlertContext';

export const useConfirm = () => {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error('useConfirm debe ser usado dentro de AlertProvider');
  }

  return {
    showConfirm: (message, title = 'Confirmar') => {
      return new Promise((resolve) => {
        context.showConfirm(message, title, (confirmed) => {
          resolve(confirmed);
        });
      });
    }
  };
};
