// import logo from './logo.svg';
// import './App.css';
// // import PacientesList from './components/pacientesList/PacientesList';
// import { useState } from 'react';
// import PacientesPagina from './pages/pacientesPagina/PacientesPagina';
// import LoginPagina from './pages/loginPagina/LoginPagina';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute';
import PacientesPagina from './pages/pacientesPagina/PacientesPagina';
import PersonalPagina from './pages/personalPagina/PersonalPagina';
import TurnosPagina from './pages/turnosPagina/TurnosPagina';
import AuditoriaPagosPagina from './pages/auditoriaPagos/AuditoriaPagosPagina';
import AuditoriaTurnosPagina from './pages/auditoriaTurnos/AuditoriaTurnosPagina';
import { AlertProvider } from './context/AlertContext';
import { AlertSystem } from './components/AlertSystem/AlertSystem';
import Layout from './components/layout/Layout';
import Perfil from './components/miPerfil/Perfil';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

function App() {
  return (
    <AlertProvider>
      <Router>
        <AlertSystem />
        <Routes>
          {/* Ruta pública - Login sin Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          {/* Rutas protegidas - CON Layout (Sidebar) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/pacientes" element={
            <ProtectedRoute>
              <Layout>
                <PacientesPagina />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/personal" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <PersonalPagina />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/turnos" element={
            <ProtectedRoute>
              <Layout>
                <TurnosPagina />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/auditoria_pagos" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <AuditoriaPagosPagina />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/auditoria_turnos" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <AuditoriaTurnosPagina />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/perfil" element={
            <Layout>
              <Perfil />
            </Layout>
          } />
          
          
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './components/Auth/Login';           
// import Dashboard from './components/Dashboard/Dashboard'; 
// import ProtectedRoute from './components/Auth/ProtectedRoute'; 
// import RoleProtectedRoute from './components/Auth/RoleProtectedRoute'; // 👈 Nuevo
// import PacientesPagina from './pages/pacientesPagina/PacientesPagina';
// import PersonalPagina from './pages/personalPagina/PersonalPagina';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
        
//         <Route path="/dashboard" element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         } />
        
//         <Route path="/pacientes" element={
//           <ProtectedRoute>
//             <RoleProtectedRoute allowedRoles={['admin', 'secretario/a', 'odontólogo/a']}>
//               <PacientesPagina />
//             </RoleProtectedRoute>
//           </ProtectedRoute>
//         } />
        
//         <Route path="/personal" element={
//           <ProtectedRoute>
//             <RoleProtectedRoute allowedRoles={['admin']}>  {/* 👈 Solo admin */}
//               <PersonalPagina />
//             </RoleProtectedRoute>
//           </ProtectedRoute>
//         } />
        
//         <Route path="/" element={<Login />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
