// ModalAdd.jsx

import React from 'react';
import styles from './ModalAdd.module.css'; // Usaremos un nuevo archivo CSS

/**
 * Componente genérico de ventana modal.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla si el modal es visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {string} props.title - Título del modal.
 * @param {React.ReactNode} props.children - Contenido del formulario dentro del modal.
 */
export default function ModalAdd({ isOpen, onClose, title, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div 
                className={styles.modalContent} 
                // Detiene la propagación para que el clic dentro no cierre el modal
                onClick={(e) => e.stopPropagation()} 
            >
                <div className={styles.modalHeader}>
                    <h4 className={styles.modalTitle}>{title}</h4>
                    <button className={styles.closeButton} onClick={onClose}>
                        &times; {/* Entidad HTML para la 'x' */}
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
}