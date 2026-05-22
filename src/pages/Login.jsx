import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE !== 'false';

export default function Login() {
  const { login, usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [codigo, setCodigo]         = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError]           = useState('');
  const [cargando, setCargando]     = useState(false);

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Trámites de Posgrado</h2>
        <p style={styles.subtitle}>UFPS — Ingresa a tu cuenta</p>

        {/* Login con Google */}
        {GOOGLE_CLIENT_ID && (
          <div style={{ marginBottom: 16 }}>
            <div id="google-signin-btn" />
          </div>
        )}

        {/* Separador */}
        {GOOGLE_CLIENT_ID && (
          <div style={styles.separator}>
            <span>o ingresa con código</span>
          </div>
        )}

        {/* Login con código + contraseña */}
        <form onSubmit={handleLoginManual} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Código de usuario"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            autoComplete="username"
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Demo mode label — solo visible en desarrollo */}
        {DEMO_MODE && (
          <p style={styles.demoNote}>
            Modo demo activo — usa el selector de roles en el sidebar
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '40px 36px',
    width: 360,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: { margin: '0 0 4px', fontSize: 22, color: '#1a202c', textAlign: 'center' },
  subtitle: { margin: '0 0 24px', color: '#718096', textAlign: 'center', fontSize: 14 },
  separator: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '0 0 16px', color: '#a0aec0', fontSize: 13,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
    fontSize: 14, outline: 'none',
  },
  button: {
    padding: '11px 0', borderRadius: 6, border: 'none',
    background: '#2b6cb0', color: '#fff', fontSize: 15,
    cursor: 'pointer', fontWeight: 600,
  },
  error: { color: '#e53e3e', fontSize: 13, margin: '0' },
  demoNote: { marginTop: 16, color: '#a0aec0', fontSize: 12, textAlign: 'center' },
};
