import React from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const formatPesos = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const METRICAS = [
  { label: 'Solicitudes activas',         valor: 47,         tendencia: '+12% vs mes anterior', color: 'bg-blue-50 text-blue-700' },
  { label: 'Certificados emitidos (mes)', valor: 124,        tendencia: '+8% vs mes anterior',  color: 'bg-emerald-50 text-emerald-700' },
  { label: 'Solicitudes de grado',        valor: 18,         tendencia: '−3% vs mes anterior',  color: 'bg-purple-50 text-purple-700' },
  { label: 'Ingresos del mes',            valor: 8420000,    tendencia: '+18% vs mes anterior', color: 'bg-amber-50 text-amber-700', moneda: true },
];

const TIEMPOS = [
  { director: 'Maria Director',  programa: 'M. Gerencia de Empresas',           solicitudes: 23, promedioDias: 2.4 },
  { director: 'Carlos Vargas',   programa: 'M. TIC aplicadas a la Educación',   solicitudes: 17, promedioDias: 4.1 },
  { director: 'Andrea Méndez',   programa: 'M. Ciencias Biológicas',            solicitudes:  9, promedioDias: 3.0 },
  { director: 'Roberto Posada',  programa: 'D. Educación',                      solicitudes:  6, promedioDias: 5.8 },
];

const INGRESOS = [
  { tramite: 'Solicitud de Grado',            cantidad: 18, total: 5040000 },
  { tramite: 'Terminación de Materias',       cantidad: 12, total: 1800000 },
  { tramite: 'Constancia Registro Calificado', cantidad: 47, total:  413600 },
  { tramite: 'Constancia Matrícula',          cantidad: 65, total:  422500 },
  { tramite: 'Constancia Buena Conducta',     cantidad: 12, total:   86400 },
];

const SeccionReportes = () => {
  const mock = () => alert('Mockup — la exportación a CSV todavía no está implementada.');

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Operación / Reportes"
        titulo="Reportes y Dashboard"
        descripcion="Indicadores clave de la gestión de posgrados. Filtros por rango de fechas, programa y tipo de trámite. Exporta cualquier listado a CSV."
        accion={
          <button type="button" onClick={mock}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Exportar CSV
          </button>
        }
      />

      <AvisoMockup texto="Métricas simuladas. Cuando se conecten los endpoints, los números se calcularán a partir de las solicitudes reales del periodo." />

      {/* Cards de métricas */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICAS.map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">{m.label}</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {m.moneda ? formatPesos(m.valor) : m.valor}
            </p>
            <p className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${m.color}`}>
              {m.tendencia}
            </p>
          </div>
        ))}
      </div>

      {/* Tiempos de aprobación por director */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-900">Tiempos de aprobación por director</h3>
          <p className="text-xs text-slate-500">Promedio de días desde la radicación hasta la decisión.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-4 py-3 text-left">Director</th>
                <th className="px-4 py-3 text-left">Programa</th>
                <th className="px-4 py-3 text-right">Solicitudes</th>
                <th className="px-4 py-3 text-right">Promedio (días)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TIEMPOS.map((t) => (
                <tr key={t.director} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{t.director}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{t.programa}</td>
                  <td className="px-4 py-3 text-right text-slate-800">{t.solicitudes}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      t.promedioDias <= 3 ? 'bg-emerald-100 text-emerald-700' :
                      t.promedioDias <= 5 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t.promedioDias.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingresos por trámite */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-900">Ingresos por trámite (mes actual)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-4 py-3 text-left">Trámite</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-right">Total recaudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INGRESOS.map((i) => (
                <tr key={i.tramite} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{i.tramite}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{i.cantidad}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatPesos(i.total)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td className="px-4 py-3 text-slate-800">Total</td>
                <td className="px-4 py-3 text-right text-slate-800">
                  {INGRESOS.reduce((s, i) => s + i.cantidad, 0)}
                </td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatPesos(INGRESOS.reduce((s, i) => s + i.total, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeccionReportes;
