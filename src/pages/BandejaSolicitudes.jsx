import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import TarjetaAccion from '../components/tramites/TarjetaAccion';
import { InboxIcon } from '../components/tramites/icons';
import { GraduationIcon } from '../components/tramites/icons';

const BandejaSolicitudes = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
         <div className="flex min-h-screen flex-col lg:flex-row">
          <DirectorSidebar usuario={usuario} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 bg-blue-700 px-6 py-4 text-white shadow-sm md:px-8">
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">
              DIRECTOR DE PROGRAMA
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                D
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col p-6 md:p-8">
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default BandejaSolicitudes;

