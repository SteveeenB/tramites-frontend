import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SendIcon } from './icons';
import ConfirmacionGrado from './ConfirmacionGrado';

const EstadoBadge = ({ estado }) => {
  const config = {
    EN_REVISION: { label: 'Pendiente de revisión', cls: 'bg-yellow-100 text-yellow-700' },
    APROBADA:    { label: 'Aprobada',               cls: 'bg-green-100 text-green-700'  },
    RECHAZADA:   { label: 'Rechazada',              cls: 'bg-red-100 text-red-700'      },
  };
  const { label, cls } = config[estado] ?? { label: estado, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
};

const SolicitudEnviada = ({ solicitudGrado }) => {
  const fecha = solicitudGrado?.fechaSolicitud
    ? new Date(solicitudGrado.fechaSolicitud).toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-yellow-800">Solicitud enviada — en espera de revisión</p>
          <p className="mt-0.5 text-xs text-yellow-700">
            El director de programa revisará tu solicitud y tomará una decisión.
          </p>
        </div>
      </div>

      {solicitudGrado?.tituloProyecto && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Proyecto</p>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{solicitudGrado.tituloProyecto}</p>
          {solicitudGrado.tipoProyecto && (
            <p className="mt-1 text-xs text-slate-500">
              {solicitudGrado.tipoProyecto.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <EstadoBadge estado={solicitudGrado.estado} />
        {fecha && <p className="text-xs text-slate-400">Enviada el {fecha}</p>}
      </div>
    </div>
  );
};

const SolicitudRechazada = ({ solicitudGrado }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-red-800">Solicitud rechazada por el director</p>
        {solicitudGrado?.observaciones && (
          <p className="mt-1 text-xs text-red-700">
            <span className="font-semibold">Motivo: </span>
            {solicitudGrado.observaciones}
          </p>
        )}
      </div>
    </div>
    <p className="text-xs text-slate-500">
      Si consideras que hay un error, contacta a la oficina de posgrados.
    </p>
  </div>
);

const Etapa2 = ({ etapa2Disponible, solicitudGrado }) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm ${
        etapa2Disponible ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <h3 className="mb-3 text-xl font-bold text-slate-900">Etapa 2: Solicitud de Grado</h3>

      {/* ── Bloqueada ─────────────────────────────────────────────────── */}
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

      {/* ── Sin solicitud: botón para iniciar ─────────────────────────── */}
      {etapa2Disponible && !solicitudGrado && (
        <>
          <p className="text-sm leading-6 text-slate-600">
            Todos los requisitos académicos están cumplidos. Puedes iniciar tu solicitud de grado.
          </p>
          <button
            type="button"
            onClick={() => navigate('/proceso-de-grado/solicitud-grado')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <SendIcon />
            Iniciar Proceso de Grado
          </button>
        </>
      )}

      {/* ── Pendiente del director (cualquier estado intermedio) ─────── */}
      {etapa2Disponible && solicitudGrado &&
        solicitudGrado.estado !== 'APROBADA' &&
        solicitudGrado.estado !== 'RECHAZADA' && (
        <SolicitudEnviada solicitudGrado={solicitudGrado} />
      )}

      {/* ── RECHAZADA ─────────────────────────────────────────────────── */}
      {etapa2Disponible && solicitudGrado?.estado === 'RECHAZADA' && (
        <SolicitudRechazada solicitudGrado={solicitudGrado} />
      )}

      {/* ── APROBADA ──────────────────────────────────────────────────── */}
      {etapa2Disponible && solicitudGrado?.estado === 'APROBADA' && (
        <ConfirmacionGrado solicitudGrado={solicitudGrado} />
      )}
    </aside>
  );
};

export default Etapa2;
