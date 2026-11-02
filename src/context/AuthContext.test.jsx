// TP-195: la sesión se restaura desde el JWT guardado en localStorage.
// Un token vigente reconstruye el usuario (incluidas las tildes del payload);
// uno vencido se descarta para no dejar una sesión fantasma.
import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';

const TOKEN_KEY = 'auth_token';

// Construye un JWT sin firma válida: el cliente solo lee los claims.
const crearToken = (claims) => {
  const base64url = (obj) =>
    Buffer.from(JSON.stringify(obj), 'utf8')
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(claims)}.firma`;
};

const enUnaHora = () => Math.floor(Date.now() / 1000) + 3600;
const haceUnaHora = () => Math.floor(Date.now() / 1000) - 3600;

const MostrarSesion = () => {
  const { usuario, cargando, logout } = useContext(AuthContext);
  if (cargando) return <p>cargando</p>;
  if (!usuario) return <p>sin sesión</p>;
  return (
    <div>
      <p>{`${usuario.nombreCompleto} · ${usuario.rol} · ${usuario.programaNombre}`}</p>
      <button onClick={logout}>salir</button>
    </div>
  );
};

const renderProvider = () =>
  render(
    <AuthProvider>
      <MostrarSesion />
    </AuthProvider>
  );

describe('AuthContext', () => {
  afterEach(() => localStorage.clear());

  test('sin token guardado no hay sesión', () => {
    renderProvider();

    expect(screen.getByText('sin sesión')).toBeInTheDocument();
  });

  test('con un token vigente restaura el usuario, tildes incluidas', () => {
    localStorage.setItem(
      TOKEN_KEY,
      crearToken({
        sub: '1',
        cedula: '1090000001',
        nombreCompleto: 'María Gómez',
        rol: 'ESTUDIANTE',
        programaNombre: 'Maestría en Ingeniería',
        exp: enUnaHora(),
      })
    );

    renderProvider();

    expect(
      screen.getByText('María Gómez · ESTUDIANTE · Maestría en Ingeniería')
    ).toBeInTheDocument();
  });

  test('con un token vencido no hay sesión y el token se borra', () => {
    localStorage.setItem(
      TOKEN_KEY,
      crearToken({ sub: '1', rol: 'ESTUDIANTE', exp: haceUnaHora() })
    );

    renderProvider();

    expect(screen.getByText('sin sesión')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  test('logout cierra la sesión y borra el token', () => {
    localStorage.setItem(
      TOKEN_KEY,
      crearToken({ sub: '1', nombreCompleto: 'Ana', rol: 'ADMIN', exp: enUnaHora() })
    );
    renderProvider();

    act(() => {
      screen.getByText('salir').click();
    });

    expect(screen.getByText('sin sesión')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
