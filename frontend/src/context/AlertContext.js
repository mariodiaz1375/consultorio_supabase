import React, { createContext, useState, useCallback } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showAlert = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const newAlert = { id, message, type };
    
    setAlerts(prev => [...prev, newAlert]);

    if (duration > 0) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
      }, duration);
    }
  }, []);

  const hideAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const showConfirm = useCallback((message, title = 'Confirmar', callback) => {
    setConfirmDialog({
      message,
      title,
      onConfirm: () => {
        callback(true);
        setConfirmDialog(null);
      },
      onCancel: () => {
        callback(false);
        setConfirmDialog(null);
      }
    });
  }, []);

  const value = {
    showAlert,
    hideAlert,
    showConfirm,
    alerts,
    confirmDialog
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
