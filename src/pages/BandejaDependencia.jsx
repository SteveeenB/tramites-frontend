import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMisSolicitudesPazYSalvo, responderPazYSalvo } from '../api/pazYSalvoApi';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '../components/bandeja-director/icons';

// ── Secciones visuales ────────────────────────────────────────────────────────
const SECCIONES = [
    {
        key:         'PENDIENTE',
        titulo:      'Pendientes',
        descripcion: 'Esperando tu respuesta',
        icono:       <ClockIcon className="h-14 w-14" />,
        bg:          'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',
        sombra:      'shadow-amber-200',
        anillo:      'ring-amber-300',
        colores: { avatar: 'bg-amber-200 text-amber-800', badge: 'bg-amber-100 text-amber-700', iconWrapper: 'bg-amber-100 text-amber-600' },
    },
    {
        key:         'APROBADO',
        titulo:      'A Paz y Salvo',
        descripcion: 'Estudiantes sin deudas',
        icono:       <CheckCircleIcon className="h-14 w-14" />,
        bg:          'bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700',
        sombra:      'shadow-green-200',
        anillo:      'ring-green-300',
        colores: { avatar: 'bg-green-200 text-green-800', badge: 'bg-green-100 text-green-700', iconWrapper: 'bg-green-100 text-green-600' },
    },
    {
        key:         'RECHAZADO',
        titulo:      'No a Paz y Salvo',
        descripcion: 'Estudiantes con deudas',
        icono:       <XCircleIcon className="h-14 w-14" />,
        bg:          'bg-gradient-to-br from-red-400 to-rose-600 hover:from-red-500 hover:to-rose-700',
        sombra:      'shadow-red-200',
        anillo:      'ring-red-300',
        colores: { avatar: 'bg-red-200 text-red-800', badge: 'bg-red-100 text-red-700', iconWrapper: 'bg-red-100 text-red-600' },
    },
];

