import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBandejaGrado } from '../hooks/useBandejaGrado';
import BandejaListadoLayout from '../components/bandeja-director/BandejaListadoLayout';
import EstadoBadge from '../components/bandeja-director/EstadoBadge';
import ModalRechazo from '../components/bandeja-director/ModalRechazo';
import { ClockIcon, XCircleIcon, CheckCircleIcon, EyeIcon } from '../components/bandeja-director/icons';
import { formatFecha } from '../constants/procesodeGrado';

const CONFIG = {
  pendientes: {
    label: 'Solicitudes Pendientes', sublabel: 'Solicitud de Grado',
    icono: <ClockIcon className="h-5 w-5" />,
    mensajeVacio: 'No hay solicitudes de grado pendientes de revisión.',
    conAcciones: true,
    colores: {
      iconWrapper: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
      card: 'border-amber-200 bg-amber-50',
      avatar: 'bg-amber-200 text-amber-800',
    },
  },
  aprobadas: {
    label: 'Solicitudes Aprobadas', sublabel: 'Solicitud de Grado',
    icono: <CheckCircleIcon className="h-5 w-5" />,
    mensajeVacio: 'No hay solicitudes de grado aprobadas.',
    conAcciones: false,
    colores: {
      iconWrapper: 'bg-green-100 text-green-600',
      badge: 'bg-green-100 text-green-700',
      card: 'border-green-200 bg-green-50',
      avatar: 'bg-green-200 text-green-800',
    },
  },
  rechazadas: {
    label: 'Solicitudes Rechazadas', sublabel: 'Solicitud de Grado',
    icono: <XCircleIcon className="h-5 w-5" />,
    mensajeVacio: 'No hay solicitudes de grado rechazadas.',
    conAcciones: false,
    colores: {
      iconWrapper: 'bg-red-100 text-red-700',
      badge: 'bg-red-100 text-red-700',
      card: 'border-red-200 bg-red-50',
      avatar: 'bg-red-200 text-red-800',
    },
  },
};

// Barra de progreso para créditos
const BarraCreditos = ({ aprobados, requeridos }) => {
  const pct = requeridos > 0 ? Math.min(100, Math.round((aprobados / requeridos) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700">{aprobados ?? 0} / {requeridos ?? 0}</span>
        <span className="text-xs text-gray-500">{pct}%</span>
      </div>
      <div className="h-1.5 w-24 rounded-full bg-gray-200">
        <div
          className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// Badge de documentos cargados
const DocsBadge = ({ cargados, requeridos }) => {
  const completo = requeridos > 0 && cargados >= requeridos;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      completo ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {cargados ?? 0}/{requeridos ?? 0}
    </span>
  );
};

const ListaSolicitudesGrado = () => {
  const { estado } = useParams();
  const navigate = useNavigate();
  const { bandeja, cargando, error, aprobar, rechazar, accionEnCurso, errorAccion } = useBandejaGrado();
  const [solicitudARechazar, setSolicitudARechazar] = useState(null);

  const cfg = CONFIG[estado];
  const solicitudes = bandeja[estado] ?? [];

  if (!cfg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="font-medium text-red-700">Sección no válida.</p>
      </div>
    );
  }

  const columnas = [
    {
      header: 'Estudiante',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${cfg.colores.avatar}`}>
            {(s.estudiante?.nombre || 'E').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{s.estudiante?.nombre}</p>
            <p className="text-xs text-gray-500">CC {s.estudiante?.cedula}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Programa',
      render: (s) => <p className="text-sm text-gray-600">{s.estudiante?.programa || '—'}</p>,
    },
    {
      header: 'Créditos',
      render: (s) => (
        <BarraCreditos
          aprobados={s.estudiante?.creditosAprobados}
          requeridos={s.estudiante?.creditosRequeridos}
        />
      ),
    },
    {
      header: 'Fecha',
      render: (s) => <p className="text-sm text-gray-600">{formatFecha(s.fechaSolicitud)}</p>,
    },
    {
      header: 'Docs',
      render: (s) => (
        <DocsBadge
          cargados={s.documentosCargados}
          requeridos={s.documentosRequeridos}
        />
      ),
    },
    {
      header: 'Estado',
      render: (s) => <EstadoBadge estado={s.estado} />,
    },
  ];

  const renderAcciones = (s) => (
    <>
      {cfg.conAcciones && (
        <>
          <button
            type="button"
            disabled={accionEnCurso === s.id}
            onClick={() => aprobar(s.id)}
            className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accionEnCurso === s.id ? 'Procesando…' : 'Aprobar'}
          </button>
          <button
            type="button"
            disabled={accionEnCurso === s.id}
            onClick={() => setSolicitudARechazar(s)}
            className="rounded-lg bg-primario px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primario-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rechazar
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => navigate(`/tramites/bandeja-director/grado/${estado}/${s.id}`)}
        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
      >
        <EyeIcon className="h-3.5 w-3.5" />
        Ver
      </button>
    </>
  );

  const renderMobileCard = (s) => (
    <div key={s.id} className={`rounded-lg border p-4 shadow ${cfg.colores.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${cfg.colores.avatar}`}>
            {(s.estudiante?.nombre || 'E').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{s.estudiante?.nombre}</p>
            <p className="text-xs text-gray-500">{formatFecha(s.fechaSolicitud)}</p>
          </div>
        </div>
        <EstadoBadge estado={s.estado} />
      </div>
      <div className="mt-3 space-y-2 text-xs text-gray-500">
        <p>{s.estudiante?.programa || '—'}</p>
        <div className="flex items-center gap-4">
          <BarraCreditos
            aprobados={s.estudiante?.creditosAprobados}
            requeridos={s.estudiante?.creditosRequeridos}
          />
          <DocsBadge cargados={s.documentosCargados} requeridos={s.documentosRequeridos} />
        </div>
        {s.observacionesDirector && (
          <p className="italic text-gray-500">{s.observacionesDirector}</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        {cfg.conAcciones && (
          <>
            <button
              type="button"
              disabled={accionEnCurso === s.id}
              onClick={() => aprobar(s.id)}
              className="flex-1 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {accionEnCurso === s.id ? 'Proc…' : 'Aprobar'}
            </button>
            <button
              type="button"
              disabled={accionEnCurso === s.id}
              onClick={() => setSolicitudARechazar(s)}
              className="flex-1 rounded-lg bg-primario px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primario-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rechazar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => navigate(`/tramites/bandeja-director/grado/${estado}/${s.id}`)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          <EyeIcon className="h-3.5 w-3.5" />
          Ver
        </button>
      </div>
    </div>
  );

  return (
    <>
      <BandejaListadoLayout
        cfg={cfg}
        estado={estado}
        breadcrumb="TRÁMITES / DIRECTOR / SOLICITUDES / SOLICITUD DE GRADO"
        rutaVolver="/tramites/bandeja-solicitudes"
        solicitudes={solicitudes}
        cargando={cargando}
        error={error}
        errorAccion={errorAccion}
        columnas={columnas}
        renderAcciones={renderAcciones}
        renderMobileCard={renderMobileCard}
      />

      {solicitudARechazar && (
        <ModalRechazo
          solicitud={solicitudARechazar}
          procesando={accionEnCurso === solicitudARechazar.id}
          onConfirmar={(id, motivo) => { rechazar(id, motivo); setSolicitudARechazar(null); }}
          onCancelar={() => setSolicitudARechazar(null)}
        />
      )}
    </>
  );
};

export default ListaSolicitudesGrado;
