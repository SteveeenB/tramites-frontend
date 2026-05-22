import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import TramitesView from './pages/TramitesView';
import ProcesodeGrado from './pages/ProcesodeGrado';
import Certificados from './pages/Certificados';
import BandejaDirector from './pages/BandejaDirector';
import ListaSolicitudesDirector from './pages/ListaSolicitudesDirector';
import BandejaGrado from './pages/BandejaGrado';
import ListaSolicitudesGrado from './pages/ListaSolicitudesGrado';
import DetalleSolicitudGrado from './pages/DetalleSolicitudGrado';
import BandejaSolicitudes from './pages/BandejaSolicitudes';
import ConfiguracionAdmin from './pages/ConfiguracionAdmin';
import SolicitudGradoPage from './pages/SolicitudGradoPage';
import NoAutorizado from './pages/NoAutorizado';
import BandejaDependencia from './pages/BandejaDependencia';
import PazYSalvoDirector from './pages/PazYSalvoDirector';
import EstadoEstudiantes from './pages/EstadoEstudiantes';
import { ALLOWED_ROLES } from './config/menuConfig';
import VerificarCertificado from './pages/VerificarCertificado';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/verificar" 
            element={
              <VerificarCertificado />
            } 
          />
          <Route
            path="/tramites"
            element={
              <ProtectedRoute rolesPermitidos={[...ALLOWED_ROLES, 'DEPENDENCIA']}>
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
          <Route
            path="/certificados"
            element={
              <ProtectedRoute rolesPermitidos={['ESTUDIANTE']}>
                <Certificados />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proceso-de-grado/solicitud-grado"
            element={
              <ProtectedRoute rolesPermitidos={['ESTUDIANTE']}>
                <SolicitudGradoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/bandeja-solicitudes"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <BandejaSolicitudes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/bandeja-director"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <BandejaDirector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/bandeja-director/:estado"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <ListaSolicitudesDirector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/bandeja-director/grado"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <BandejaGrado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/bandeja-director/grado/:estado/:id"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <DetalleSolicitudGrado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/bandeja-director/grado/:estado"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <ListaSolicitudesGrado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/admin/configuracion"
            element={
              <ProtectedRoute rolesPermitidos={['ADMIN', 'POSGRADOS']}>
                <ConfiguracionAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/bandeja-dependencia"
            element={
              <ProtectedRoute rolesPermitidos={['DEPENDENCIA']}>
                <BandejaDependencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/paz-y-salvo-director"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <PazYSalvoDirector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tramites/estado-estudiantes"
            element={
              <ProtectedRoute rolesPermitidos={['DIRECTOR']}>
                <EstadoEstudiantes />
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
