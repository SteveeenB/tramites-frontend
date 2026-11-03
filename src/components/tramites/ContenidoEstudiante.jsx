import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaAccion from './TarjetaAccion';
import EncabezadoPagina from '../ui/EncabezadoPagina';
import { GraduationIcon, CertificateIcon } from './icons';

const ContenidoEstudiante = ({ datosModulo }) => {
  const navigate = useNavigate();
  const accionCrear = datosModulo?.acciones?.find((a) => a.codigo === 'CREAR_SOLICITUD');

  return (
    <>
      <EncabezadoPagina migas="Trámites / Académico" titulo="Mis Trámites" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          onClick={() => navigate('/certificados')}
          deshabilitada={!accionCrear?.habilitada}
        />
      </div>
    </>
  );
};

export default ContenidoEstudiante;
