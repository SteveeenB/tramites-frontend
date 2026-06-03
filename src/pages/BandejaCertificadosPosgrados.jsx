import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient, downloadApiClient } from '../api/apiClient';

const TABS = [
  { id: 'GENERADO',     label: 'Por imprimir' },
  { id: 'LISTO_RETIRO', label: 'Listos para entrega' },
  { id: 'ENTREGADO',    label: 'Entregados' },
  { id: 'TODOS',        label: 'Todos' },
];

const ESTADOS_BADGE = {
  GENERADO:     { label: 'Por imprimir',       className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' },
  LISTO_RETIRO: { label: 'Listo para retiro',  className: 'bg-teal-100    text-teal-700    ring-1 ring-teal-300'    },
  ENTREGADO:    { label: 'Entregado',          className: 'bg-slate-100   text-slate-600   ring-1 ring-slate-300'   },
  PENDIENTE_PAGO:{ label: 'Pendiente de pago', className: 'bg-amber-100   text-amber-700   ring-1 ring-amber-300'   },
  PAGADO:       { label: 'Pagado',             className: 'bg-blue-100    text-blue-700    ring-1 ring-blue-300'    },
};

const formatFecha = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function BandejaCertificadosPosgrados() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState('GENERADO');
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accionando, setAccionando] = useState(null);
  const [descargando, setDescargando] = useState(null);

  // Cargamos SIEMPRE todas las solicitudes y el filtrado por tab se hace
  // en cliente. Esto es lo que permite que los contadores de cada pestaña
  // ((0), (2), ...) reflejen el total real, no solo lo que cabe en el tab actual.
  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient(`/certificados/posgrados`);
      setSolicitudes(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleMarcarListo = async (id) => {
    setAccionando(id);
    setError(null);
    try {
      await apiClient(`/certificados/${id}/marcar-listo`, { method: 'POST' });
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setAccionando(null);
    }
  };

  const handleMarcarEntregado = async (id) => {
    setAccionando(id);
    setError(null);
    try {
      await apiClient(`/certificados/${id}/marcar-entregado`, { method: 'POST' });
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setAccionando(null);
    }
  };

  const handleDescargar = async (id) => {
    setDescargando(id);
    setError(null);
    try {
      const { blob } = await downloadApiClient(`/certificados/${id}/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `constancia-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setDescargando(null);
    }
  };

  const filtradas = solicitudes
    .filter((s) => tab === 'TODOS' || s.estado === tab)
    .filter((s) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (s.estudiante?.cedula || '').toLowerCase().includes(q) ||
             (s.estudiante?.nombre || '').toLowerCase().includes(q);
    });

  const conteo = (estado) => {
    if (estado === 'TODOS') return solicitudes.length;
    return solicitudes.filter((s) => s.estado === estado).length;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">Certificados</h2>
        <p className="text-sm text-slate-500">{usuario?.nombre}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs">({conteo(t.id)})</span>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por cédula o nombre del estudiante…"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando…</div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No hay solicitudes en este estado</div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-4 py-3 text-left">N°</th>
                  <th className="px-4 py-3 text-left">Cédula</th>
                  <th className="px-4 py-3 text-left">Estudiante</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Solicitado</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map((s, i) => {
                  const badge = ESTADOS_BADGE[s.estado] || { label: s.estado, className: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 align-top">
                      <td className="px-4 py-4 text-slate-500 font-semibold">{i + 1}</td>
                      <td className="px-4 py-4 text-slate-700 font-medium">{s.estudiante?.cedula || s.cedula}</td>
                      <td className="px-4 py-4 text-slate-700">{s.estudiante?.nombre || '—'}</td>
                      <td className="px-4 py-4 text-slate-700 max-w-xs">
                        <span className="line-clamp-2">{s.tipoLabel || s.tipoCertificado}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatFecha(s.fechaSolicitud)}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-stretch gap-1.5">
                          {(s.estado === 'GENERADO' || s.estado === 'LISTO_RETIRO' || s.estado === 'ENTREGADO') && (
                            <button
                              type="button"
                              onClick={() => handleDescargar(s.id)}
                              disabled={descargando === s.id}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                              {descargando === s.id ? 'Descargando…' : 'Descargar PDF'}
                            </button>
                          )}
                          {s.estado === 'GENERADO' && (
                            <button
                              type="button"
                              onClick={() => handleMarcarListo(s.id)}
                              disabled={accionando === s.id}
                              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-60"
                            >
                              {accionando === s.id ? '...' : 'Marcar listo para retiro'}
                            </button>
                          )}
                          {s.estado === 'LISTO_RETIRO' && (
                            <button
                              type="button"
                              onClick={() => handleMarcarEntregado(s.id)}
                              disabled={accionando === s.id}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {accionando === s.id ? '...' : 'Marcar entregado'}
                            </button>
                          )}
                          {s.estado === 'ENTREGADO' && (
                            <span className="text-xs text-slate-400 text-center">
                              {formatFecha(s.fechaEntrega)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
