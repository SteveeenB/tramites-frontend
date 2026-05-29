import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// En modo demo, ignoramos el chequeo de rol para que cambiar de usuario
// no dispare redirects molestos a /no-autorizado. Cuando se desactive el
// demo (REACT_APP_DEMO_MODE=false), la protección por rol vuelve a aplicar.
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE !== 'false';

export const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) return <div>Cargando...</div>;

  if (!usuario) return <Navigate to="/login" replace />;

  if (!DEMO_MODE && rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};
