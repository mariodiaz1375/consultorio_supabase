import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import ModalAdd from '../modalAdd/ModalAdd';
import ListManagerContent from '../listaMaestra/ListManagerContent';
import GraficosTurnos from '../graficos/GraficosTurnos.jsx';
import GraficosTratamientos from '../graficos/GraficosTratamientos.jsx';
import { useAlert } from '../../hooks/useAlert';
import { 
    getObrasSociales, createObraSocial, updateObraSocial, deleteObraSocial,
    getAntecedentes, createAntecedente, updateAntecedente, deleteAntecedente,
    getAnalisisFuncional, createAnalisisFuncional, updateAnalisisFuncional, deleteAnalisisFuncional,
} from '../../api/pacientes.api.js';
import {
  getTratamientos, createTratamiento, updateTratamientos, deleteTratamientos,
} from '../../api/historias.api.js';

const Dashboard = () => {
  const { showSuccess, showError } = useAlert();
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

  // Busca esta función en tu Dashboard.jsx y reemplázala:

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
        
        // 🆕 OBTENER EL NOMBRE ANTES DE LA ACCIÓN (para edit y delete)
        if (action === 'edit' || action === 'delete') {
            const item = list?.find(item => item.id === id);
            if (item) {
                originalName = item[nameField]; 
            }
        }

        const data = { [nameField]: newName };
        const listName = listType === 'os' ? 'Obra Social' : 
                        listType === 'antecedentes' ? 'Antecedente' : 
                        listType === 'analisisFuncional' ? 'Análisis Funcional' : 
                        'Tratamiento';

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

        // 🆕 ALERTAS MEJORADAS - Solo muestran el nombre, sin ID
        if (action === 'add') {
            showSuccess(`${listName} "${newName}" agregado(a) correctamente`);
        } else if (action === 'edit') {
            showSuccess(`${listName} "${newName}" actualizado(a) correctamente`);
        } else if (action === 'delete') {
            showSuccess(`${listName} "${originalName}" eliminado(a) correctamente`);
        }
        
    } catch (error) {
        console.error(`Error al ejecutar ${action} en ${listType}:`, error);
        
        let errorMessage = `Ocurrió un error en la operación de ${action} de ${listType}.`;

        if (action === 'delete' && (listType === 'antecedentes' || listType === 'analisisFuncional' || listType === 'tratamientos')) {
            const errorDetail = error.response?.data?.detail || error.message || 'Error desconocido';
            if (errorDetail.includes('llave foránea') || errorDetail.includes('violates foreign key')) {
                errorMessage = `Error: No se puede eliminar el elemento. Está siendo utilizado por uno o más pacientes. Debe eliminar la relación primero.`;
            } else {
                errorMessage = `Error al eliminar: ${errorDetail}`;
            }
        }
        
        showError(errorMessage);
    }
};

  const loadUserInfo = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        console.error("Token de acceso no encontrado.");
        setLoading(false);
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
        console.error('Token expirado o inválido.');
      } else {
        console.warn(`Fallo al obtener info de personal (HTTP ${response.status}).`);
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    loadUserInfo();
    loadMasterOptions();
  }, [loadUserInfo, loadMasterOptions]); 

  if (loading) {
    return (
      <div className={styles['dashboard-loading']}>
        <div className={styles['spinner-large']}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }
  
  const userRole = userInfo?.puesto_info?.nombre_puesto; 
  
  return (
    <div className={styles.dashboardContent}>
      {/* Título de bienvenida */}
      <div className={styles.welcomeSection}>
        <h1>¡Bienvenido/a, {userInfo?.nombre}! 👋</h1>
        <p>Gestiona tu consultorio desde aquí</p>
      </div>

      {/* Main Content */}
      <div className={styles.dashboardGrid}>
        
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

        {/* Tarjeta Mi Perfil */}
        <div className={styles['dashboard-card']}>
          <div className={styles['card-header']}>
            <h3>👤 Mi Perfil</h3>
          </div>
          <div className={styles['card-content']}>
            <p>Gestión de tu cuenta y configuración</p>
            <button 
              className={styles['card-button']}
              onClick={() => navigate('/perfil')}
            >
              Ver Perfil
            </button>
          </div>
        </div>

         {/* Tarjeta Personal */}
        {userRole === 'Admin' && (
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
        )}

        {/* Tarjeta Auditoria */}
        {userRole === 'Admin' && (
          <div className={styles['dashboard-card']}>
            <div className={styles['card-header']}>
              <h3>📋 Auditorias</h3>
            </div>
            <div className={styles['card-content']}>
                <button 
                    onClick={() => navigate('/auditoria_pagos')}
                    className={styles['card-button']}
                    style={{backgroundColor: '#28a745'}}
                >
                    Auditar Pagos
                </button>
                <p></p>
                <button 
                    onClick={() => navigate('/auditoria_turnos')}
                    className={styles['card-button']}
                    style={{backgroundColor: '#28a745'}}
                >
                    Auditar Turnos
                </button>
            </div>
          </div>
        )}

      </div>

      {userRole === 'Admin' && (
          <div className={styles['admin-buttons']}>
              <button 
                  onClick={() => setIsOsModalOpen(true)} 
                  className={styles['admin-btn']} 
              >
                  Administrar Obras Sociales
              </button>
              <button 
                  onClick={() => setIsAntecedenteModalOpen(true)} 
                  className={styles['admin-btn']}
              >
                  Administrar Antecedentes
              </button>
              <button 
                  onClick={() => setIsAnalisisFuncionalModalOpen(true)} 
                  className={styles['admin-btn']}
              >
                  Administrar Análisis Funcional
              </button>
              <button 
                  onClick={() => setIsTratModalOpen(true)} 
                  className={styles['admin-btn']}
              >
                  Administrar Tratamientos
              </button>
          </div>
      )}

      {/* Gráficos */}
      <div className={styles['chart-container']}>
        <GraficosTurnos />
        <GraficosTratamientos />
      </div>
      
      {/* Modales */}
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
    </div>
  );
};

export default Dashboard;