import { useState, useEffect } from 'react';
import styles from '../pacientesForm/PacientesForm.module.css';


const ListManagerContent = ({ 
    list, 
    idField = 'id', // Campo ID, por defecto 'id'
    nameField, // Campo del nombre (ej: 'nombre_os')
    onAdd, 
    onEdit, 
    onDelete,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [inputName, setInputName] = useState('');
    const [error, setError] = useState('');

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
        e.preventDefault();
        if (!inputName.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }

        if (isEditing) {
            onEdit(editId, inputName.trim());
        } else {
            onAdd(inputName.trim());
        }
        
        // Reset state
        setEditId(null);
        setInputName('');
        setIsEditing(false);
        setError('');
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setInputName('');
        setIsEditing(false);
        setError('');
    };

    return (
        <div className={styles['list-manager-container']}>
            {/* 🚨 AQUÍ EL CAMBIO: Usamos <div> en lugar de <form> */}
            <div className={styles['manager-form-container']}> 
                <label htmlFor="manager-input">{isEditing ? `Editar ID ${editId}` : "Nuevo Elemento"}</label>
                <input
                    id="manager-input"
                    type="text"
                    value={inputName}
                    onChange={(e) => {setInputName(e.target.value); setError('');}}
                    placeholder={`Ingrese el nombre o descripción`}
                    // Opcional: Para permitir guardar con Enter incluso sin form
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); 
                            handleSave(); 
                        }
                    }}
                    required
                />
                {error && <p className={styles['error-message']}>{error}</p>}
                {/* El botón llama directamente a handleSave */}
                <button type="button" onClick={handleSave}> 
                    {isEditing ? "Guardar Cambios" : "Agregar a la Lista"}
                </button>
                {isEditing && (
                    <button 
                        type="button" 
                        onClick={handleCancelEdit} 
                        className={styles['modal-cancel-btn']}
                        style={{marginTop: '10px'}}
                    >
                        Cancelar Edición
                    </button>
                )}
            </div>

            <h5 style={{marginTop: '20px', paddingBottom: '5px', borderBottom: '1px solid #ddd'}}>Lista Existente:</h5>
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
                            onClick={() => onDelete(item[idField])}
                            className={styles['delete-btn']}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ))}
            {list.length === 0 && <p style={{color: '#999', fontSize: '0.9rem'}}>No hay elementos en la lista.</p>}
        </div>
    );
};

export default ListManagerContent;