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
      // Llama al backend con la cedula correcta del usuario demo seleccionado
      const data = await apiClient(`/usuarios/login-demo?cedula=${cedula}`, { method: 'POST' });
      // rolFallback ya viene normalizado (ESTUDIANTE, DIRECTOR o ADMIN)
      const rol = ALLOWED_ROLES.includes(data?.rol) ? data.rol : rolFallback;
      setUsuario({
        cedula:            data?.cedula            || cedula,
        nombre:            data?.nombre            || 'Usuario',
        rol,
        programaAcademico: data?.programaAcademico || '',
      });
    } catch {
      // Si el backend falla, busca el usuario demo por cedula para mostrar datos correctos
      const fallbackUser = Object.values(DEMO_USERS).find((u) => u.cedula === cedula);
      setUsuario({
        cedula,
        nombre:            fallbackUser?.nombre            || 'Usuario',
        rol:               rolFallback,
        programaAcademico: fallbackUser?.programaAcademico || '',
      });
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
      // ESTUDIANTE_CON_CREDITOS y ESTUDIANTE_TIC son variantes demo del rol ESTUDIANTE
      const rolEfectivo = demoKey.startsWith('ESTUDIANTE') ? 'ESTUDIANTE' : demoKey;
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
/*import React, { createContext, useState, useEffect, useCallback } from 'react';
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
      // Establece la sesión en el backend y obtiene datos del usuario
      const data = await apiClient(`/usuarios/login-demo?cedula=${cedula}`, { method: 'POST' });
      const rol = ALLOWED_ROLES.includes(data?.rol) ? data.rol : rolFallback;
      setUsuario({
        cedula:            data?.cedula            || cedula,
        nombre:            data?.nombre            || DEMO_USERS[rolFallback]?.nombre || 'Usuario',
        rol,
        programaAcademico: DEMO_USERS[rolFallback]?.programaAcademico || '',
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
      const rolEfectivo = ALLOWED_ROLES.includes(demoKey) ? demoKey : 'ESTUDIANTE';
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
*/