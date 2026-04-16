import React from 'react';
import TarjetaAccion from './TarjetaAccion';
import { InboxIcon, HistoryIcon } from './icons';

const ContenidoDirector = ({ datosModulo }) => {
  const puedeAprobar = datosModulo?.acciones?.find((a) => a.codigo === 'APROBAR_SOLICITUD')?.habilitada;

  return (
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        TRÁMITES / DIRECTOR
      </div>
      <h2 className="mb-7 text-3xl font-bold text-slate-900">Panel del Director</h2>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<InboxIcon />}
          titulo="Bandeja de Aprobación"
          descripcion="Revisa y aprueba las solicitudes de terminación de materias presentadas por los estudiantes del programa."
          etiqueta="Ver solicitudes"
          onClick={() => {}}
          deshabilitada={!puedeAprobar}
        />
        <TarjetaAccion
          icono={<HistoryIcon />}
          titulo="Historial de Decisiones"
          descripcion="Consulta el registro histórico de las solicitudes aprobadas y rechazadas."
          etiqueta="Ver historial"
          onClick={() => {}}
        />
      </div>
    </>
  );
};

export default ContenidoDirector;
