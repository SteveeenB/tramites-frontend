import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBandejaDirector } from '../hooks/useBandejaDirector';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../components/bandeja-director/icons';

const SECCIONES = [
  {
    key:         'pendientes',
    titulo:      'Solicitudes Pendientes',
    descripcion: 'Esperando revisión y aprobación',
    icono:       <ClockIcon className="h-14 w-14" />,
    bg:          'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',
    sombra:      'shadow-amber-200',
    anillo:      'ring-amber-300',
  },
  {
    key:         'aprobadas',
    titulo:      'Solicitudes Aprobadas',
    descripcion: 'Trámites aprobados exitosamente',
    icono:       <CheckCircleIcon className="h-14 w-14" />,
    bg:          'bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700',
    sombra:      'shadow-green-200',
    anillo:      'ring-green-300',
  },
  {
    key:         'rechazadas',
    titulo:      'Solicitudes Rechazadas',
    descripcion: 'Trámites que no fueron aprobados',
    icono:       <XCircleIcon className="h-14 w-14" />,
    bg:          'bg-gradient-to-br from-red-400 to-rose-600 hover:from-red-500 hover:to-rose-700',
    sombra:      'shadow-red-200',
    anillo:      'ring-red-300',
  },
];

const TarjetaEstado = ({ seccion, cantidad, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      group relative flex flex-col items-center justify-center gap-4
      rounded-3xl p-10 text-white shadow-xl ring-1
      transition-all duration-200
      hover:scale-[1.03] hover:shadow-2xl active:scale-[0.97]
      ${seccion.bg} ${seccion.sombra} ${seccion.anillo}
    `}
  >
    <div className="opacity-90 transition-transform duration-200 group-hover:scale-110">
      {seccion.icono}
    </div>

    <div className="text-center">
      <span className="block text-7xl font-black leading-none tracking-tight">
        {cantidad}
      </span>
      <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
        solicitud{cantidad !== 1 ? 'es' : ''}
      </span>
    </div>

    <div className="text-center">
      <span className="block text-lg font-bold">{seccion.titulo}</span>
      <span className="mt-0.5 block text-xs font-medium opacity-75">{seccion.descripcion}</span>
    </div>

    <div className="absolute right-5 top-5 rounded-full bg-white/20 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      </svg>
    </div>
  </button>
);

const BandejaDirector = () => {
  const navigate = useNavigate();
  const { usuario, bandeja, cargando, error } = useBandejaDirector();

  const total = cargando ? 0 : Object.values(bandeja).reduce((s, arr) => s + arr.length, 0);

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
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              TRÁMITES / DIRECTOR / TERMINACIÓN DE MATERIAS
            </div>

            <div className="mb-2 flex flex-wrap items-baseline gap-3">
              <h2 className="text-3xl font-bold text-slate-900">Bandeja de Terminación de materias</h2>
              {!cargando && !error && (
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-sm font-bold text-blue-700">
                  {total} total
                </span>
              )}
            </div>
            <p className="mb-10 text-sm text-slate-500">
              Gestiona las solicitudes de Terminación de Materias de los estudiantes de tu programa.
            </p>

            {cargando && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span className="text-sm font-medium">Cargando bandeja…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 px-6 py-5 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {!cargando && !error && (
              <div className="grid flex-1 gap-6 sm:grid-cols-3">
                {SECCIONES.map((sec) => (
                  <TarjetaEstado
                    key={sec.key}
                    seccion={sec}
                    cantidad={bandeja[sec.key].length}
                    onClick={() => navigate(`/tramites/bandeja-director/${sec.key}`)}
                  />
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
