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
    solicitudGrado,
    cargando,
    enviando,
    enviandoGrado,
    errorPagina,
    errorSolicitud,
    errorSolicitudGrado,
    solicitarTerminacion,
    solicitarGrado,
    porcentaje,
    faltantes,
    etapa1Completada,
  } = useProcesodeGrado();

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Layout base compartido (sidebar + header siempre visibles)
  const Layout = ({ children }) => (
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
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );

  if (cargando) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500">Cargando proceso de grado…</p>
        </div>
      </Layout>
    );
  }

  if (errorPagina || !datos) {
    return (
      <Layout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <p className="font-medium text-red-600">{errorPagina || 'Sin datos disponibles'}</p>
          <p className="text-sm text-slate-500">
            Verifica que el backend esté corriendo o cambia de usuario en el panel demo.
          </p>
        </div>
      </Layout>
    );
  }

  const { estadoAcademico, convocatoria, etapa2Habilitada: etapa2Disponible } = datos;
  const etapa1Aprobada = solicitud?.estado === 'APROBADA';

  const detalleEtapa1 = (
    <DetalleEtapa1
      porcentaje={porcentaje}
      faltantes={faltantes}
      etapa1Completada={etapa1Completada}
      convocatoria={convocatoria}
      estadoAcademico={estadoAcademico}
      solicitud={solicitud}
      enviando={enviando}
      errorSolicitud={errorSolicitud}
      onSolicitar={solicitarTerminacion}
      aprobada={etapa1Aprobada}
    />
  );

  const etapa2 = (
    <Etapa2
      etapa2Disponible={etapa2Disponible}
      solicitudGrado={solicitudGrado}
      solicitarGrado={solicitarGrado}
      enviandoGrado={enviandoGrado}
      errorSolicitudGrado={errorSolicitudGrado}
    />
  );

  return (
    <Layout>
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        TRÁMITES / ACADÉMICO
      </div>

      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Proceso de Grado</h2>
        <div className="text-sm font-medium text-slate-500">{fechaActual}</div>
      </div>

      <EtapasResumen
        etapa1Completada={etapa1Completada}
        etapa2Disponible={etapa2Disponible}
        solicitud={solicitud}
      />

      {etapa1Aprobada ? (
        /* Terminación aprobada: Etapa 1 compacta arriba, Etapa 2 como protagonista */
        <div className="flex flex-col gap-6">
          {detalleEtapa1}
          {etapa2}
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-slate-900">¿Necesitas ayuda?</h3>
            <p className="mb-4 text-sm leading-6 text-slate-600">
              Si consideras que hay un error en tus créditos, contacta a la oficina de Registro y Control Académico.
            </p>
            <button type="button" className="text-sm font-semibold text-red-600 hover:text-red-700">
              Contactar soporte académico ↗
            </button>
          </aside>
        </div>
      ) : (
        /* Etapa 1 en curso: layout original con columnas */
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {detalleEtapa1}
          {etapa2}
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
      )}
    </Layout>
  );
};

export default ProcesodeGrado;

