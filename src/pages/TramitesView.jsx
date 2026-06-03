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
import {
  SeccionConvocatoria,
  SeccionTiposCertificado,
  SeccionUsuarios,
  SeccionProgramas,
  SeccionDependencias,
  SeccionPlantillasCorreo,
  SeccionPlantillasCertificado,
  SeccionDocumentosRequeridos,
  SeccionTiposTramite,
  SeccionReportes,
  SeccionAuditoria,
  SeccionConfiguracionGlobal,
} from './posgrados';

const CONTENIDO_POR_ROL = {
  DIRECTOR: ContenidoDirector,
};

// Pestañas exclusivas del ADMIN (configurador) — coinciden con los IDs
// definidos en MENU_BY_ROLE.ADMIN en menuConfig.js.
const ADMIN_SECCIONES = {
  'reportes':              SeccionReportes,
  'tipos-certificado':     SeccionTiposCertificado,
  'tipos-tramite':         SeccionTiposTramite,
  'dependencias':          SeccionDependencias,
  'documentos-requeridos': SeccionDocumentosRequeridos,
  'usuarios':              SeccionUsuarios,
  'programas':             SeccionProgramas,
  'convocatorias':         SeccionConvocatoria,
  'plantillas-correo':       SeccionPlantillasCorreo,
  'plantillas-certificado':  SeccionPlantillasCertificado,
  'auditoria':             SeccionAuditoria,
  'configuracion-global':  SeccionConfiguracionGlobal,
};

// Pestañas del POSGRADOS (operativo) — bandeja y reportes únicamente.
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

    // POSGRADOS (operativo) — solo atiende bandejas y consulta reportes.
    if (rol === 'POSGRADOS') {
      const Seccion = POSGRADOS_SECCIONES[selectedMenuId] || BandejaPosgrados;
      return <Seccion />;
    }

    // ADMIN (configurador) — sidebar con todas las pestañas de configuración.
    if (rol === 'ADMIN') {
      const Seccion = ADMIN_SECCIONES[selectedMenuId] || SeccionTiposCertificado;
      return <Seccion />;
    }

    // Default por rol
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
