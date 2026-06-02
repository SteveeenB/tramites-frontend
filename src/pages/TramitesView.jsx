import React from 'react';
import { useTramitesData } from '../hooks/useTramitesData';
import TramitesSidebar from '../components/tramites/TramitesSidebar';
import TramitesHeader from '../components/tramites/TramitesHeader';
import ContenidoEstudiante from '../components/tramites/ContenidoEstudiante';
import ContenidoDirector from '../components/tramites/ContenidoDirector';
import BandejaDependencia from './BandejaDependencia';
import BandejaCertificadosDependencia from './BandejaCertificadosDependencia';
import PazYSalvoDirector from './PazYSalvoDirector';
import EstadoEstudiantes from './EstadoEstudiantes';
import BandejaPosgrados from './BandejaPosgrados';
import MisTramites from './MisTramites';
import {
  SeccionConvocatoria,
  SeccionTiposCertificado,
  SeccionUsuarios,
  SeccionProgramas,
  SeccionDependencias,
  SeccionPlantillasCorreo,
  SeccionDocumentosRequeridos,
  SeccionTiposTramite,
  SeccionReportes,
  SeccionAuditoria,
  SeccionConfiguracionGlobal,
} from './posgrados';

const CONTENIDO_POR_ROL = {
  DIRECTOR: ContenidoDirector,
};

const ADMIN_SECCIONES = {
  'reportes':              SeccionReportes,
  'tipos-certificado':     SeccionTiposCertificado,
  'tipos-tramite':         SeccionTiposTramite,
  'dependencias':          SeccionDependencias,
  'documentos-requeridos': SeccionDocumentosRequeridos,
  'usuarios':              SeccionUsuarios,
  'programas':             SeccionProgramas,
  'convocatorias':         SeccionConvocatoria,
  'plantillas-correo':     SeccionPlantillasCorreo,
  'auditoria':             SeccionAuditoria,
  'configuracion-global':  SeccionConfiguracionGlobal,
};

const POSGRADOS_SECCIONES = {
  'bandeja-posgrados': BandejaPosgrados,
  'reportes':          SeccionReportes,
};

const TramitesView = () => {
  const { usuario, cambiarRol, datosModulo, selectedMenuId, manejarSeleccion, rol, menuItems } =
    useTramitesData();

  const renderContenido = () => {
    // DEPENDENCIA
    if (rol === 'DEPENDENCIA' && selectedMenuId === 'certificados') return <BandejaCertificadosDependencia />;
    if (rol === 'DEPENDENCIA') return <BandejaDependencia />;

    // DIRECTOR
    if (rol === 'DIRECTOR' && selectedMenuId === 'paz-y-salvo')        return <PazYSalvoDirector />;
    if (rol === 'DIRECTOR' && selectedMenuId === 'estado-estudiantes') return <EstadoEstudiantes />;

    // POSGRADOS
    if (rol === 'POSGRADOS') {
      const Seccion = POSGRADOS_SECCIONES[selectedMenuId] || BandejaPosgrados;
      return <Seccion />;
    }

    // ADMIN
    if (rol === 'ADMIN') {
      const Seccion = ADMIN_SECCIONES[selectedMenuId] || SeccionTiposCertificado;
      return <Seccion />;
    }

    // ESTUDIANTE
if (rol === 'ESTUDIANTE' && selectedMenuId === 'mis-tramites') return <MisTramites />;

// Default por rol — incluye selectedMenuId === '' para ESTUDIANTE
const Contenido = CONTENIDO_POR_ROL[rol] || ContenidoEstudiante;
return <Contenido datosModulo={datosModulo} />;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <TramitesSidebar
          usuario={usuario}
          rol={rol}
          menuItems={menuItems}
          selectedMenuId={selectedMenuId}
          onSeleccion={manejarSeleccion}
          cambiarRol={cambiarRol}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TramitesHeader usuario={usuario} rol={rol} />
          <main className="flex-1 p-6 md:p-8">
            {renderContenido()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TramitesView;