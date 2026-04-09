import React from 'react';
import './DashboardPages.css';

const DashboardEstudiante = () => {
  return (
    <div className="dashboard-card">
      <h2>Panel de Estudiante</h2>
      <p>Aquí puedes gestionar tus trámites académicos</p>
      <ul>
        <li>Ver mis trámites</li>
        <li>Presentar nuevas solicitudes</li>
        <li>Consultar el estado de mis documentos</li>
        <li>Descargar constancias</li>
      </ul>
    </div>
  );
};

export default DashboardEstudiante;
