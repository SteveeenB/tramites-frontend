import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBandejaDirector } from '../hooks/useBandejaDirector';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Alerta, Badge, Cargando, EncabezadoPagina, TarjetaEstadistica } from '../components/ui';

const SECCIONES = [
  { key: 'pendientes', titulo: 'Solicitudes Pendientes', descripcion: 'Esperando revisión y aprobación',   icono: ClockIcon,       tono: 'advertencia' },
  { key: 'aprobadas',  titulo: 'Solicitudes Aprobadas',  descripcion: 'Trámites aprobados exitosamente',  icono: CheckCircleIcon, tono: 'exito' },
  { key: 'rechazadas', titulo: 'Solicitudes Rechazadas', descripcion: 'Trámites que no fueron aprobados', icono: XCircleIcon,     tono: 'error' },
];

const BandejaDirector = () => {
  const navigate = useNavigate();
  const { bandeja, cargando, error } = useBandejaDirector();

  const total = cargando ? 0 : Object.values(bandeja).reduce((s, arr) => s + arr.length, 0);

  return (
    <>
      <EncabezadoPagina
        migas="Trámites / Director / Solicitudes / Terminación de materias"
        titulo="Bandeja de Terminación de materias"
        etiqueta={!cargando && !error && <Badge tono="error">{total} total</Badge>}
        descripcion="Gestiona las solicitudes de Terminación de Materias de los estudiantes de tu programa."
      />

      {cargando && <Cargando texto="Cargando bandeja…" />}

      {error && <Alerta tipo="error">{error}</Alerta>}

      {!cargando && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          {SECCIONES.map((sec) => {
            const cantidad = bandeja[sec.key].length;
            return (
              <TarjetaEstadistica
                key={sec.key}
                icono={sec.icono}
                tono={sec.tono}
                titulo={sec.titulo}
                valor={cantidad}
                unidad={`solicitud${cantidad !== 1 ? 'es' : ''}`}
                descripcion={sec.descripcion}
                onClick={() => navigate(`/tramites/bandeja-director/${sec.key}`)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default BandejaDirector;
