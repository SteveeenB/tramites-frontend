import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getEstadoEstudiantes } from '../api/pazYSalvoApi';

const ETAPAS = [
  { key: 'CURSANDO',                label: 'Cursando',                color: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400'   },
  { key: 'REQUISITOS_COMPLETOS',    label: 'Requisitos completos',    color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400'   },
  { key: 'MATERIAS_TERMINADAS',     label: 'Materias terminadas',     color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { key: 'SOLICITUD_GRADO',         label: 'Solicitud de grado',      color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'  },
  { key: 'SOLICITUD_GRADO_APROBADA',label: 'Grado aprobado',          color: 'bg-sky-100 text-sky-700',       dot: 'bg-sky-500'    },
  { key: 'SOLICITUD_GRADO_RECHAZADA', label: 'Solicitud rechazada',   color: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
  { key: 'FECHA_GRADO_ASIGNADA',    label: 'Fecha de grado asignada', color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  { key: 'GRADUADO',                label: 'Graduado',                color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
];

// El badge usa etapaLabel del backend cuando viene (permite mostrar la fecha dinámica)
const EtapaBadge = ({ etapa, etapaLabel }) => {
  const cfg = ETAPAS.find(e => e.key === etapa) || ETAPAS[0];
  const label = etapaLabel || cfg.label;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {label}
    </span>
  );
};

const BarraProgreso = ({ creditos, total }) => {
  const pct = total > 0 ? Math.min(100, Math.round((creditos / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{creditos}/{total} cr.</span>
    </div>
  );
};

export default function EstadoEstudiantes() {
  const { usuario } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filtroEtapa, setFiltroEtapa] = useState('TODOS');
  const [busqueda, setBusqueda]       = useState('');

  const cargar = useCallback(async () => {
    if (!usuario?.cedula) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEstadoEstudiantes(usuario.cedula);
      setEstudiantes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [usuario?.cedula]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = estudiantes
    .filter(e => filtroEtapa === 'TODOS' || e.etapa === filtroEtapa)
    .filter(e => {
      const q = busqueda.toLowerCase();
      return !q || e.nombre?.toLowerCase().includes(q) || e.cedula?.includes(q) || e.codigo?.toLowerCase().includes(q);
    });

  const conteos = ETAPAS.reduce((acc, et) => {
    acc[et.key] = estudiantes.filter(e => e.etapa === et.key).length;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">Estado de Estudiantes</h2>
        <p className="text-sm text-slate-500">Seguimiento del proceso de grado por estudiante</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {ETAPAS.filter(e => conteos[e.key] > 0).map(et => (
          <button
            key={et.key}
            onClick={() => setFiltroEtapa(filtroEtapa === et.key ? 'TODOS' : et.key)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              filtroEtapa === et.key ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`text-3xl font-black mb-1 ${filtroEtapa === et.key ? 'text-blue-700' : 'text-gray-800'}`}>
              {conteos[et.key]}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${et.dot}`} />
              <span className="text-xs font-medium text-gray-600">{et.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, cédula o código..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {filtroEtapa !== 'TODOS' && (
          <button
            onClick={() => setFiltroEtapa('TODOS')}
            className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-200 font-medium"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No se encontraron estudiantes</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Estudiante</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Código</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Créditos</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Etapa actual</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((est, i) => (
                  <tr key={est.cedula}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{est.nombre}</div>
                      <div className="text-xs text-gray-400">{est.cedula}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{est.codigo || '—'}</td>
                    <td className="px-5 py-4 min-w-[140px]">
                      {est.totalCreditos > 0
                        ? <BarraProgreso creditos={est.creditosAprobados || 0} total={est.totalCreditos} />
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <EtapaBadge etapa={est.etapa} etapaLabel={est.etapaLabel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtrados.length} estudiante(s) · Total programa: {estudiantes.length}
          </div>
        </div>
      )}
    </div>
  );
}