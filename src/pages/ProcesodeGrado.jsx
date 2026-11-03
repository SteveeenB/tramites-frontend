import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useProcesodeGrado } from '../hooks/useProcesodeGrado';
import PanelLayout from '../components/layout/PanelLayout';
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
    errorPagina,
    errorSolicitud,
    solicitarTerminacion,
    porcentaje,
    faltantes,
    etapa1Completada,
    descargarActaTerminacion,
    descargandoActa,
    actaDisponible,
  } = useProcesodeGrado();

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // PanelLayout es un componente estable (definido en su propio módulo), así
  // que la sidebar y la campana no se desmontan entre renders.
  const layout = (children) => (
    <PanelLayout usuario={usuario} selectedMenuId="proceso-de-grado">
      {children}
    </PanelLayout>
  );

  if (cargando) {
    return layout(
      <>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-600">Cargando proceso de grado…</p>
        </div>
      </>
    );
  }

  if (errorPagina || !datos) {
    return layout(
      <>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <p className="font-medium text-red-700">{errorPagina || 'Sin datos disponibles'}</p>
          <p className="text-sm text-gray-500">
            Verifica que el backend esté corriendo o cambia de usuario en el panel demo.
          </p>
        </div>
      </>
    );
  }

  const { estadoAcademico, etapa2Disponible } = datos ?? {};
  const etapa1Aprobada = solicitud?.estado === 'APROBADA';

  const detalleEtapa1 = (
    <DetalleEtapa1
      porcentaje={porcentaje}
      faltantes={faltantes}
      etapa1Completada={etapa1Completada}
      estadoAcademico={estadoAcademico}
      solicitud={solicitud}
      enviando={enviando}
      errorSolicitud={errorSolicitud}
      onSolicitar={solicitarTerminacion}
      aprobada={etapa1Aprobada}
      onDescargarCertificado={descargarActaTerminacion}
      descargandoCert={descargandoActa}
      actaDisponible={actaDisponible}
    />
  );

  const etapa2 = (
    <Etapa2
      etapa2Disponible={etapa2Disponible}
      solicitudGrado={solicitudGrado}
    />
  );

  return layout(
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-600">
        TRÁMITES / ACADÉMICO
      </div>

      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900">Proceso de Grado</h1>
        <div className="text-sm font-medium text-gray-600">{fechaActual}</div>
      </div>

      <EtapasResumen
        etapa1Completada={etapa1Completada}
        etapa2Disponible={etapa2Disponible}
        solicitud={solicitud}
        solicitudGrado={solicitudGrado}
      />

      {etapa1Aprobada ? (
        /* Terminación aprobada: Etapa 1 compacta arriba, Etapa 2 como protagonista */
        <div className="flex flex-col gap-6">
          {detalleEtapa1}
          {etapa2}
          <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <h3 className="mb-3 text-lg font-bold text-gray-900">¿Necesitas ayuda?</h3>
            <p className="mb-4 text-sm leading-6 text-gray-600">
              Si consideras que hay un error en tus créditos, contacta a la oficina de Registro y Control Académico.
            </p>
            <button type="button" className="inline-flex items-center gap-1 rounded text-sm font-semibold text-red-700 hover:text-red-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario-borde">
              Contactar soporte académico
              <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </aside>
        </div>
      ) : (
        /* Etapa 1 en curso: layout original con columnas */
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {detalleEtapa1}
          {etapa2}
          <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow xl:col-start-2 xl:row-start-2">
            <h3 className="mb-3 text-lg font-bold text-gray-900">¿Necesitas ayuda?</h3>
            <p className="mb-4 text-sm leading-6 text-gray-600">
              Si consideras que hay un error en tus créditos, contacta a la oficina de Registro y Control Académico.
            </p>
            <button type="button" className="inline-flex items-center gap-1 rounded text-sm font-semibold text-red-700 hover:text-red-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario-borde">
              Contactar soporte académico
              <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </aside>
        </div>
      )}
    </>
  );
};

export default ProcesodeGrado;

