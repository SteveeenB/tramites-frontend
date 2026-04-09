import React from 'react';
import './DashboardPages.css';

const DashboardDirector = () => {
  return (
    <div className="dashboard-card">
      <h2>Panel del Director de Programa</h2>
      <p>Gestiona los trámites de tu programa académico</p>
      <ul>
        <li>Ver todas las solicitudes del programa</li>
        <li>Aprobar o rechazar trámites</li>
        <li>Acceder a reportes de solicitudes</li>
        <li>Gestionar estudiantes del programa</li>
        <li>Enviar comunicaciones a estudiantes</li>
      </ul>
    </div>
  );
};

export default DashboardDirector;
