import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaAccion from './TarjetaAccion';
import EncabezadoPagina from '../ui/EncabezadoPagina';
import { InboxIcon, HistoryIcon } from './icons';

const ContenidoDirector = ({ datosModulo }) => {
  const navigate     = useNavigate();
  const puedeAprobar = datosModulo?.acciones?.find((a) => a.codigo === 'APROBAR_SOLICITUD')?.habilitada;

  return (
    <>
      <EncabezadoPagina migas="Trámites / Director" titulo="Panel del Director" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<InboxIcon />}
          titulo="Bandeja de Solicitudes"
          descripcion="Gestiona las solicitudes de terminación de materias y de grado de los estudiantes de tu programa."
          etiqueta="Ver bandeja"
          onClick={() => navigate('/tramites/bandeja-solicitudes')}
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
