import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaAccion from '../components/tramites/TarjetaAccion';
import { GraduationIcon, InboxIcon } from '../components/tramites/icons';
import EncabezadoPagina from '../components/ui/EncabezadoPagina';

const BandejaSolicitudes = () => {
  const navigate = useNavigate();

  return (
    <>
      <EncabezadoPagina
        migas="Trámites / Director"
        titulo="Bandeja de Solicitudes"
        descripcion="Selecciona el tipo de bandeja que deseas gestionar."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<InboxIcon className="h-6 w-6" />}
          titulo="Terminación de Materias"
          descripcion="Revisa y aprueba las solicitudes de terminación de materias presentadas por los estudiantes de tu programa."
          etiqueta="Ver bandeja"
          onClick={() => navigate('/tramites/bandeja-director')}
        />

        <TarjetaAccion
          icono={<GraduationIcon className="h-6 w-6" />}
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

