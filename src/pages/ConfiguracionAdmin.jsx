import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { convocatoriasApi } from '../api/convocatoriasApi';

const ConfiguracionAdmin = () => {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    convocatoriasApi.getActiva()
      .then((data) => {
        setFechaInicio(data.fechaInicio);
        setFechaFin(data.fechaFin);
      })
      .catch(() => setError('No se pudo cargar la convocatoria actual.'))
      .finally(() => setCargando(false));
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(false);
    setGuardando(true);
    try {
      await convocatoriasApi.actualizar(usuario.cedula, fechaInicio, fechaFin);
      setExito(true);
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="flex items-center justify-between gap-4 bg-slate-800 px-6 py-4 text-white shadow-sm md:px-8">
        <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">
          ADMINISTRADOR
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            {(usuario?.nombre || 'A').slice(0, 2).toUpperCase()}
          </div>
          <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
        </div>
      </header>

      <main className="mx-auto max-w-xl p-6 md:p-10">
        <button
          type="button"
          onClick={() => navigate('/tramites')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
          </svg>
          Volver al panel
        </button>

        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          ADMINISTRACIÓN / CONFIGURACIÓN
        </div>
        <h2 className="mb-1 text-3xl font-bold text-slate-900">Convocatoria</h2>
        <p className="mb-8 text-sm text-slate-500">
          Define el período en que los estudiantes pueden radicar su solicitud de Terminación de Materias.
        </p>

        {cargando && (
          <div className="flex items-center gap-3 text-slate-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm">Cargando configuración…</span>
          </div>
        )}

        {!cargando && (
          <form
            onSubmit={handleGuardar}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5">
              <label htmlFor="fechaInicio" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Fecha de inicio
              </label>
              <input
                id="fechaInicio"
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => { setFechaInicio(e.target.value); setExito(false); }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="mb-7">
              <label htmlFor="fechaFin" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Fecha de cierre
              </label>
              <input
                id="fechaFin"
                type="date"
                required
                value={fechaFin}
                onChange={(e) => { setFechaFin(e.target.value); setExito(false); }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {exito && (
              <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                Convocatoria actualizada correctamente.
              </div>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default ConfiguracionAdmin;
