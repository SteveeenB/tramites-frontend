import React, { useState, useEffect } from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import { tiposSolicitudApi } from '../../api/tiposSolicitudApi';

const formatPesos = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

/* ─── Modal de edición de costo ─────────────────────────────────────── */
const ModalEditarCosto = ({ tipo, onGuardar, onCancelar }) => {
  const [costo, setCosto] = useState(String(tipo.costo ?? ''));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleGuardar = async () => {
    const num = parseFloat(costo);
    if (isNaN(num) || num < 0) { setError('Ingresa un valor numérico válido'); return; }
    setGuardando(true);
    setError(null);
    try {
      const actualizado = await tiposSolicitudApi.actualizar(tipo.id, { costo: num });
      onGuardar(actualizado);
    } catch (e) {
      setError(e.message || 'Error al guardar');
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onCancelar(); }}>
      <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-bold text-slate-900">Editar costo</h3>
        <p className="mb-5 text-sm text-slate-500">{tipo.nombre}</p>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Nuevo costo (COP)
        </label>
        <input
          type="number"
          min="0"
          step="1000"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          className="mb-4 w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
          autoFocus
        />

        {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onCancelar} disabled={guardando}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancelar
          </button>
          <button type="button" onClick={handleGuardar} disabled={guardando}
            className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Sección principal ─────────────────────────────────────────────── */
const SeccionTiposTramite = () => {
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    tiposSolicitudApi.getAll()
      .then(setTipos)
      .catch((e) => setError(e.message || 'Error al cargar los tipos de trámite'))
      .finally(() => setCargando(false));
  }, []);

  const handleGuardado = (actualizado) => {
    setTipos((prev) => prev.map((t) => (t.id === actualizado.id ? actualizado : t)));
    setEditando(null);
  };

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Catálogos / Tipos de Trámite"
        titulo="Tipos de Trámite"
        descripcion="Configura los costos de los trámites disponibles."
      />

      {cargando && (
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm">Cargando tipos de trámite…</span>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}

      {!cargando && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-right">Costo</th>
                <th className="px-4 py-3 text-center">Activo</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tipos.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{t.codigo}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.nombre}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatPesos(t.costo)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      t.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {t.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditando(t)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      Editar costo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <ModalEditarCosto
          tipo={editando}
          onGuardar={handleGuardado}
          onCancelar={() => setEditando(null)}
        />
      )}
    </div>
  );
};

export default SeccionTiposTramite;
