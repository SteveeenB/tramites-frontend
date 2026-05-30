import React, { useState } from 'react';
import PosgradosHeader from '../../components/posgrados/PosgradosHeader';
import AvisoMockup from '../../components/posgrados/AvisoMockup';

const ACCION_BADGE = {
  EDITAR_TIPO_CERTIFICADO: 'bg-blue-100 text-blue-700',
  APROBAR_SOLICITUD:       'bg-emerald-100 text-emerald-700',
  RECHAZAR_SOLICITUD:      'bg-red-100 text-red-700',
  CREAR_USUARIO:           'bg-amber-100 text-amber-700',
  MARCAR_ENTREGADO:        'bg-teal-100 text-teal-700',
  RESET_PASSWORD:          'bg-purple-100 text-purple-700',
};

const AUDITORIA_MOCK = [
  { id: 1024, fecha: '18/05/2026 14:32', actor: 'Coordinador Posgrados', rol: 'POSGRADOS', accion: 'EDITAR_TIPO_CERTIFICADO', entidad: 'TipoCertificado #2',     detalle: 'precioDigital: 6500 → 7200' },
  { id: 1023, fecha: '18/05/2026 14:18', actor: 'Maria Director',        rol: 'DIRECTOR',  accion: 'APROBAR_SOLICITUD',       entidad: 'Solicitud #87',         detalle: 'Estado: EN_REVISION → APROBADA_DIRECTOR' },
  { id: 1022, fecha: '18/05/2026 13:55', actor: 'Admisiones y Registro', rol: 'DEPENDENCIA', accion: 'MARCAR_ENTREGADO',      entidad: 'SolicitudCertificado #73', detalle: 'Estado: LISTO_RETIRO → ENTREGADO' },
  { id: 1021, fecha: '18/05/2026 11:40', actor: 'Coordinador Posgrados', rol: 'POSGRADOS', accion: 'CREAR_USUARIO',           entidad: 'Usuario 1098765499',    detalle: 'Rol: ESTUDIANTE, programa: M. Educación Matemáticas' },
  { id: 1020, fecha: '18/05/2026 10:12', actor: 'Carlos Vargas',         rol: 'DIRECTOR',  accion: 'RECHAZAR_SOLICITUD',      entidad: 'Solicitud #85',         detalle: 'Motivo: documentos incompletos' },
  { id: 1019, fecha: '17/05/2026 16:08', actor: 'Coordinador Posgrados', rol: 'POSGRADOS', accion: 'RESET_PASSWORD',          entidad: 'Usuario 1098765432',    detalle: 'Contraseña temporal enviada por correo' },
];

const SeccionAuditoria = () => {
  const [filtroAccion, setFiltroAccion] = useState('Todas');
  const mock = () => alert('Mockup — la exportación a CSV todavía no está implementada.');

  const acciones = ['Todas', ...new Set(AUDITORIA_MOCK.map((a) => a.accion))];
  const filtradas = filtroAccion === 'Todas'
    ? AUDITORIA_MOCK
    : AUDITORIA_MOCK.filter((a) => a.accion === filtroAccion);

  return (
    <div>
      <PosgradosHeader
        breadcrumb="Sistema / Auditoría"
        titulo="Auditoría"
        descripcion="Registro de todas las acciones críticas del sistema: quién, qué, cuándo. Imprescindible para compliance y resolución de disputas."
        accion={
          <button type="button" onClick={mock}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Exportar CSV
          </button>
        }
      />

      <AvisoMockup texto="Eventos simulados. Cuando se implemente el aspect de auditoría, todos los endpoints admin persistirán automáticamente en la tabla `auditoria`." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filtrar por acción:</span>
        {acciones.map((a) => (
          <button key={a} type="button" onClick={() => setFiltroAccion(a)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filtroAccion === a
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {a}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Actor</th>
              <th className="px-4 py-3 text-left">Acción</th>
              <th className="px-4 py-3 text-left">Entidad</th>
              <th className="px-4 py-3 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtradas.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">#{a.id}</td>
                <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{a.fecha}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{a.actor}</div>
                  <div className="text-xs text-slate-500">{a.rol}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ACCION_BADGE[a.accion] || 'bg-slate-100 text-slate-700'}`}>
                    {a.accion}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">{a.entidad}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{a.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeccionAuditoria;
