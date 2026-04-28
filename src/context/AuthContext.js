import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ALLOWED_ROLES, DEFAULT_ROLE, DEMO_USERS } from '../config/menuConfig';
import { apiClient } from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const resolverRolInicial = () => {
    const params = new URLSearchParams(window.location.search);
    const rolDesdeUrl = params.get('rol');
    return ALLOWED_ROLES.includes(rolDesdeUrl) ? rolDesdeUrl : DEFAULT_ROLE;
  };

  const [usuario, setUsuario] = useState(() => {
    const rol = resolverRolInicial();
    return { ...DEMO_USERS[rol], rol };
  });
  const [cargando, setCargando] = useState(true);

  const cargarUsuarioPorCedula = useCallback(async (cedula, rolFallback) => {
    try {
      const data = await apiClient(`/tramites?cedula=${cedula}`);
      const rol = ALLOWED_ROLES.includes(data?.usuario?.rol) ? data.usuario.rol : rolFallback;
      setUsuario({
        nombre:            data?.usuario?.nombre            || DEMO_USERS[rol]?.nombre            || 'Usuario',
        cedula:            data?.usuario?.cedula            || cedula,
        rol,
        programaAcademico: data?.usuario?.programaAcademico || DEMO_USERS[rol]?.programaAcademico || '',
      });
    } catch {
      setUsuario({ ...DEMO_USERS[rolFallback], rol: rolFallback });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const rol = resolverRolInicial();
    cargarUsuarioPorCedula(DEMO_USERS[rol].cedula, rol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargarUsuarioPorCedula]);

  const cambiarRol = useCallback(
    (demoKey) => {
      const demoUser = DEMO_USERS[demoKey];
      if (!demoUser) return;
  
      // Determinar el rol efectivo según la clave demo
      const rolEfectivo =
        demoKey === 'ESTUDIANTE'              ? 'ESTUDIANTE' :
        demoKey === 'ESTUDIANTE_CON_CREDITOS' ? 'ESTUDIANTE' :
        demoKey === 'ESTUDIANTE_TIC'          ? 'ESTUDIANTE' :
        demoKey === 'DIRECTOR'                ? 'DIRECTOR'   :
        demoKey === 'ADMIN'                   ? 'ADMIN'      :
        DEFAULT_ROLE;
  
      setCargando(true);
      cargarUsuarioPorCedula(demoUser.cedula, rolEfectivo);
    },
    [cargarUsuarioPorCedula],
  );

  return (
    <AuthContext.Provider value={{ usuario, cargando, cambiarRol }}>
      {children}
    </AuthContext.Provider>
  );
};
