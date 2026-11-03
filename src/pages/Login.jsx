import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DEMO_MODE } from '../config/appConfig';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { Boton, CLASE_CAMPO } from '../components/ui';
import { UI } from '../constants/tramitesColors';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const { login, usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [codigo, setCodigo]         = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError]           = useState('');
  const [cargando, setCargando]     = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (usuario) navigate('/tramites', { replace: true });
  }, [usuario, navigate]);

  // Inicializar Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
      );
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleResponse = async (credentialResponse) => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al autenticar con Google'); return; }
      login(data);
      navigate('/tramites', { replace: true });
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleLoginManual = async (e) => {
    e.preventDefault();
    if (!codigo || !contrasena) { setError('Ingresa código y contraseña'); return; }
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, contrasena }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Credenciales inválidas'); return; }
      login(data);
      navigate('/tramites', { replace: true });
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-red-50 via-white to-gray-100 animate-fade-in">
      <FondoDecorativo />

      {/* Logo institucional */}
      <div className="relative flex items-center px-6 py-5 sm:px-8 animate-slide-left">
        <img src="/LOGO.png" alt="Universidad Francisco de Paula Santander" className="h-14 w-14" />
      </div>

      {/* Tarjeta flotante */}
      <div className="relative flex items-center justify-center px-4 pb-10">
        <main className="w-full max-w-sm rounded-xl border border-red-100 bg-white/80 p-6 shadow-xl shadow-red-900/10 backdrop-blur-sm animate-fade-in-up sm:p-8">
          <div className="mb-5 rounded-md bg-gradient-to-r from-red-700 to-red-600 p-4 text-center text-white shadow">
            <h1 className="text-2xl font-bold tracking-wide">Trámites de Posgrado</h1>
            <p className="mt-1 text-sm text-red-100">Ingresa con tu código y contraseña</p>
          </div>

          {/* Login con Google */}
          {GOOGLE_CLIENT_ID && (
            <>
              <div className="mb-4">
                <div id="google-signin-btn" />
              </div>
              <div className="mb-4 flex items-center gap-3 text-xs text-gray-500">
                <span className="h-px flex-1 bg-gray-200" />
                o ingresa con código
                <span className="h-px flex-1 bg-gray-200" />
              </div>
            </>
          )}

          {/* Login con código + contraseña */}
          <form onSubmit={handleLoginManual} noValidate className="flex flex-col gap-4">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="codigo" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UserIcon className="h-4 w-4 text-primario" aria-hidden="true" />
                Código de usuario
              </label>
              <input
                id="codigo"
                className={CLASE_CAMPO}
                type="text"
                placeholder="Tu código o cédula"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                autoComplete="username"
                disabled={cargando}
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <LockClosedIcon className="h-4 w-4 text-primario" aria-hidden="true" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contrasena"
                  className={`${CLASE_CAMPO} pr-11`}
                  type={verContrasena ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={contrasena}
                  onChange={e => setContrasena(e.target.value)}
                  autoComplete="current-password"
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setVerContrasena(v => !v)}
                  aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={verContrasena}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700 ${UI.foco}`}
                >
                  {verContrasena
                    ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <Boton type="submit" cargando={cargando} anchoCompleto tamano="lg" className="mt-1 font-bold">
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </Boton>
          </form>

          {/* Demo mode label — solo visible en desarrollo */}
          {DEMO_MODE && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Modo demo activo — usa el selector de roles en el sidebar
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

/** Formas suaves de fondo, como en la página de acceso del Módulo de Matrícula. */
function FondoDecorativo() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-100/60" />
      <div className="absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-red-50" />
      <div className="absolute left-1/3 top-1/2 h-72 w-[40rem] -translate-y-1/2 rounded-full bg-red-50/70" />
      <div className="absolute left-10 top-10 h-44 w-72 rounded-3xl bg-red-100/40" />
      <div className="absolute bottom-16 right-12 h-32 w-60 rounded-3xl bg-red-100/40" />
    </div>
  );
}
