import React from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const formatPesos = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const TIPOS_TRAMITE_MOCK = [
  { codigo: 'TERMINACION_MATERIAS', nombre: 'Terminación de Materias', precio: 150000, plazoPago: 5, director: true,  posgrados: true,  pazysalvos: false, activo: true },
  { codigo: 'GRADO',                nombre: 'Solicitud de Grado',      precio: 280000, plazoPago: 7, director: true,  posgrados: true,  pazysalvos: true,  activo: true },
  { codigo: 'CEREMONIA_GRADO',      nombre: 'Ceremonia de Grado',      precio: 120000, plazoPago: 3, director: false, posgrados: true,  pazysalvos: false, activo: true },
  { codigo: 'CANCELACION',          nombre: 'Cancelación de Semestre', precio: 0,      plazoPago: 0, director: true,  posgrados: true,  pazysalvos: false, activo: false },
];

const Check = ({ on }) => (
  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
    on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
  }`}>
    {on ? '✓' : '—'}
  </span>
);

const SeccionTiposTramite = () => {
  const mock = () => alert('Mockup — esta acción no persiste. Backend pendiente.');

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Catálogos / Tipos de Trámite"
        titulo="Tipos de Trámite"
        descripcion="Configura los trámites disponibles, sus precios y qué workflow de aprobación requiere cada uno (director, posgrados, paz y salvos)."
        accion={
          <button type="button" onClick={mock}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            + Nuevo tipo
          </button>
        }
      />

      <AvisoMockup texto="Cuando se integre con la BD oficial, este catálogo se moverá a su tabla `tipos_solicitudes` y solo editaremos campos de precio y workflow." />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Plazo pago (días)</th>
              <th className="px-4 py-3 text-center">Director</th>
              <th className="px-4 py-3 text-center">Posgrados</th>
              <th className="px-4 py-3 text-center">Paz y Salvos</th>
              <th className="px-4 py-3 text-center">Activo</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TIPOS_TRAMITE_MOCK.map((t) => (
              <tr key={t.codigo} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{t.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{t.nombre}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatPesos(t.precio)}</td>
                <td className="px-4 py-3 text-center text-slate-600">{t.plazoPago || '—'}</td>
                <td className="px-4 py-3 text-center"><Check on={t.director} /></td>
                <td className="px-4 py-3 text-center"><Check on={t.posgrados} /></td>
                <td className="px-4 py-3 text-center"><Check on={t.pazysalvos} /></td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    t.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {t.activo ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={mock} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeccionTiposTramite;
