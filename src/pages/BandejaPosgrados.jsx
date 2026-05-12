import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { solicitudesApi } from '../api/solicitudesApi';
import BotonActaTerminacion from '../components/tramites/BotonActaTerminacion';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtMoneda = (v) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v ?? 0);

const fmtFecha = (f) => {
    if (!f) return '—';
    try { return new Date(f + (f.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return f; }
};

const ESTADO_BADGE = {
    EN_REVISION: { label: 'En revisión', color: 'bg-amber-100 text-amber-700' },
    PENDIENTE_PAGO: { label: 'Pendiente pago', color: 'bg-sky-100 text-sky-700' },
    APROBADA_DIRECTOR: { label: 'Aprobada por director', color: 'bg-orange-100 text-orange-700' },
    APROBADA: { label: 'Aprobada por posgrados', color: 'bg-green-100 text-green-700' },
    RECHAZADA: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
};
const EstadoBadge = ({ estado }) => {
    const cfg = ESTADO_BADGE[estado] || { label: estado, color: 'bg-gray-100 text-gray-600' };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>;
};

// ── Modal Rechazo ─────────────────────────────────────────────────────────────
const ModalRechazo = ({ solicitud, cedulaPosgrados, onClose, onExito }) => {
    const [motivo, setMotivo] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);

    const handleRechazar = async () => {
        if (!motivo.trim()) { setError('Debes ingresar el motivo del rechazo.'); return; }
        setEnviando(true);
        setError(null);
        try {
            await solicitudesApi.rechazarPosgrados(solicitud.id, cedulaPosgrados, motivo.trim());
            onExito();
        } catch (e) {
            setError(e.message || 'No se pudo rechazar la solicitud.');
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !enviando) onClose(); }}>
            <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-900">Rechazar solicitud</h3>
                <p className="mb-4 text-sm text-slate-500">
                    Estudiante: <strong>{solicitud.nombreEstudiante}</strong> · {solicitud.tipo === 'GRADO' ? 'Proceso de Grado' : 'Terminación de Materias'}
                </p>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={motivo}
                    onChange={(e) => { setMotivo(e.target.value); setError(null); }}
                    rows={4}
                    placeholder="Describe el motivo del rechazo para notificar al estudiante…"
                    className="mb-3 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-red-400 focus:outline-none resize-none"
                />
                {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-xs font-medium text-red-700">{error}</p>}
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={enviando}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleRechazar} disabled={enviando || !motivo.trim()}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                        {enviando ? 'Rechazando…' : 'Confirmar rechazo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Tarjeta de solicitud ──────────────────────────────────────────────────────
const TarjetaSolicitud = ({ solicitud, cedulaPosgrados, tipo, onActualizar }) => {
    const [generando, setGenerando] = useState(false);
    const [errorGenerar, setErrorGenerar] = useState(null);
    const [mostrarRechazo, setMostrarRechazo] = useState(false);
    const [expandida, setExpandida] = useState(false);

    const puedeGenerar = tipo === 'terminacion' && (
        solicitud.estado === 'APROBADA_DIRECTOR' ||
        (solicitud.estado === 'APROBADA' && !solicitud.actaGenerada)
    );
    const puedeRechazar = solicitud.estado !== 'RECHAZADA' && solicitud.estado !== 'APROBADA';

    const handleGenerar = async () => {
        setGenerando(true);
        setErrorGenerar(null);
        try {
            let blob;
            if (solicitud.estado === 'APROBADA_DIRECTOR') {
                ({ blob } = await solicitudesApi.aprobarPosgrados(solicitud.id, cedulaPosgrados));
            } else {
                ({ blob } = await solicitudesApi.descargarCertificadoPdf(solicitud.id, cedulaPosgrados));
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `acta-terminacion-${solicitud.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            onActualizar();
        } catch (e) {
            setErrorGenerar('No se pudo generar el acta.');
        } finally {
            setGenerando(false);
        }
    };

    return (
        <>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                            {(solicitud.nombreEstudiante || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">{solicitud.nombreEstudiante || '—'}</p>
                            <p className="text-xs text-slate-400">C.C. {solicitud.cedulaEstudiante} · Cód. {solicitud.codigoEstudiante || '—'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{solicitud.programa || '—'}</p>
                        </div>
                    </div>
                    <EstadoBadge estado={solicitud.estado} />
                </div>

                {/* Info básica */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                    <span>Solicitud #{solicitud.id}</span>
                    <span className="text-right">{fmtFecha(solicitud.fechaSolicitud)}</span>
                    {tipo === 'grado' && solicitud.tituloProyecto && (
                        <span className="col-span-2 text-slate-600 font-medium truncate">{solicitud.tituloProyecto}</span>
                    )}
                </div>

                {/* Expandir detalle */}
                {tipo === 'grado' && (
                    <button onClick={() => setExpandida(!expandida)}
                        className="mb-3 text-xs font-semibold text-blue-600 hover:underline">
                        {expandida ? '▲ Ocultar detalle' : '▼ Ver detalle del proyecto'}
                    </button>
                )}
                {expandida && tipo === 'grado' && (
                    <div className="mb-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                        <p><strong>Tipo:</strong> {solicitud.tipoProyecto || '—'}</p>
                        {solicitud.resumenProyecto && <p><strong>Resumen:</strong> {solicitud.resumenProyecto}</p>}
                    </div>
                )}

                {/* Observaciones */}
                {solicitud.observaciones && solicitud.estado === 'RECHAZADA' && (
                    <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                        <strong>Motivo:</strong> {solicitud.observaciones}
                    </div>
                )}

                {errorGenerar && (
                    <p className="mb-2 text-xs text-red-600">{errorGenerar}</p>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 mt-1">
                    {/* Generar acta (aprueba + genera + descarga en un solo click) */}
                    {puedeGenerar && (
                        <BotonActaTerminacion
                            onGenerar={handleGenerar}
                            disabled={generando}
                            cargando={generando}
                        />
                    )}

                    {/* Rechazar */}
                    {puedeRechazar && (
                        <button onClick={() => setMostrarRechazo(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rechazar
                        </button>
                    )}
                </div>
            </div>

            {mostrarRechazo && (
                <ModalRechazo
                    solicitud={{ ...solicitud, nombreEstudiante: solicitud.nombreEstudiante }}
                    cedulaPosgrados={cedulaPosgrados}
                    onClose={() => setMostrarRechazo(false)}
                    onExito={() => { setMostrarRechazo(false); onActualizar(); }}
                />
            )}
        </>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function BandejaPosgrados() {
    const { usuario } = useAuth();
    const [tab, setTab] = useState('terminacion');
    const [datos, setDatos] = useState({ terminacion: [], grado: [] });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    const cargar = useCallback(async () => {
        if (!usuario?.cedula) return;
        setCargando(true);
        setError(null);
        try {
            const data = await solicitudesApi.getBandejaPosgrados(usuario.cedula);
            setDatos(data);
        } catch (e) {
            setError(e.message || 'No se pudo cargar la bandeja.');
        } finally {
            setCargando(false);
        }
    }, [usuario?.cedula]);

    useEffect(() => { cargar(); }, [cargar]);

    const lista = (tab === 'terminacion' ? datos.terminacion : datos.grado) || [];
    const filtrada = filtroEstado === 'TODOS' ? lista : lista.filter(s => s.estado === filtroEstado);

    const conteos = {
        terminacion: (datos.terminacion || []).length,
        grado: (datos.grado || []).length,
        porAprobar: (datos.terminacion || []).filter(s => s.estado === 'APROBADA').length,
    };

    const FILTROS = ['TODOS', 'EN_REVISION', 'PENDIENTE_PAGO', 'APROBADA', 'RECHAZADA'];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    POSGRADOS / BANDEJA DE SOLICITUDES
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Bandeja de Solicitudes</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Gestión de solicitudes de terminación de materias y proceso de grado
                </p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-3xl font-black text-slate-900">{conteos.terminacion}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Terminación de materias</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-3xl font-black text-slate-900">{conteos.grado}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Proceso de grado</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
                    <p className="text-3xl font-black text-blue-700">{conteos.porAprobar}</p>
                    <p className="text-xs font-medium text-blue-600 mt-0.5">Cert. pendientes de generar</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 mb-5">
                {[
                    { key: 'terminacion', label: 'Terminación de Materias', count: conteos.terminacion },
                    { key: 'grado', label: 'Proceso de Grado', count: conteos.grado },
                ].map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key); setFiltroEstado('TODOS'); }}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}>
                        {t.label}
                        <span className={`rounded-full px-2 py-0.5 text-xs ${tab === t.key ? 'bg-slate-100' : 'bg-slate-200'}`}>
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filtro estado */}
            <div className="flex flex-wrap gap-2 mb-5">
                {FILTROS.map(f => (
                    <button key={f} onClick={() => setFiltroEstado(f)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${filtroEstado === f
                            ? 'bg-slate-800 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}>
                        {f === 'TODOS' ? `Todos (${lista.length})` : (ESTADO_BADGE[f]?.label || f)}
                    </button>
                ))}
                <button onClick={cargar}
                    className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">
                    ↺ Actualizar
                </button>
            </div>

            {/* Descripción contextual */}
            {tab === 'terminacion' && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <strong>Terminación de Materias:</strong> Las solicitudes con estado <em>Aprobada</em> fueron vistas buenas
                    por el director de programa. Genera el certificado oficial con código de verificación QR para el estudiante.
                    El rechazo siempre está disponible con comentario obligatorio.
                </div>
            )}
            {tab === 'grado' && (
                <div className="mb-4 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-800">
                    <strong>Proceso de Grado:</strong> Visualiza el estado de todas las solicitudes de grado. Puedes rechazar
                    cualquier solicitud con un comentario que se notificará al estudiante.
                </div>
            )}

            {/* Contenido */}
            {cargando ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <svg className="h-5 w-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cargando solicitudes…
                </div>
            ) : error ? (
                <div className="rounded-2xl bg-red-50 p-6 text-center">
                    <p className="text-sm text-red-700 mb-3">{error}</p>
                    <button onClick={cargar} className="text-sm font-semibold text-red-600 hover:underline">Reintentar</button>
                </div>
            ) : filtrada.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                    <svg className="mx-auto h-10 w-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium">No hay solicitudes</p>
                    <p className="text-xs mt-1">
                        {filtroEstado !== 'TODOS' ? 'Prueba quitando el filtro de estado.' : 'No hay solicitudes en esta sección.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {filtrada.map(s => (
                        <TarjetaSolicitud
                            key={s.id}
                            solicitud={s}
                            cedulaPosgrados={usuario?.cedula}
                            tipo={tab}
                            onActualizar={cargar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}