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

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   return (
//     <div className="App">
//       {isLoggedIn ? (
//         <PacientesPagina />
//       ) : (
//         <LoginPagina onLoginSuccess={() => setIsLoggedIn(true)} />
//       )}
//     </div>
//   );
// }

// export default App;
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
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;