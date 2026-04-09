import React from 'react';

const NoAutorizado = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>❌ Acceso Denegado</h1>
      <p>No tienes permisos para acceder a esta página</p>
      <a href="/dashboard">Volver al Dashboard</a>
    </div>
  );
};

export default NoAutorizado;
