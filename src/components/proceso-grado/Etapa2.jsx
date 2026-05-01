import React from 'react';
import { SendIcon } from './icons';
import TarjetaLiquidacion from './TarjetaLiquidacion';
import ConfirmacionGrado from './ConfirmacionGrado';
import DragDropZone from './DragDropZone';
import { solicitudesApi } from '../../api/solicitudesApi';

const Etapa2 = ({
  etapa2Disponible,
  solicitudGrado,
  solicitarGrado,
  enviandoGrado,
  errorSolicitudGrado,
}) => {
  const handleSubirDocs = async (archivos) => {
    if (!solicitudGrado?.id) return;
    for (const archivo of archivos) {
      await solicitudesApi.subirDocumento(solicitudGrado.id, archivo);
    }
  };

  return (
    <aside
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm ${
        etapa2Disponible ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <h3 className="mb-3 text-xl font-bold text-slate-900">Etapa 2: Solicitud de Grado</h3>

      {!etapa2Disponible && (
        <>
          <p className="text-sm leading-6 text-slate-600">
            Disponible una vez aprobada la Terminación de Materias.
          </p>
          <div className="mt-4 inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Bloqueada
          </div>
        </>
      )}

      {etapa2Disponible && solicitudGrado?.estado === 'APROBADA' && (
        <ConfirmacionGrado solicitudGrado={solicitudGrado} />
      )}

      {etapa2Disponible && solicitudGrado && solicitudGrado.estado !== 'APROBADA' && (
        <>
          <TarjetaLiquidacion solicitud={solicitudGrado} />
          <DragDropZone onUpload={handleSubirDocs} />
        </>
      )}

      {etapa2Disponible && !solicitudGrado && (
        <>
          <p className="text-sm leading-6 text-slate-600">
            Todos los requisitos académicos están cumplidos. Puedes iniciar tu solicitud de grado.
          </p>

          {errorSolicitudGrado && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorSolicitudGrado}
            </p>
          )}

          <button
            type="button"
            onClick={solicitarGrado}
            disabled={enviandoGrado}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendIcon />
            {enviandoGrado ? 'Registrando…' : 'Iniciar Solicitud de Grado'}
          </button>
        </>
      )}
    </aside>
  );
};

export default Etapa2;
