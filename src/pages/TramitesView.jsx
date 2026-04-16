import React from 'react';
import { useTramitesData } from '../hooks/useTramitesData';
import TramitesSidebar from '../components/tramites/TramitesSidebar';
import TramitesHeader from '../components/tramites/TramitesHeader';
import ContenidoEstudiante from '../components/tramites/ContenidoEstudiante';
import ContenidoDirector from '../components/tramites/ContenidoDirector';
import ContenidoAdmin from '../components/tramites/ContenidoAdmin';

const CONTENIDO_POR_ROL = {
  DIRECTOR: ContenidoDirector,
  ADMIN:    ContenidoAdmin,
};

const TramitesView = () => {
  const { usuario, cambiarRol, datosModulo, selectedMenuId, manejarSeleccion, rol, menuItems } =
    useTramitesData();

  const Contenido = CONTENIDO_POR_ROL[rol] || ContenidoEstudiante;

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
            <Contenido datosModulo={datosModulo} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default TramitesView;
