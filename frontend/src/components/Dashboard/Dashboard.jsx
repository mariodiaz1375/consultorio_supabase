import React, { useState, useEffect, useCallback } from 'react'; // 👈 Se añadió 'useCallback'
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import ModalAdd from '../modalAdd/ModalAdd';
import ListManagerContent from '../listaMaestra/ListManagerContent';
import { 
    // 🚨 FUNCIONES GET AÑADIDAS
    getObrasSociales, createObraSocial, updateObraSocial, deleteObraSocial,
    getAntecedentes, createAntecedente, updateAntecedente, deleteAntecedente,
    getAnalisisFuncional, createAnalisisFuncional, updateAnalisisFuncional, deleteAnalisisFuncional,
    // ... otras funciones si son necesarias
} from '../../api/pacientes.api.js';
import {
  getTratamientos, createTratamiento, updateTratamientos, deleteTratamientos,
} from '../../api/historias.api.js';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isOsModalOpen, setIsOsModalOpen] = useState(false);
  const [isAntecedenteModalOpen, setIsAntecedenteModalOpen] = useState(false);
  const [isAnalisisFuncionalModalOpen, setIsAnalisisFuncionalModalOpen] = useState(false);
  const [isTratModalOpen, setIsTratModalOpen] = useState(false);
  
  const [obrasSociales, setObrasSociales] = useState([]);
  const [antecedentes, setAntecedentes] = useState([]);
  const [analisisFuncional, setAnalisisFuncional] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);

  // 🚨 4. FUNCIÓN PARA CARGAR TODAS LAS LISTAS MAESTRAS
  const loadMasterOptions = useCallback(async () => {
    try {
        const [osList, antList, afList, tratList] = await Promise.all([
            getObrasSociales(),
            getAntecedentes(),
            getAnalisisFuncional(),
            getTratamientos(),
        ]);
        
        // Actualizar estados
        setObrasSociales(osList);
        setAntecedentes(antList);
        setAnalisisFuncional(afList);
        setTratamientos(tratList)
    } catch (error) {
        console.error("Error al cargar las listas maestras:", error);
    }
  }, []);

  const handleManipulateList = async (listType, action, id, newName) => {
    try {
        // Mapeo para estandarizar el nombre del campo que lleva el nombre en la API
        const nameFieldMap = {
            os: 'nombre_os',
            antecedentes: 'nombre_ant',
            analisisFuncional: 'nombre_analisis',
            tratamientos: 'nombre_trat',
        };

        const nameField = nameFieldMap[listType];
        const actionType = `${listType}-${action}`;

        let list;
        let originalName = newName; // Usamos newName por defecto para 'add'
        
        // Determinar qué lista usar
        if (listType === 'os') list = obrasSociales;
        else if (listType === 'antecedentes') list = antecedentes;
        else if (listType === 'analisisFuncional') list = analisisFuncional;
        else if (listType === 'tratamientos') list = tratamientos;
        
        // Si la acción es editar o borrar, buscamos el nombre original
        if (action === 'edit' || action === 'delete') {
            const item = list?.find(item => item.id === id);
            if (item) {
                originalName = item[nameField]; // Guardamos el nombre actual/original
            }
        }
        // El nuevo nombre o descripción se envía como un objeto con el nombre de campo correcto
        const data = { [nameField]: newName };
        const listName = listType === 'os' ? 'Obra Social' : listType === 'antecedentes' ? 'Antecedente' : listType === 'analisisFuncional' ? 'Analisis Funcional' : 'Tratamientos';
        switch (actionType) {
            case 'os-add':
                await createObraSocial(data);
                break;
            case 'os-edit':
                await updateObraSocial(id, data);
                break;
            case 'os-delete':
                await deleteObraSocial(id);
                break;
            
            case 'antecedentes-add':
                await createAntecedente(data);
                break;
            case 'antecedentes-edit':
                await updateAntecedente(id, data);
                break;
            case 'antecedentes-delete':
                await deleteAntecedente(id);
                break;

            case 'analisisFuncional-add':
                await createAnalisisFuncional(data);
                break;
            case 'analisisFuncional-edit':
                await updateAnalisisFuncional(id, data);
                break;
            case 'analisisFuncional-delete':
                await deleteAnalisisFuncional(id);
                break;

            case 'tratamientos-add':
                await createTratamiento(data);
                break;
            case 'tratamientos-edit':
                await updateTratamientos(id, data);
                break;
            case 'tratamientos-delete':
                await deleteTratamientos(id);
                break;

            default:
                console.warn(`Acción desconocida: ${actionType}`);
                return;
        }

        // 🏆 ÉXITO: Recargar las listas para actualizar el ListManagerContent en el modal
        await loadMasterOptions();

        if (action === 'add') {
            alert(`${listName} "${newName}" registrado(a) con éxito.`);
        } else if (action === 'edit') {
            alert(`${listName} "${newName}" (ID: ${id}) editado(a) con éxito.`);
        } else if (action === 'delete') {
            alert(`${listName} "${originalName}" (ID: ${id}) eliminado(a) con éxito.`);
        }
        
    } catch (error) {
        console.error(`Error al ejecutar ${action} en ${listType}:`, error);
        
        let errorMessage = `Ocurrió un error en la operación de ${action} de ${listType}.`;

        // 🚨 MANEJO ESPECÍFICO DEL ERROR DE LLAVE FORÁNEA (RESTRICT)
        // Esto asume que la API de Django/DRF devuelve un error 400 o 409 (Conflict) 
        // con un mensaje específico o una estructura reconocible cuando una restricción falla.
        
        // La lógica de "no se puede borrar porque pertenece a uno o más pacientes" aplica a:
        if (action === 'delete' && (listType === 'antecedentes' || listType === 'analisisFuncional' || listType === 'tratamientos')) {
            // Intenta obtener el mensaje de error de la respuesta de la API (si está disponible)
            const errorDetail = error.response?.data?.detail || error.message || 'Error desconocido';

            // Revisamos el error para ver si es un problema de relación (llave foránea)
            // Esto es un ejemplo, el mensaje de error real depende del backend (Django/DRF)
            if (errorDetail.includes('llave foránea') || errorDetail.includes('violates foreign key')) {
                errorMessage = `Error: No se puede eliminar el elemento (ID: ${id}) de ${listType}. Pertenece a uno o más pacientes. Debe eliminar la relación en los pacientes primero.`;
            } else {
                errorMessage = `Error al eliminar ${listType}: ${errorDetail}`;
            }
        }
        
        // Si no es un error de borrado restringido o es Obra Social, usamos un mensaje genérico.
        alert(errorMessage);
    }
  };

  // 1. Manejar el Logout con useCallback
  const handleLogout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    
    // Redirigir al login
    navigate('/login');
  }, [navigate]); // Dependencia: navigate

  // 2. Manejar la Carga de Información del Usuario con useCallback
  const loadUserInfo = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    
    // 🚨 1. VERIFICACIÓN CRÍTICA: Si no hay token, forzar logout/redirección.
    if (!token) {
        console.error("Token de acceso no encontrado. Redirigiendo a login.");
        setLoading(false);
        handleLogout(); // Usamos la función memoizada para salir
        return; 
    }

    try {
      // 💥 USO DE LA NUEVA RUTA EFICIENTE /me/
      const response = await fetch('http://localhost:8000/api/personal/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const currentUser = await response.json();
        setUserInfo(currentUser);
        // 💾 Guardar información para que RoleProtectedRoute la use rápidamente
        localStorage.setItem('user_info', JSON.stringify(currentUser)); 
      } else if (response.status === 401) {
        // 🚨 2. MANEJO DE 401: Token inválido/expirado
        console.error('Token expirado o inválido. Redirigiendo al login.');
        handleLogout(); // Usamos la función memoizada para salir
      } else {
        // 3. Fallo en la API (usar info básica del token como fallback)
        console.warn(`Fallo al obtener info de personal (HTTP ${response.status}). Usando datos del token.`);
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fallbackInfo = {
          nombre: payload.first_name || 'Usuario',
          apellido: payload.last_name || '',
          username: payload.username,
          user: payload.user_id,
        };
        setUserInfo(fallbackInfo);
        // Guardar la info básica también, aunque es menos útil
        localStorage.setItem('user_info', JSON.stringify(fallbackInfo)); 
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]); // Dependencia: handleLogout

  // 3. useEffect corregido: se llama solo cuando loadUserInfo cambie (lo cual es raro gracias a useCallback)
  useEffect(() => {
    loadUserInfo();
    loadMasterOptions();
  }, [loadUserInfo, loadMasterOptions]); // 👈 Se añadió 'loadUserInfo'

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // ⚠️ 4. USO SEGURO DE PROPIEDADES (Se asume que userInfo existe después de `if (loading)`)
  // Si usaste el fallback, puesto_info no existirá, por eso es importante el encadenamiento opcional.
  
  // Extraemos el rol para el botón de control de acceso
  const userRole = userInfo?.puesto_info?.nombre_puesto; 
  


  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Consultorio Odontológico</h1>
          <div className="user-info">
            <span>Bienvenido/a, {userInfo?.nombre} {userInfo?.apellido}</span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          
          {/* Tarjeta Pacientes */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>👥 Pacientes</h3>
            </div>
            <div className="card-content">
              <p>Gestión de pacientes</p>
              <button 
                className="card-button"
                onClick={() => navigate('/pacientes')}
              >
                Ver Pacientes
              </button>
            </div>
          </div>

          {/* Tarjeta Turnos */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>📅 Turnos</h3>
            </div>
            <div className="card-content">
              <p>Programación y gestión de citas</p>
              <button 
                className="card-button"
                onClick={() => navigate('/turnos')}
              >
                Ver Turnos
              </button>
            </div>
          </div>

          {/* Tarjeta Historias Clínicas */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>📋 Historias Clínicas</h3>
            </div>
            <div className="card-content">
              <p>Registros médicos y tratamientos</p>
              <button 
                className="card-button"
                onClick={() => navigate('/historias')}
              >
                Ver Historias
              </button>
            </div>
          </div>

           {/* Tarjeta Personal */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>👨‍⚕️ Personal</h3>
            </div>
            <div className="card-content">
              <p>Gestión del personal médico</p>
              <button 
                className="card-button"
                onClick={() => navigate('/personal')}
              >
                Ver Personal
              </button>
            </div>
          </div>

        </div>

        {userRole === 'Admin' && (
            <div className="user-details" style={{margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                <button 
                    onClick={() => setIsOsModalOpen(true)} 
                    className="card-button" 
                    style={{backgroundColor: '#007bff'}}
                >
                    Administrar Obras Sociales
                </button>
                <button 
                    onClick={() => setIsAntecedenteModalOpen(true)} 
                    className="card-button"
                    style={{backgroundColor: '#28a745'}}
                >
                    Administrar Antecedentes
                </button>
                <button 
                    onClick={() => setIsAnalisisFuncionalModalOpen(true)} 
                    className="card-button"
                    style={{backgroundColor: '#ffc107'}}
                >
                    Administrar Análisis Funcional
                </button>
                <button 
                    onClick={() => setIsTratModalOpen(true)} 
                    className="card-button"
                    style={{backgroundColor: '#ffc107'}}
                >
                    Administrar Tratamientos
                </button>

            </div>
        )}
        {/* Información del usuario actual */}
        <div className="user-details">
          <h4>Información de sesión:</h4>
          <p><strong>Usuario:</strong> {userInfo?.nombre}</p> {/* 👈 Uso seguro */}
          <p><strong>Puesto:</strong> {userRole || 'N/A'}</p> {/* 👈 Uso seguro de userRole */}
    
          {userInfo?.email && (
            <p><strong>Email:</strong> {userInfo.email}</p>
          )}
        </div>
        <ModalAdd
              isOpen={isOsModalOpen}
              onClose={() => setIsOsModalOpen(false)}
              title="Administrar Obras Sociales"
          >
            <ListManagerContent 
                list={obrasSociales}
                nameField="nombre_os"
                onAdd={(name) => handleManipulateList('os', 'add', null, name)}
                onEdit={(id, name) => handleManipulateList('os', 'edit', id, name)}
                onDelete={(id) => handleManipulateList('os', 'delete', id)}
                placeHolder={'Ingrese el nombre'}
            />
        </ModalAdd>

        {/* Modal para Antecedentes */}
        <ModalAdd
            isOpen={isAntecedenteModalOpen}
            onClose={() => setIsAntecedenteModalOpen(false)}
            title="Administrar Antecedentes"
        >
            <ListManagerContent 
                list={antecedentes}
                nameField="nombre_ant"
                onAdd={(name) => handleManipulateList('antecedentes', 'add', null, name)}
                onEdit={(id, name) => handleManipulateList('antecedentes', 'edit', id, name)}
                onDelete={(id) => handleManipulateList('antecedentes', 'delete', id)}
                placeHolder={'Ingrese el nombre'}
            />
        </ModalAdd>
        
        {/* Modal para Análisis Funcional */}
        <ModalAdd
            isOpen={isAnalisisFuncionalModalOpen}
            onClose={() => setIsAnalisisFuncionalModalOpen(false)}
            title="Administrar Análisis Funcional"
        >
            <ListManagerContent 
                list={analisisFuncional}
                nameField="nombre_analisis"
                onAdd={(name) => handleManipulateList('analisisFuncional', 'add', null, name)}
                onEdit={(id, name) => handleManipulateList('analisisFuncional', 'edit', id, name)}
                onDelete={(id) => handleManipulateList('analisisFuncional', 'delete', id)}
                placeHolder={'Ingrese el nombre'}
            />
        </ModalAdd>
        <ModalAdd
            isOpen={isTratModalOpen}
            onClose={() => setIsTratModalOpen(false)}
            title="Administrar Tratamientos"
        >
            <ListManagerContent 
                list={tratamientos}
                nameField="nombre_trat"
                onAdd={(name) => handleManipulateList('tratamientos', 'add', null, name)}
                onEdit={(id, name) => handleManipulateList('tratamientos', 'edit', id, name)}
                onDelete={(id) => handleManipulateList('tratamientos', 'delete', id)}
                placeHolder={'Ingrese el nombre'}
            />
        </ModalAdd>
      </main>
    </div>
  );
};

export default Dashboard;