import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaAccion from '../components/tramites/TarjetaAccion';
import { InboxIcon } from '../components/tramites/icons';
import { GraduationIcon } from '../components/tramites/icons';

const BandejaSolicitudes = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        TRÁMITES / DIRECTOR
      </div>

      <h2 className="mb-2 text-3xl font-bold text-slate-900">Bandeja de Solicitudes</h2>
      <p className="mb-10 text-sm text-slate-500">
        Selecciona el tipo de bandeja que deseas gestionar.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<InboxIcon className="h-14 w-14" />}
          titulo="Terminación de Materias"
          descripcion="Revisa y aprueba las solicitudes de terminación de materias presentadas por los estudiantes de tu programa."
          etiqueta="Ver bandeja"
          onClick={() => navigate('/tramites/bandeja-director')}
        />

        <TarjetaAccion
          icono={<GraduationIcon className="h-14 w-14" />}
          titulo="Solicitudes de Grado"
          descripcion="Revisa y decide sobre las solicitudes de grado de los estudiantes de tu programa."
          etiqueta="Ver bandeja"
          onClick={() => navigate('/tramites/bandeja-director/grado')}
        />
      </div>
    </>
  );
};

export default BandejaSolicitudes;

