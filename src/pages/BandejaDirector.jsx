import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBandejaDirector } from '../hooks/useBandejaDirector';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import { ClockIcon, XCircleIcon, CheckCircleIcon } from '../components/bandeja-director/icons';

const SECCIONES = [
  {
    key:   'pendientes',
    icono: <ClockIcon className="h-12 w-12" />,
    bg:    'bg-amber-400 hover:bg-amber-500',
  },
  {
    key:   'rechazadas',
    icono: <XCircleIcon className="h-12 w-12" />,
    bg:    'bg-red-400 hover:bg-red-500',
  },
  {
    key:   'aprobadas',
    icono: <CheckCircleIcon className="h-12 w-12" />,
    bg:    'bg-green-500 hover:bg-green-600',
  },
];

const BandejaDirector = () => {
  const navigate = useNavigate();
  const { usuario, bandeja, cargando, error } = useBandejaDirector();

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
                {(usuario?.nombre || 'D').slice(0, 2).toUpperCase()}
              </div>
              <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
            </div>
          </header>

          <main className="flex flex-1 flex-col p-6 md:p-8">
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              TRÁMITES / DIRECTOR / TERMINACIÓN DE MATERIAS
            </div>
            <h2 className="mb-8 text-3xl font-bold text-slate-900">Bandeja de Aprobación</h2>

            {cargando && (
              <p className="text-slate-500">Cargando bandeja…</p>
            )}
            {error && (
              <p className="font-medium text-red-600">{error}</p>
            )}

            {!cargando && !error && (
              <div className="grid flex-1 gap-6 sm:grid-cols-3">
                {SECCIONES.map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => navigate(`/bandeja-director/${sec.key}`)}
                    className={`flex flex-col items-center justify-center gap-5 rounded-3xl p-10 text-white shadow-md transition hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] ${sec.bg}`}
                  >
                    <div className="opacity-90">{sec.icono}</div>
                    <span className="text-6xl font-bold">{bandeja[sec.key].length}</span>
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] opacity-90">
                      {sec.key}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BandejaDirector;
