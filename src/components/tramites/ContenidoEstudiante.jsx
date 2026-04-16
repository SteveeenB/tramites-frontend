import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaAccion from './TarjetaAccion';
import { GraduationIcon, CertificateIcon } from './icons';

const ContenidoEstudiante = ({ datosModulo }) => {
  const navigate = useNavigate();
  const accionCrear = datosModulo?.acciones?.find((a) => a.codigo === 'CREAR_SOLICITUD');

  return (
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        TRÁMITES / ACADÉMICO
      </div>
      <h2 className="mb-7 text-3xl font-bold text-slate-900">Mis Trámites</h2>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<GraduationIcon />}
          titulo="Proceso de Grado"
          descripcion="Gestiona tu terminación de materias y solicitud de grado. Revisa el estado de tu proceso y los requisitos pendientes."
          etiqueta="Ir al proceso"
          onClick={() => navigate('/proceso-de-grado')}
        />
        <TarjetaAccion
          icono={<CertificateIcon />}
          titulo="Certificados Académicos"
          descripcion="Solicita certificados de notas, constancias de estudio y otros documentos académicos oficiales."
          etiqueta="Solicitar certificado"
          onClick={() => {}}
          deshabilitada={!accionCrear?.habilitada}
        />
      </div>
    </>
  );
};

export default ContenidoEstudiante;
