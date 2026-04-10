import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import TramitesView from './pages/TramitesView';
import ProcesodeGrado from './pages/ProcesodeGrado';
import NoAutorizado from './pages/NoAutorizado';
import { ALLOWED_ROLES } from './config/menuConfig';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/tramites"
            element={
              <ProtectedRoute rolesPermitidos={ALLOWED_ROLES}>
                <TramitesView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proceso-de-grado"
            element={
              <ProtectedRoute rolesPermitidos={['ESTUDIANTE']}>
                <ProcesodeGrado />
              </ProtectedRoute>
            }
          />
          <Route path="/no-autorizado" element={<NoAutorizado />} />
          <Route path="/" element={<Navigate to="/tramites" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
