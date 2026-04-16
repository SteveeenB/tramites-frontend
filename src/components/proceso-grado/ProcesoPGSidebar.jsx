import React from 'react';
import { useNavigate } from 'react-router-dom';

const SidebarLink = ({ children, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
      active
        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

const ProcesoPGSidebar = ({ usuario }) => {
  const navigate = useNavigate();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex-1 px-5 py-6">
        {/* Info usuario */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-red-100 text-lg font-bold text-red-700">
            {(usuario?.nombre || 'E').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Estudiante</p>
            <p className="font-semibold text-slate-900">{usuario?.nombre}</p>
            {usuario?.programaAcademico && (
              <p className="mt-0.5 text-xs text-slate-500">{usuario.programaAcademico}</p>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="space-y-2">
          <SidebarLink>Información Estudiantil</SidebarLink>
          <SidebarLink>Información Académica</SidebarLink>
          <div className="rounded-2xl bg-slate-50 p-3">
            <SidebarLink active>Trámites</SidebarLink>
            <div className="mt-2 space-y-2 pl-3">
              <button
                type="button"
                className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 ring-1 ring-red-200"
              >
                Proceso de Grado
              </button>
              <SidebarLink onClick={() => navigate('/tramites')}>Certificados</SidebarLink>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default ProcesoPGSidebar;
