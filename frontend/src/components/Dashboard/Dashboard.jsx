import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css'; // 👈 CAMBIO: Importación de CSS Module
import ModalAdd from '../modalAdd/ModalAdd';
import ListManagerContent from '../listaMaestra/ListManagerContent';
import GraficosTurnos from '../graficos/GraficosTurnos.jsx';
import GraficosTratamientos from '../graficos/GraficosTratamientos.jsx';
import { 
    getObrasSociales, createObraSocial, updateObraSocial, deleteObraSocial,
    getAntecedentes, createAntecedente, updateAntecedente, deleteAntecedente,
    getAnalisisFuncional, createAnalisisFuncional, updateAnalisisFuncional, deleteAnalisisFuncional,
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

  // (El resto de la lógica de React permanece igual...)
  const loadMasterOptions = useCallback(async () => {
    try {
        const [osList, antList, afList, tratList] = await Promise.all([
            getObrasSociales(),
            getAntecedentes(),
            getAnalisisFuncional(),
            getTratamientos(),
        ]);
        
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
        const nameFieldMap = {
            os: 'nombre_os',
            antecedentes: 'nombre_ant',
            analisisFuncional: 'nombre_analisis',
            tratamientos: 'nombre_trat',
        };

        const nameField = nameFieldMap[listType];
        const actionType = `${listType}-${action}`;

        let list;
        let originalName = newName; 
        
        if (listType === 'os') list = obrasSociales;
        else if (listType === 'antecedentes') list = antecedentes;
        else if (listType === 'analisisFuncional') list = analisisFuncional;
        else if (listType === 'tratamientos') list = tratamientos;
        
        if (action === 'edit' || action === 'delete') {
            const item = list?.find(item => item.id === id);
            if (item) {
                originalName = item[nameField]; 
            }
        }
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

        if (action === 'delete' && (listType === 'antecedentes' || listType === 'analisisFuncional' || listType === 'tratamientos')) {
            const errorDetail = error.response?.data?.detail || error.message || 'Error desconocido';
            if (errorDetail.includes('llave foránea') || errorDetail.includes('violates foreign key')) {
                errorMessage = `Error: No se puede eliminar el elemento (ID: ${id}) de ${listType}. Pertenece a uno o más pacientes. Debe eliminar la relación en los pacientes primero.`;
            } else {
                errorMessage = `Error al eliminar ${listType}: ${errorDetail}`;
            }
        }
        
        alert(errorMessage);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    navigate('/login');
  }, [navigate]); 

  const loadUserInfo = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        console.error("Token de acceso no encontrado. Redirigiendo a login.");
        setLoading(false);
        handleLogout(); 
        return; 
    }

    try {
      const response = await fetch('http://localhost:8000/api/personal/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const currentUser = await response.json();
        setUserInfo(currentUser);
        localStorage.setItem('user_info', JSON.stringify(currentUser)); 
      } else if (response.status === 401) {
        console.error('Token expirado o inválido. Redirigiendo al login.');
        handleLogout(); 
      } else {
        console.warn(`Fallo al obtener info de personal (HTTP ${response.status}). Usando datos del token.`);
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fallbackInfo = {
          nombre: payload.first_name || 'Usuario',
          apellido: payload.last_name || '',
          username: payload.username,
          user: payload.user_id,
        };
        setUserInfo(fallbackInfo);
        localStorage.setItem('user_info', JSON.stringify(fallbackInfo)); 
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]); 

  useEffect(() => {
    loadUserInfo();
    loadMasterOptions();
  }, [loadUserInfo, loadMasterOptions]); 

  if (loading) {
    return (
      // 👇 CAMBIO: Aplicando clases con `styles`
      <div className={styles['dashboard-loading']}>
        <div className={styles['spinner-large']}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }
  
  const userRole = userInfo?.puesto_info?.nombre_puesto; 
  
  return (
    // 👇 CAMBIOS: Aplicando clases con `styles`
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles['dashboard-header']}>
        <div className={styles['header-content']}>
          <h1>Consultorio Odontológico</h1>
          <div className={styles['user-info']}>
            <span>Bienvenido/a, {userInfo?.nombre} {userInfo?.apellido}</span>
            <button onClick={handleLogout} className={styles['logout-btn']}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles['dashboard-main']}>
        <div className={styles['dashboard-grid']}>
          
          {/* Tarjeta Pacientes */}
          <div className={styles['dashboard-card']}>
            <div className={styles['card-header']}>
              <h3>👥 Pacientes</h3>
            </div>
            <div className={styles['card-content']}>
              <p>Gestión de pacientes</p>
              <button 
                className={styles['card-button']}
                onClick={() => navigate('/pacientes')}
              >
                Ver Pacientes
              </button>
            </div>
          </div>

          {/* Tarjeta Turnos */}
          <div className={styles['dashboard-card']}>
            <div className={styles['card-header']}>
              <h3>📅 Turnos</h3>
            </div>
            <div className={styles['card-content']}>
              <p>Programación y gestión de citas</p>
              <button 
                className={styles['card-button']}
                onClick={() => navigate('/turnos')}
              >
                Ver Turnos
              </button>
            </div>
          </div>

          {/* Tarjeta Historias Clínicas */}
          <div className={styles['dashboard-card']}>
            <div className={styles['card-header']}>
              <h3>📋 Historias Clínicas</h3>
            </div>
            <div className={styles['card-content']}>
              <p>Registros médicos y tratamientos</p>
              <button 
                className={styles['card-button']}
                onClick={() => navigate('/historias')}
              >
                Ver Historias
              </button>
            </div>
          </div>

           {/* Tarjeta Personal */}
          <div className={styles['dashboard-card']}>
            <div className={styles['card-header']}>
              <h3>👨‍⚕️ Personal</h3>
            </div>
            <div className={styles['card-content']}>
              <p>Gestión del personal médico</p>
              <button 
                className={styles['card-button']}
                onClick={() => navigate('/personal')}
              >
                Ver Personal
              </button>
            </div>
          </div>

        </div>

        {userRole === 'Admin' && (
            <div className={styles['user-details']} style={{margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                <button 
                    onClick={() => setIsOsModalOpen(true)} 
                    className={styles['card-button']} 
                    style={{backgroundColor: '#007bff'}}
                >
                    Administrar Obras Sociales
                </button>
                <button 
                    onClick={() => setIsAntecedenteModalOpen(true)} 
                    className={styles['card-button']}
                    style={{backgroundColor: '#28a745'}}
                >
                    Administrar Antecedentes
                </button>
                <button 
                    onClick={() => setIsAnalisisFuncionalModalOpen(true)} 
                    className={styles['card-button']}
                    style={{backgroundColor: '#ffc107'}}
                >
                    Administrar Análisis Funcional
                </button>
                <button 
                    onClick={() => setIsTratModalOpen(true)} 
                    className={styles['card-button']}
                    style={{backgroundColor: '#ffc107'}}
                >
                    Administrar Tratamientos
                </button>
                <button 
                    onClick={() => navigate('/auditoria_pagos')}
                    className={styles['card-button']}
                    style={{backgroundColor: '#28a745'}}
                >
                    Auditar Pagos
                </button>
                <button 
                    onClick={() => navigate('/auditoria_turnos')}
                    className={styles['card-button']}
                    style={{backgroundColor: '#28a745'}}
                >
                    Auditar Turnos
                </button>
            </div>
        )}
        {/* Información del usuario actual */}
        <div className={styles['chart-container']}>
          <GraficosTurnos />
          <GraficosTratamientos />
        </div>
        
        {/* (Los Modales no tienen clases de Dashboard.css, por lo que no necesitan cambios) */}
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