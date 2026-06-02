import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTramitesEnVivo } from '../hooks/useTramitesEnVivo';
import { tramitesApi } from '../api/tramitesApi';

// ── Paleta ESTUDIANTE (rojo institucional) ────────────────────────────
const BADGE = {
  PENDIENTE_PAGO:    { label: 'Pendiente de pago',    className: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' },
  EN_REVISION:       { label: 'En revisión',           className: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' },
  APROBADA_DIRECTOR: { label: 'Aprobada por director', className: 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' },
  APROBADA:          { label: 'Aprobada',              className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' },
  APROBADA_POSGRADOS:{ label: 'Aprobada por posgrados',className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' },
  RECHAZADA:         { label: 'Rechazada',             className: 'bg-red-100 text-red-700 ring-1 ring-red-300' },
  RECHAZADA_POSGRADOS:{ label: 'Rechazada por posgrados', className: 'bg-red-100 text-red-700 ring-1 ring-red-300' },
  PAGADO:            { label: 'Pagado',                className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' },
  GENERADO:          { label: 'Generado',              className: 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' },
  ENTREGADO:         { label: 'Entregado',             className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300' },
};

const ESTADOS_FINALES = ['APROBADA', 'RECHAZADA', 'RECHAZADA_POSGRADOS', 'GENERADO', 'ENTREGADO'];

const fmtFecha = (f) => {
  if (!f) return '—';
  try {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return f; }
};

const fmtTipo = (tipo) => {
  if (!tipo) return '—';
  if (tipo.startsWith('CERTIFICADO_')) return 'Certificado — ' + tipo.replace('CERTIFICADO_', '').replace(/_/g, ' ');
  if (tipo === 'TERMINACION_MATERIAS') return 'Terminación de Materias';
  if (tipo === 'GRADO') return 'Proceso de Grado';
  return tipo;
};

// ── Badge ─────────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const cfg = BADGE[estado] || { label: estado, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ── Timeline ──────────────────────────────────────────────────────────
const TimelineTramite = ({ historial, cargando }) => {
  if (cargando) return (
    <div className="py-4 text-center text-xs text-slate-400">Cargando historial...</div>
  );
  if (!historial.length) return (
    <div className="py-4 text-center text-xs text-slate-400">Sin historial registrado aún.</div>
  );

  return (
    <ol className="relative border-l border-slate-200 ml-3 space-y-4 mt-3">
      {historial.map((h) => (
        <li key={h.id} className="ml-4">
          <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-red-500" />
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <EstadoBadge estado={h.estadoNuevo} />
            <span className="text-xs text-slate-400">
              {h.fechaCambio
                ? new Date(h.fechaCambio).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                : '—'}
            </span>
          </div>
          {h.observaciones && (
            <p className="text-xs text-slate-500 mt-0.5">{h.observaciones}</p>
          )}
          {h.actor && (
            <p className="text-xs text-slate-400">Actor: {h.actor} ({h.rolActor})</p>
          )}
        </li>
      ))}
    </ol>
  );
};

// ── Card de trámite ───────────────────────────────────────────────────
const TarjetaTramite = ({ tramite }) => {
  const [expandido, setExpandido] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const toggleHistorial = async () => {
    if (!expandido && historial.length === 0) {
        setCargandoHistorial(true);
        try {
            // Solo cargar historial para solicitudes de terminación y grado
            // Los certificados aún no tienen historial implementado
            if (!tramite.tipo.startsWith('CERTIFICADO_')) {
                const data = await tramitesApi.getHistorial(tramite.id);
                setHistorial(data || []);
            }
        } catch (_) {}
        finally { setCargandoHistorial(false); }
    }
    setExpandido(!expandido);
};

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-slate-900 text-sm">{fmtTipo(tramite.tipo)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Radicado: {tramite.id}</p>
        </div>
        <EstadoBadge estado={tramite.estado} />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
        <span>Fecha: {fmtFecha(tramite.fechaSolicitud)}</span>
        <span className="text-right">
          Costo: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(tramite.costo ?? 0)}
        </span>
        {tramite.observaciones && (
          <span className="col-span-2 text-slate-400 truncate">{tramite.observaciones}</span>
        )}
      </div>

      {/* Botón historial */}
      <button
    type="button"
    onClick={toggleHistorial}
    className="text-xs font-semibold text-red-600 hover:underline"
>
    {expandido ? '▲ Ocultar historial' : '▼ Ver historial'}
</button>

{expandido && (
    tramite.tipo.startsWith('CERTIFICADO_') ? (
        <p className="mt-3 text-xs text-slate-400 text-center">
            El historial de certificados estará disponible próximamente.
        </p>
    ) : (
        <TimelineTramite historial={historial} cargando={cargandoHistorial} />
    )
)}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────
export default function MisTramites() {
  const navigate = useNavigate();
  const { tramites, cargando, error, conectado, recargar } = useTramitesEnVivo();
  const [tab, setTab] = useState('activos');

  const { activos, historicos } = useMemo(() => {
    const activos = tramites.filter((t) => !ESTADOS_FINALES.includes(t.estado));
    const historicos = tramites.filter((t) => ESTADOS_FINALES.includes(t.estado));
    return { activos, historicos };
  }, [tramites]);

  const lista = tab === 'activos' ? activos : historicos;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          ESTUDIANTE / MIS TRÁMITES
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Mis Trámites</h2>
          <div className="flex items-center gap-2">
            {/* Indicador SSE */}
            <span className={`h-2 w-2 rounded-full ${conectado ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            <span className="text-xs text-slate-400">{conectado ? 'En vivo' : 'Sin conexión'}</span>
            <button
              type="button"
              onClick={recargar}
              className="text-xs font-semibold text-red-600 hover:underline ml-2"
            >
              ↺ Actualizar
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Seguimiento en tiempo real de tus trámites académicos
        </p>
      </div>

      {/* Tabs activos / históricos */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 mb-6">
        {[
          { key: 'activos',   label: `Activos (${activos.length})` },
          { key: 'historicos', label: `Históricos (${historicos.length})` },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <svg className="h-5 w-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando trámites…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <button onClick={recargar} className="text-sm font-semibold text-red-600 hover:underline">
            Reintentar
          </button>
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
          <p className="text-sm font-medium">
            {tab === 'activos' ? 'No tienes trámites activos' : 'Sin trámites históricos'}
          </p>
          <p className="text-xs mt-1">
            {tab === 'activos' && 'Cuando inicies un trámite aparecerá aquí.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lista.map((t) => (
            <TarjetaTramite key={`${t.tipo}-${t.id}`} tramite={t} />
          ))}
        </div>
      )}

      {/* Volver */}
      <button
        type="button"
        onClick={() => navigate('/tramites')}
        className="mt-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        ← Volver a Trámites
      </button>
    </div>
  );
}