import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTramitesData } from '../hooks/useTramitesData';
import PanelLayout from '../components/layout/PanelLayout';
import ContenidoEstudiante from '../components/tramites/ContenidoEstudiante';
import ContenidoDirector from '../components/tramites/ContenidoDirector';
import BandejaDependencia from './BandejaDependencia';
import PazYSalvoDirector from './PazYSalvoDirector';
import EstadoEstudiantes from './EstadoEstudiantes';
import BandejaPosgrados from './BandejaPosgrados';
import BandejaCertificadosPosgrados from './BandejaCertificadosPosgrados';
// FIX TP-193 (Johan Bueno, 07/10/2026): la pestaña Convocatorias se retira
// del admin; SeccionConvocatoria se elimina del repo.
import {
  SeccionTiposCertificado,
  SeccionTiposTramite,
  SeccionDependencias,
  SeccionPlantillasCertificado,
  SeccionFechasGrado,
} from './posgrados';

const CONTENIDO_POR_ROL = {
  DIRECTOR: ContenidoDirector,
};

// Pestañas exclusivas del ADMIN (configurador) — coinciden con los IDs
// definidos en MENU_BY_ROLE.ADMIN en menuConfig.js.
const ADMIN_SECCIONES = {
  'tipos-tramite':           SeccionTiposTramite,
  'tipos-certificado':       SeccionTiposCertificado,
  'dependencias':            SeccionDependencias,
  'plantillas-certificado':  SeccionPlantillasCertificado,
};

// Pestañas del POSGRADOS (operativo) — bandeja, paz y salvos, certificados, tarifas.
const POSGRADOS_SECCIONES = {
  'bandeja-posgrados': BandejaPosgrados,
  'paz-y-salvos':      BandejaDependencia,
  'certificados':      BandejaCertificadosPosgrados,
  'tipos-tramite':     SeccionTiposTramite,
  'fechas-grado':      SeccionFechasGrado,
};

const TramitesView = () => {
  const { usuario, datosModulo, selectedMenuId, manejarSeleccion, rol, menuItems } =
    useTramitesData();
  const location = useLocation();
  const esRutaRaiz = location.pathname === '/tramites' || location.pathname === '/tramites/';

  const renderContenido = () => {
    // DEPENDENCIA
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
    <PanelLayout
      usuario={usuario}
      rol={rol}
      menuItems={menuItems}
      selectedMenuId={selectedMenuId}
      onSeleccion={manejarSeleccion}
    >
      {esRutaRaiz ? renderContenido() : <Outlet />}
    </PanelLayout>
  );
};

export default TramitesView;
