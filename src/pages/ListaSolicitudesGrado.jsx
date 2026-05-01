import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBandejaGrado } from '../hooks/useBandejaGrado';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import { ClockIcon, XCircleIcon, CheckCircleIcon, ArrowLeftIcon, EyeIcon } from '../components/bandeja-director/icons';
import { formatFecha, formatCOP } from '../constants/procesodeGrado';

const ModalRechazoGrado = ({ solicitud, procesando, onConfirmar, onCancelar }) => {
  const [motivo, setMotivo] = useState('');
  const motivoValido = motivo.trim().length > 0;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-titulo-grado" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancelar} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
        </div>
        <h3 id="modal-titulo-grado" className="mb-1 text-xl font-bold text-slate-900">Rechazar solicitud de grado</h3>
        <p className="mb-1 text-sm text-slate-500">Estudiante: <span className="font-semibold text-slate-700">{solicitud?.estudiante?.nombre}</span></p>
        <p className="mb-5 text-sm text-slate-500">El estudiante recibirá una notificación con el motivo del rechazo.</p>
        <label htmlFor="motivo-rechazo-grado" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Observaciones <span className="text-red-500">*</span><span className="ml-1 font-normal text-slate-400">(obligatorio)</span>
        </label>
        <textarea id="motivo-rechazo-grado" autoFocus value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3}
          placeholder="Describe el motivo del rechazo con detalle para que el estudiante pueda corregirlo…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
          disabled={procesando} />
        {!motivoValido && motivo.length > 0 && <p className="mt-1 text-xs text-red-500">Las observaciones no pueden estar vacías.</p>}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancelar} disabled={procesando} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button type="button" onClick={() => onConfirmar(solicitud.id, motivo.trim())} disabled={procesando || !motivoValido} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
            {procesando ? 'Rechazando…' : 'Confirmar rechazo'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CONFIG = {
  pendientes: {
    label: 'Solicitudes Pendientes', sublabel: 'Solicitud de Grado', icono: <ClockIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes de grado pendientes de revisión.', conAcciones: true,
    colores: { header: 'bg-gradient-to-r from-amber-400 to-orange-500', iconWrapper: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-700', card: 'border-amber-200 bg-amber-50', avatar: 'bg-amber-200 text-amber-800', titulo: 'text-amber-800' },
  },
  aprobadas: {
    label: 'Solicitudes Aprobadas', sublabel: 'Solicitud de Grado', icono: <CheckCircleIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes de grado aprobadas.', conAcciones: false,
    colores: { header: 'bg-gradient-to-r from-green-400 to-emerald-600', iconWrapper: 'bg-green-100 text-green-600',
      badge: 'bg-green-100 text-green-700', card: 'border-green-200 bg-green-50', avatar: 'bg-green-200 text-green-800', titulo: 'text-green-800' },
  },
  rechazadas: {
    label: 'Solicitudes Rechazadas', sublabel: 'Solicitud de Grado', icono: <XCircleIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes de grado rechazadas.', conAcciones: false,
    colores: { header: 'bg-gradient-to-r from-red-400 to-rose-600', iconWrapper: 'bg-red-100 text-red-600',
      badge: 'bg-red-100 text-red-700', card: 'border-red-200 bg-red-50', avatar: 'bg-red-200 text-red-800', titulo: 'text-red-800' },
  },
};

const ListaSolicitudesGrado = () => {
  const { estado } = useParams();
  const navigate = useNavigate();
  const { usuario, bandeja, cargando, error, aprobar, rechazar, accionEnCurso, errorAccion } = useBandejaGrado();
  const [solicitudARechazar, setSolicitudARechazar] = useState(null);

  const cfg = CONFIG[estado];
  const solicitudes = bandeja[estado] ?? [];

  const handleIniciarRechazo = (id) => { const sol = solicitudes.find((s) => s.id === id); setSolicitudARechazar(sol ?? { id }); };
  const handleConfirmarRechazo = async (id, motivo) => { await rechazar(id, motivo); setSolicitudARechazar(null); };

  if (!cfg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100"><p className="font-medium text-red-600">Sección no válida.</p></div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DirectorSidebar usuario={usuario} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`flex items-center justify-between gap-4 px-6 py-4 text-white shadow-sm md:px-8 ${cfg.colores.header}`}>
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">DIRECTOR DE PROGRAMA</h1>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {(usuario?.nombre || 'D').slice(0, 2).toUpperCase()}
              </div>
              <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              TRÁMITES / DIRECTOR / SOLICITUDES / SOLICITUD DE GRADO / <span className="text-slate-600">{estado.toUpperCase()}</span>
            </div>

            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cfg.colores.iconWrapper}`}>{cfg.icono}</div>
                <div>
                  <div className="flex items-center gap-3"><h2 className="text-2xl font-bold text-slate-900">{cfg.label}</h2>
                    {!cargando && <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${cfg.colores.badge}`}>{solicitudes.length}</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{cfg.sublabel}</p>
                </div>
              </div>
              <button type="button" onClick={() => navigate('/tramites/bandeja-director/grado')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a la bandeja
              </button>
            </div>

            {errorAccion && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{errorAccion}</div>}

            {cargando && (
              <div className="flex items-center gap-3 text-slate-400">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                <span className="text-sm">Cargando solicitudes…</span>
              </div>
            )}
            {error && <p className="font-medium text-red-600">{error}</p>}

            {!cargando && !error && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                {solicitudes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-300">{cfg.icono}</div>
                    <p className="text-sm font-medium text-slate-400">{cfg.mensajeVacio}</p>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto sm:block">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estudiante</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Programa</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Valor</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {solicitudes.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                    {(s.estudiante?.nombre || 'E').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-900">{s.estudiante?.nombre}</p>
                                    <p className="text-xs text-slate-500">CC {s.estudiante?.cedula}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4"><p className="text-sm text-slate-600">{s.estudiante?.programa || '—'}</p></td>
                              <td className="px-6 py-4"><p className="text-sm text-slate-600">{formatFecha(s.fechaSolicitud)}</p></td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.estado === 'PENDIENTE_PAGO' ? 'bg-amber-100 text-amber-700' : s.estado === 'EN_REVISION' ? 'bg-blue-100 text-blue-700' : s.estado === 'APROBADA' ? 'bg-green-100 text-green-700' : s.estado === 'RECHAZADA' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {s.estado === 'PENDIENTE_PAGO' ? 'Pago pendiente' : s.estado === 'EN_REVISION' ? 'En revisión' : s.estado === 'APROBADA' ? 'Aprobada' : s.estado === 'RECHAZADA' ? 'Rechazada' : s.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-700">{formatCOP(s.costo)}</p></td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  {cfg.conAcciones && (
                                    <>
                                      <button type="button" disabled={accionEnCurso === s.id} onClick={() => aprobar(s.id)} className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50">
                                        {accionEnCurso === s.id ? 'Procesando…' : 'Aprobar'}
                                      </button>
                                      <button type="button" disabled={accionEnCurso === s.id} onClick={() => handleIniciarRechazo(s.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
                                        Rechazar
                                      </button>
                                    </>
                                  )}
                                  <button type="button" onClick={() => navigate(`/tramites/bandeja-director/grado/${estado}/${s.id}`)} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                                    <EyeIcon className="h-3.5 w-3.5" />
                                    Ver
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-4 sm:hidden">
                      {solicitudes.map((s) => (
                        <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                {(s.estudiante?.nombre || 'E').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{s.estudiante?.nombre}</p>
                                <p className="text-xs text-slate-500">{formatFecha(s.fechaSolicitud)}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${s.estado === 'PENDIENTE_PAGO' ? 'bg-amber-100 text-amber-700' : s.estado === 'EN_REVISION' ? 'bg-blue-100 text-blue-700' : s.estado === 'APROBADA' ? 'bg-green-100 text-green-700' : s.estado === 'RECHAZADA' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                              {s.estado === 'PENDIENTE_PAGO' ? 'Pago pendiente' : s.estado === 'EN_REVISION' ? 'En revisión' : s.estado === 'APROBADA' ? 'Aprobada' : s.estado === 'RECHAZADA' ? 'Rechazada' : s.estado}
                            </span>
                          </div>
                          <div className="mt-3 space-y-1 text-xs text-slate-500">
                            <p>{s.estudiante?.programa || '—'}</p>
                            <p>CC {s.estudiante?.cedula}</p>
                            <p>{formatCOP(s.costo)}</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {cfg.conAcciones && (
                              <>
                                <button type="button" disabled={accionEnCurso === s.id} onClick={() => aprobar(s.id)} className="flex-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50">
                                  {accionEnCurso === s.id ? 'Proc…' : 'Aprobar'}
                                </button>
                                <button type="button" disabled={accionEnCurso === s.id} onClick={() => handleIniciarRechazo(s.id)} className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
                                  Rechazar
                                </button>
                              </>
                            )}
                            <button type="button" onClick={() => navigate(`/tramites/bandeja-director/grado/${estado}/${s.id}`)} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                              <EyeIcon className="h-3.5 w-3.5" />
                              Ver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      {solicitudARechazar && <ModalRechazoGrado solicitud={solicitudARechazar} procesando={accionEnCurso === solicitudARechazar.id} onConfirmar={handleConfirmarRechazo} onCancelar={() => setSolicitudARechazar(null)} />}
    </div>
  );
};

export default ListaSolicitudesGrado;