import { useState, useEffect } from 'react';
import { useConfirm } from '../../hooks/useConfirm'; // Ajusta la ruta según tu estructura
import styles from './ListManagerContent.module.css';

const ListManagerContent = ({ 
    list, 
    idField = 'id',
    nameField,
    onAdd, 
    onEdit, 
    onDelete,
    placeHolder,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [inputName, setInputName] = useState('');
    const [error, setError] = useState('');
    
    // Solo usar el confirm, NO las alertas
    const { showConfirm } = useConfirm();

    useEffect(() => {
        if (editId) {
            const itemToEdit = list.find(item => item[idField] === editId);
            if (itemToEdit) {
                setInputName(itemToEdit[nameField]);
                setIsEditing(true);
            }
        } else {
            setInputName('');
            setIsEditing(false);
        }
    }, [editId, list, idField, nameField]);

    const handleEditStart = (item) => {
        setEditId(item[idField]);
    };

    const handleSave = (e) => {
        if (e) e.preventDefault();

        const trimmedInputName = inputName.trim();
        const lowerCaseInputName = trimmedInputName.toLowerCase();
        
        if (!trimmedInputName) {
            setError("El nombre es obligatorio.");
            return;
        }

        const isDuplicate = list.some(item => {
            const existingName = item[nameField].toString().trim().toLowerCase(); 

            if (existingName === lowerCaseInputName) {
                if (isEditing) {
                    return item[idField] !== editId;
                }
                return true; 
            }
            return false;
        });

        if (isDuplicate) {
            setError(`El nombre "${trimmedInputName}" ya existe en la lista. No se permiten duplicados.`);
            return;
        }

        if (isEditing) {
            onEdit(editId, inputName.trim());
        } else {
            onAdd(inputName.trim());
        }
        
        setEditId(null);
        setInputName('');
        setIsEditing(false);
        setError('');
    };

    // Solo maneja la confirmación, la alerta de éxito viene del padre
    const handleDeleteConfirmation = async (id, name) => {
        const isConfirmed = await showConfirm(
            `¿Estás seguro de que deseas eliminar "${name}"? Esta acción es irreversible y podría generar errores si el elemento está en uso.`,
            'Confirmar Eliminación'
        );

        if (isConfirmed) {
            onDelete(id); // El padre mostrará la alerta de éxito
        }
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setInputName('');
        setIsEditing(false);
        setError('');
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z0-9.\-\: ñÑáéíóúüÁÉÍÓÚÜ]*$/;
        
        if (regex.test(value)) {
            setInputName(value);
            setError(''); 
        }
    };

    return (
        <div className={styles['list-manager-container']}>
            <div className={styles['manager-form-container']}> 
                <label htmlFor="manager-input">
                    {isEditing ? `Editar ID ${editId}` : "Nuevo Elemento"}
                </label>
                <input
                    id="manager-input"
                    type="text"
                    value={inputName}
                    onChange={handleInputChange}
                    placeholder={placeHolder}
                    maxLength={40}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); 
                            handleSave(); 
                        }
                    }}
                />
                {error && <p className={styles['error-message']}>{error}</p>}
                
                <button 
                    type="button" 
                    onClick={handleSave} 
                    className={styles['manager-action-btn']}
                > 
                    {isEditing ? "Guardar Cambios" : "Agregar a la Lista"}
                </button>
                
                {isEditing && (
                    <button 
                        type="button" 
                        onClick={handleCancelEdit} 
                        className={styles['modal-cancel-btn']}
                    >
                        Cancelar Edición
                    </button>
                )}
            </div>

            <h5 style={{
                marginTop: '20px', 
                paddingBottom: '8px', 
                borderBottom: '2px solid #27ae60',
                color: '#2c3e50',
                fontSize: '1rem'
            }}>
                Lista Existente
            </h5>
            
            {list.map(item => (
                <div key={item[idField]} className={styles['list-manager-item']}>
                    <span className={styles['item-name']}>{item[nameField]}</span>
                    <div className={styles['item-actions']}>
                        <button 
                            type="button" 
                            onClick={() => handleEditStart(item)}
                            className={styles['edit-btn']}
                        >
                            Editar
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleDeleteConfirmation(item[idField], item[nameField])}
                            className={styles['delete-btn']}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ))}
            
            {list.length === 0 && (
                <p style={{
                    color: '#999', 
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    padding: '20px',
                    fontStyle: 'italic'
                }}>
                    No hay elementos en la lista.
                </p>
            )}
        </div>
    );
};

export default ListManagerContent;