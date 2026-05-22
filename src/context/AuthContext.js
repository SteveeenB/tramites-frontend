import React, { createContext, useState, useCallback, useEffect } from 'react';
import { DEMO_USERS } from '../config/menuConfig';

export const AuthContext = createContext();

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'auth_token';
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE !== 'false';

// Decodifica el payload del JWT sin verificar firma (solo para leer claims en cliente)
const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const payloadToUsuario = (claims) => ({
  id:             claims.sub,
  cedula:         claims.cedula,
  nombreCompleto: claims.nombreCompleto,
  nombre:         claims.nombreCompleto,
  codigo:         claims.codigo,
  email:          claims.email,
  rol:            claims.rol,
});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar: leer token guardado y restaurar sesión si no expiró
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const claims = decodeJwtPayload(token);
      if (claims && claims.exp * 1000 > Date.now()) {
        setUsuario(payloadToUsuario(claims));
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setCargando(false);
  }, []);

  // Llamado después de un login exitoso (recibe { token, cedula, nombreCompleto, ... })
  const login = useCallback((responseData) => {
    localStorage.setItem(TOKEN_KEY, responseData.token);
    const claims = decodeJwtPayload(responseData.token);
    setUsuario(claims ? payloadToUsuario(claims) : {
      id:             responseData.id,
      cedula:         responseData.cedula,
      nombreCompleto: responseData.nombreCompleto,
      nombre:         responseData.nombreCompleto,
      codigo:         responseData.codigo,
      email:          responseData.email,
      rol:            responseData.rol,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }, []);

  // Demo: cambia al usuario con la cédula del demoKey, emitiendo un JWT real desde el backend
  const cambiarRol = useCallback(async (demoKey) => {
    if (!DEMO_MODE) return;
    const datos = DEMO_USERS[demoKey];
    if (!datos) return;
    try {
      const res = await fetch(`${BASE_URL}/auth/login-demo?cedula=${datos.cedula}`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      login(data);
    } catch {
      // Demo backend no disponible — no hacer nada
    }
  }, [login]);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, cambiarRol }}>
      {children}
    </AuthContext.Provider>
  );
};
