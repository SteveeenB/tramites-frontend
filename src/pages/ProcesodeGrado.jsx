import React from 'react';
import { useProcesodeGrado } from '../hooks/useProcesodeGrado';
import ProcesoPGSidebar from '../components/proceso-grado/ProcesoPGSidebar';
import EtapasResumen from '../components/proceso-grado/EtapasResumen';
import DetalleEtapa1 from '../components/proceso-grado/DetalleEtapa1';
import Etapa2 from '../components/proceso-grado/Etapa2';

const ProcesodeGrado = () => {
  const {
    usuario,
    datos,
    solicitud,
    cargando,
    enviando,
    errorPagina,
    errorSolicitud,
    solicitarTerminacion,
    porcentaje,
    faltantes,
    etapa1Habilitada,
    etapa2Habilitada,
  } = useProcesodeGrado();

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Cargando proceso de grado…</p>
      </div>
    );
  }

  if (errorPagina || !datos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-medium text-red-600">{errorPagina || 'Sin datos disponibles'}</p>
      </div>
    );
  }

  const { estadoAcademico, convocatoria } = datos;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <ProcesoPGSidebar usuario={usuario} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 bg-red-600 px-6 py-4 text-white shadow-sm md:px-8">
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">ESTUDIANTES</h1>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {usuario?.nombre?.slice(0, 2).toUpperCase()}
              </div>
              <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              TRÁMITES / ACADÉMICO
            </div>

            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Proceso de Grado</h2>
              <div className="text-sm font-medium text-slate-500">{fechaActual}</div>
            </div>

            <EtapasResumen
              etapa1Habilitada={etapa1Habilitada}
              etapa2Habilitada={etapa2Habilitada}
              solicitud={solicitud}
            />

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <DetalleEtapa1
                porcentaje={porcentaje}
                faltantes={faltantes}
                etapa1Habilitada={etapa1Habilitada}
                convocatoria={convocatoria}
                estadoAcademico={estadoAcademico}
                solicitud={solicitud}
                enviando={enviando}
                errorSolicitud={errorSolicitud}
                onSolicitar={solicitarTerminacion}
              />

              <Etapa2 etapa2Habilitada={etapa2Habilitada} />

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-start-2 xl:row-start-2">
                <h3 className="mb-3 text-lg font-bold text-slate-900">¿Necesitas ayuda?</h3>
                <p className="mb-4 text-sm leading-6 text-slate-600">
                  Si consideras que hay un error en tus créditos, contacta a la oficina de Registro y Control Académico.
                </p>
                <button type="button" className="text-sm font-semibold text-red-600 hover:text-red-700">
                  Contactar soporte académico ↗
                </button>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProcesodeGrado;
