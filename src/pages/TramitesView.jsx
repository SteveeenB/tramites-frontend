import React from 'react';
import { useTramitesData } from '../hooks/useTramitesData';
import TramitesSidebar from '../components/tramites/TramitesSidebar';
import TramitesHeader from '../components/tramites/TramitesHeader';
import ContenidoEstudiante from '../components/tramites/ContenidoEstudiante';
import ContenidoDirector from '../components/tramites/ContenidoDirector';
import ContenidoAdmin from '../components/tramites/ContenidoAdmin';
import BandejaDependencia from './BandejaDependencia';
import PazYSalvoDirector from './PazYSalvoDirector';
import EstadoEstudiantes from './EstadoEstudiantes';

const CONTENIDO_POR_ROL = {
  DIRECTOR: ContenidoDirector,
  ADMIN:    ContenidoAdmin,
};

const TramitesView = () => {
  const { usuario, cambiarRol, datosModulo, selectedMenuId, manejarSeleccion, rol, menuItems } =
    useTramitesData();

  // Contenido inline según rol y menú seleccionado
  const renderContenido = () => {
    if (rol === 'DEPENDENCIA') return <BandejaDependencia />;
    if (rol === 'DIRECTOR' && selectedMenuId === 'paz-y-salvo') return <PazYSalvoDirector />;
    if (rol === 'DIRECTOR' && selectedMenuId === 'estado-estudiantes') return <EstadoEstudiantes />;
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