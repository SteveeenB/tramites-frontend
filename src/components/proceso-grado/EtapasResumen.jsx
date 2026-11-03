import React from 'react';
import { CheckIcon, WarningIcon, LockIcon, OpenLockIcon } from './icons';
import { ESTADO_CONFIG } from '../../constants/procesodeGrado';

const EtapasResumen = ({ etapa1Completada, etapa2Disponible, solicitud, solicitudGrado }) => {
  // Mostrar como completada si tiene créditos suficientes O si la solicitud ya está aprobada
  const solicitudAprobada =
    solicitud?.estado === 'APROBADA' || solicitud?.estado === 'APROBADA_DIRECTOR';
  const mostrarComoCompletada = etapa1Completada || solicitudAprobada;
  // La tarjeta de grado dependía solo de etapa2Disponible: aunque el estudiante ya
  // tuviera una solicitud de grado creada o aprobada seguía diciendo "Se habilita
  // al completar la Etapa 1" con candado. Ahora refleja el estado real.
  const etapa2Abierta = etapa2Disponible || !!solicitudGrado;
  const etapa2Texto = solicitudGrado
    ? (ESTADO_CONFIG[solicitudGrado.estado]?.label ?? solicitudGrado.estado)
    : etapa2Disponible
    ? 'Ya puedes solicitar tu grado'
    : 'Se habilita al completar la Etapa 1';

  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-2">
      {/* Etapa 1 */}
      <div
        className={`rounded-lg bg-white p-5 shadow ${
          mostrarComoCompletada ? 'border border-green-200' : 'border border-amber-200'
        }`}
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              mostrarComoCompletada
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {mostrarComoCompletada ? <CheckIcon /> : <WarningIcon />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Terminación de Materias</h3>
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                mostrarComoCompletada ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              {solicitud
                ? (ESTADO_CONFIG[solicitud.estado]?.label ?? solicitud.estado)
                : mostrarComoCompletada
                ? 'HABILITADA'
                : 'EN CURSO'}
            </span>
          </div>
        </div>
      </div>

      {/* Etapa 2 */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow">
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              etapa2Abierta ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {etapa2Abierta ? <OpenLockIcon /> : <LockIcon />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Solicitud de Grado</h3>
            <p className="text-sm text-gray-500">{etapa2Texto}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtapasResumen;
