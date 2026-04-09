import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardEstudiante from './DashboardEstudiante';
import DashboardDirector from './DashboardDirector';
import DashboardAdmin from './DashboardAdmin';
import './Dashboard.css';

const Dashboard = () => {
  const { usuario, logout } = useAuth();

  const renderizarSegunRol = () => {
    switch (usuario.rol) {
      case 'ESTUDIANTE':
        return <DashboardEstudiante />;
      case 'DIRECTOR':
        return <DashboardDirector />;
      case 'ADMIN':
        return <DashboardAdmin />;
      default:
        return <div>Rol desconocido</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>Sistema de Trámites Posgrados</h1>
          <div className="user-info">
            <span className="user-name">Bienvenido, {usuario.nombre}</span>
            <span className="user-role">({usuario.rol})</span>
            <button className="logout-btn" onClick={logout}>Cerrar Sesión</button>
          </div>
        </div>
      </nav>
      <main className="dashboard-main">
        {renderizarSegunRol()}
      </main>
    </div>
  );
};

export default Dashboard;
