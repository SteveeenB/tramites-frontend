import React, { createContext, useState, useCallback } from 'react';
import { ALLOWED_ROLES, DEFAULT_ROLE, DEMO_USERS } from '../config/menuConfig';

export const AuthContext = createContext();

const rolDeKey = (demoKey) => {
  if (demoKey === 'ESTUDIANTE_CON_CREDITOS' || demoKey === 'ESTUDIANTE_TIC') {
    return 'ESTUDIANTE';
  }
  return ALLOWED_ROLES.includes(demoKey) ? demoKey : DEFAULT_ROLE;
};

const construirUsuarioDemo = (demoKey) => {
  const datos = DEMO_USERS[demoKey] || DEMO_USERS[DEFAULT_ROLE];
  return { ...datos, rol: rolDeKey(demoKey) };
};

export const AuthProvider = ({ children }) => {
  const resolverDemoKeyInicial = () => {
    const params = new URLSearchParams(window.location.search);
    const desdeUrl = params.get('rol');
    return DEMO_USERS[desdeUrl] ? desdeUrl : DEFAULT_ROLE;
  };

  const [usuario, setUsuario] = useState(() => construirUsuarioDemo(resolverDemoKeyInicial()));
  const [cargando] = useState(false);

  const cambiarRol = useCallback((demoKey) => {
    if (!DEMO_USERS[demoKey]) return;
    setUsuario(construirUsuarioDemo(demoKey));
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, cambiarRol }}>
      {children}
    </AuthContext.Provider>
  );
};
