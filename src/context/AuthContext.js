import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar si el usuario ya está autenticado al cargar la app
    verificarAutenticacion();
  }, []);

  const verificarAutenticacion = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
    } finally {
      setCargando(false);
    }
  };

  const login = async (codigo, contrasena) => {
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ codigo, contrasena }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
        return { success: true };
      } else {
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/usuarios/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUsuario(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
