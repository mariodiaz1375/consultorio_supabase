// import logo from './logo.svg';
// import './App.css';
// // import PacientesList from './components/pacientesList/PacientesList';
// import { useState } from 'react';
// import PacientesPagina from './pages/pacientesPagina/PacientesPagina';
// import LoginPagina from './pages/loginPagina/LoginPagina';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';           // ✅
import Dashboard from './components/Dashboard/Dashboard'; // ✅
import ProtectedRoute from './components/Auth/ProtectedRoute'; // ✅
import PacientesPagina from './pages/pacientesPagina/PacientesPagina';
import PersonalPagina from './pages/personalPagina/PersonalPagina';
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute';
import TurnosPagina from './pages/turnosPagina/TurnosPagina';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
          
            <Dashboard />
          
          </ProtectedRoute>
        } />
        <Route path="/pacientes" element={
          <ProtectedRoute>
            <PacientesPagina />
          </ProtectedRoute>
        } />
        <Route path="/personal" element={
          <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['Admin']}>
            <PersonalPagina />
          </RoleProtectedRoute>
          </ProtectedRoute>
        } />
        <Route path="/turnos" element={
          <ProtectedRoute>
            <TurnosPagina />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
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
