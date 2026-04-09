import React from 'react';
import './DashboardPages.css';

const DashboardAdmin = () => {
  return (
    <div className="dashboard-card">
      <h2>Panel de Administrador</h2>
      <p>Administra la plataforma completa</p>
      <ul>
        <li>Gestionar usuarios del sistema</li>
        <li>Ver reportes globales</li>
        <li>Configurar parámetros del sistema</li>
        <li>Auditar actividades</li>
        <li>Gestionar programas académicos</li>
      </ul>
    </div>
  );
};

export default DashboardAdmin;
