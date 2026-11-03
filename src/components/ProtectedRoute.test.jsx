// TP-195 (hallazgo J, auditoría del Grupo 6): primeras pruebas del frontend.
// ProtectedRoute es la barrera de acceso por rol en el cliente (regla de
// negocio 7): sin sesión manda a /login y con un rol no permitido manda a
// /no-autorizado.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

const renderConSesion = (sesion, rolesPermitidos = ['ESTUDIANTE']) =>
  render(
    <AuthContext.Provider value={sesion}>
      <MemoryRouter initialEntries={['/tramites']}>
        <Routes>
          <Route
            path="/tramites"
            element={
              <ProtectedRoute rolesPermitidos={rolesPermitidos}>
                <p>Contenido privado</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route path="/no-autorizado" element={<p>Sin permisos</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('ProtectedRoute', () => {
  test('mientras se restaura la sesión muestra "Cargando..."', () => {
    renderConSesion({ usuario: null, cargando: true });

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  test('sin sesión redirige al login', () => {
    renderConSesion({ usuario: null, cargando: false });

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  test('con un rol no permitido redirige a /no-autorizado', () => {
    renderConSesion({ usuario: { rol: 'DIRECTOR' }, cargando: false }, ['ESTUDIANTE']);

    expect(screen.getByText('Sin permisos')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  test('con un rol permitido muestra el contenido', () => {
    renderConSesion({ usuario: { rol: 'ESTUDIANTE' }, cargando: false }, ['ESTUDIANTE']);

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  test('sin lista de roles basta con tener sesión', () => {
    renderConSesion({ usuario: { rol: 'ADMIN' }, cargando: false }, null);

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});