// ── Modal respuesta ───────────────────────────────────────────────────────────
const ModalRespuesta = ({ pazYSalvo, onClose, onConfirm }) => {
    const [decision, setDecision] = useState('APROBADO');
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (decision === 'RECHAZADO' && !observaciones.trim()) return;
        setLoading(true);
        try {
            await onConfirm(pazYSalvo.id, decision, observaciones);
            onClose();
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Responder Paz y Salvo</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Estudiante: <span className="font-semibold text-slate-800">{pazYSalvo.nombreEstudiante || pazYSalvo.cedulaEstudiante}</span>
                </p>
                <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Decisión</label>
                    <div className="flex gap-3">
                        <button onClick={() => setDecision('APROBADO')}
                            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${decision === 'APROBADO' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            ✓ A Paz y Salvo
                        </button>
                        <button onClick={() => setDecision('RECHAZADO')}
                            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${decision === 'RECHAZADO' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            ✗ No a Paz y Salvo
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                        Observaciones {decision === 'RECHAZADO' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                        rows={3}
                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none"
                        placeholder={decision === 'RECHAZADO' ? 'Indique el motivo (obligatorio)…' : 'Opcional'}
                    />
                    {decision === 'RECHAZADO' && !observaciones.trim() && (
                        <p className="text-xs text-red-500 mt-1">El motivo es obligatorio al rechazar.</p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={loading}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit}
                        disabled={loading || (decision === 'RECHAZADO' && !observaciones.trim())}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 ${decision === 'APROBADO' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-600 hover:bg-red-700'}`}>
                        {loading ? 'Guardando…' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Tarjeta visual (director-style) ──────────────────────────────────────────
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
            <span className="block text-7xl font-black leading-none tracking-tight">{cantidad}</span>
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

// ── Tabla de detalle ──────────────────────────────────────────────────────────
const TablaDetalle = ({ solicitudes, seccion, onResponder, onVolver }) => {
    const [modal, setModal] = useState(null);

    const handleConfirmar = async (id, decision, observaciones) => {
        await onResponder(id, decision, observaciones);
        setModal(null);
    };

    return (
        <>
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${seccion.colores.iconWrapper}`}>
                        {seccion.icono}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-900">{seccion.titulo}</h2>
                            <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${seccion.colores.badge}`}>
                                {solicitudes.length}
                            </span>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500">{seccion.descripcion}</p>
                    </div>
                </div>
                <button type="button" onClick={onVolver}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Volver a la bandeja
                </button>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                {solicitudes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
                        <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-300`}>
                            {seccion.icono}
                        </div>
                        <p className="text-sm font-medium text-slate-400">No hay solicitudes en este estado.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr className="border-b border-slate-200">
                                        {['Estudiante', 'Programa', 'Solicitud N°', 'Fecha', 'Observaciones'].map(h => (
                                            <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {h}
                                            </th>
                                        ))}
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {solicitudes.map(ps => (
                                        <tr key={ps.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${seccion.colores.avatar}`}>
                                                        {(ps.nombreEstudiante || '?').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{ps.nombreEstudiante || ps.cedulaEstudiante}</p>
                                                        <p className="text-xs text-slate-500">CC {ps.cedulaEstudiante}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{ps.programa || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">#{ps.solicitudId}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {ps.fechaSolicitud ? new Date(ps.fechaSolicitud).toLocaleDateString('es-CO') : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                                                {ps.observaciones || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {ps.estado === 'PENDIENTE' && (
                                                        <button onClick={() => setModal(ps)}
                                                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600">
                                                            Responder
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-4 p-4 sm:hidden">
                            {solicitudes.map(ps => (
                                <div key={ps.id} className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${seccion.colores.avatar}`}>
                                            {(ps.nombreEstudiante || '?').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{ps.nombreEstudiante || ps.cedulaEstudiante}</p>
                                            <p className="text-xs text-slate-500">{ps.programa || '—'}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">CC {ps.cedulaEstudiante} · Sol. #{ps.solicitudId}</p>
                                    {ps.observaciones && <p className="text-xs text-slate-600 mb-2">{ps.observaciones}</p>}
                                    {ps.estado === 'PENDIENTE' && (
                                        <button onClick={() => setModal(ps)}
                                            className="w-full rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600">
                                            Responder
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {modal && (
                <ModalRespuesta
                    pazYSalvo={modal}
                    onClose={() => setModal(null)}
                    onConfirm={handleConfirmar}
                />
            )}
        </>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function BandejaDependencia() {
    const { usuario } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vistaDetalle, setVistaDetalle] = useState(null);

    const cargar = useCallback(async () => {
        if (!usuario) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getMisSolicitudesPazYSalvo();
            setSolicitudes(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [usuario]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleResponder = async (id, decision, observaciones) => {
        await responderPazYSalvo(id, decision, observaciones);
        await cargar();
    };

    const conteo  = (key) => solicitudes.filter(s => s.estado === key).length;
    const total   = solicitudes.length;
    const seccion = SECCIONES.find(s => s.key === vistaDetalle);
    const lista   = seccion ? solicitudes.filter(s => s.estado === vistaDetalle) : [];

    return (
        <>
            {!vistaDetalle && (
                <>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        TRÁMITES / PAZ Y SALVOS
                    </div>
                    <div className="mb-2 flex flex-wrap items-baseline gap-3">
                        <h2 className="text-3xl font-bold text-slate-900">Paz y Salvos</h2>
                        {!loading && !error && (
                            <span className="rounded-full bg-red-100 px-3 py-0.5 text-sm font-bold text-red-700">
                                {total} total
                            </span>
                        )}
                    </div>
                    <p className="mb-10 text-sm text-slate-500">
                        Revisa y responde las solicitudes de paz y salvo de los estudiantes que van a grado.
                    </p>
                </>
            )}

            {loading && (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-medium">Cargando paz y salvos…</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-2xl bg-red-50 px-6 py-5 text-sm font-medium text-red-600">
                    {error}
                    <button onClick={cargar} className="ml-3 underline">Reintentar</button>
                </div>
            )}

            {!loading && !error && (
                vistaDetalle ? (
                    <TablaDetalle
                        solicitudes={lista}
                        seccion={seccion}
                        onResponder={handleResponder}
                        onVolver={() => setVistaDetalle(null)}
                    />
                ) : (
                    <div className="grid flex-1 gap-6 sm:grid-cols-3">
                        {SECCIONES.map(sec => (
                            <TarjetaEstado
                                key={sec.key}
                                seccion={sec}
                                cantidad={conteo(sec.key)}
                                onClick={() => setVistaDetalle(sec.key)}
                            />
                        ))}
                    </div>
                )
            )}
        </>
    );
}
