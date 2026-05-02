import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarLink = ({ children, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
      active
        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

const DirectorSidebar = ({ usuario }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;

  const enBandejaSolicitudes = path.startsWith('/tramites/bandeja') && !path.includes('/proceso') && !path.includes('/certif');
  const enTerminacion = path.startsWith('/tramites/bandeja-director') && !path.includes('/grado');
  const enGrado       = path.includes('/bandeja-director/grado');

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex-1 px-5 py-6">
        {/* Info usuario */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            {(usuario?.nombre || 'D').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Director de Programa
            </p>
            <p className="truncate font-semibold text-slate-900">{usuario?.nombre}</p>
            {usuario?.programaAcademico && (
              <p className="mt-0.5 truncate text-xs text-slate-500">{usuario.programaAcademico}</p>
            )}
          </div>
        </div>

         {/* Navegación */}
         <nav className="space-y-2">
           <SidebarLink onClick={() => navigate('/tramites')}>Trámites</SidebarLink>

           {/* Bandeja de Solicitudes */}
           <div className="rounded-2xl bg-slate-50 p-3">
             <button type="button"
               className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                 enBandejaSolicitudes ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'text-slate-700'
               }`}
               onClick={() => navigate('/tramites/bandeja-solicitudes')}
             >
               Bandeja de Solicitudes
             </button>
             <div className="mt-2 space-y-1 pl-3">
               <SidebarLink
                 active={enTerminacion}
                 onClick={() => navigate('/tramites/bandeja-director')}
               >
                 Terminación de Materias
               </SidebarLink>
               <SidebarLink
                 active={enGrado}
                 onClick={() => navigate('/tramites/bandeja-director/grado')}
               >
                 Solicitudes de Grado
               </SidebarLink>
             </div>
           </div>
         </nav>
      </div>
    </aside>
  );
};

export default DirectorSidebar;
