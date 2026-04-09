import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) {
    return <div>Cargando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
};
