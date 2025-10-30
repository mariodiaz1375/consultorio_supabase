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

        const trimmedInputName = inputName.trim();
        const lowerCaseInputName = trimmedInputName.toLowerCase(); // Convertir a minúscula
        
        if (!trimmedInputName) {
            setError("El nombre es obligatorio.");
            return;
        }

        const isDuplicate = list.some(item => {
            // Obtenemos el nombre existente, lo limpiamos y lo ponemos en minúsculas para la comparación.
            const existingName = item[nameField].toString().trim().toLowerCase(); 

            if (existingName === lowerCaseInputName) {
                // Si estamos editando, solo es un duplicado si es un elemento DIFERENTE al que estamos editando.
                if (isEditing) {
                    return item[idField] !== editId;
                }
                
                // Si estamos agregando, cualquier coincidencia es un duplicado.
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
        
        // Reset state
        setEditId(null);
        setInputName('');
        setIsEditing(false);
        setError('');
    };

    const handleDeleteConfirmation = (id, name) => {
        // Usamos window.confirm() para mostrar el diálogo.
        // Si el usuario presiona 'Aceptar', confirm() devuelve true.
        const isConfirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar "${name}" (ID: ${id})?\n\n¡Esta acción es irreversible y podría generar errores si el elemento está en uso por un paciente!`
        );

        if (isConfirmed) {
            // Si el usuario confirma, llamamos a la prop onDelete.
            onDelete(id);
        }
        // Si no confirma, no hacemos nada.
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setInputName('');
        setIsEditing(false);
        setError('');
    };
    const handleInputChange = (e) => {
        const value = e.target.value;
        
        // 1. Definir la Expresión Regular:
        // /^[a-zA-Z0-9.\-]*$/
        // ^: Inicio de la cadena
        // [a-zA-Z0-9.\-]: Coincide con letras (mayúsculas/minúsculas), números, punto y guion.
        // *: Cero o más ocurrencias del patrón.
        // $: Fin de la cadena
        const regex = /^[a-zA-Z0-9.\- ñÑáéíóúüÁÉÍÓÚÜ]*$/; // NOTA: Agregué un espacio " " para permitir espacios entre palabras.
        
        // 2. Aplicar la restricción
        if (regex.test(value)) {
            // Si el valor es válido, actualiza el estado y borra errores
            setInputName(value);
            setError(''); 
        } else {
            // Opcional: Mostrar un mensaje si el usuario intenta ingresar un carácter no permitido.
            // setError("Solo se permiten letras, números, guiones, puntos y espacios.");
        }
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
                    onChange={handleInputChange}
                    placeholder={`Ingrese el nombre`}
                    maxLength={40}
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
                <button type="button" onClick={handleSave} className={styles['manager-action-btn']}> 
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
                            onClick={() => handleDeleteConfirmation(item[idField], item[nameField])}
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