import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { solicitudesApi } from '../api/solicitudesApi';
import BandejaListadoLayout from '../components/bandeja-director/BandejaListadoLayout';
import EstadoBadge from '../components/bandeja-director/EstadoBadge';
import { ClockIcon, XCircleIcon, CheckCircleIcon } from '../components/bandeja-director/icons';
import { formatFecha } from '../constants/procesodeGrado';

const ESTADOS_PENDIENTE = ['EN_REVISION', 'PENDIENTE_PAGO', 'APROBADA_DIRECTOR'];

const CONFIG = {
    pendientes: {
        label:        'En Proceso',
        sublabel:     'Solicitudes activas pendientes de acción',
        icono:        <ClockIcon className="h-6 w-6" />,
        mensajeVacio: 'No hay solicitudes en proceso.',
        colores: {
            iconWrapper: 'bg-amber-100 text-amber-600',
            badge:       'bg-amber-100 text-amber-700',
            avatar:      'bg-amber-200 text-amber-800',
        },
    },
    aprobadas: {
        label:        'Aprobadas',
        sublabel:     'Solicitudes aprobadas exitosamente',
        icono:        <CheckCircleIcon className="h-6 w-6" />,
        mensajeVacio: 'No hay solicitudes aprobadas.',
        colores: {
            iconWrapper: 'bg-green-100 text-green-600',
            badge:       'bg-green-100 text-green-700',
            avatar:      'bg-green-200 text-green-800',
        },
    },
    rechazadas: {
        label:        'Rechazadas',
        sublabel:     'Solicitudes no aprobadas',
        icono:        <XCircleIcon className="h-6 w-6" />,
        mensajeVacio: 'No hay solicitudes rechazadas.',
        colores: {
            iconWrapper: 'bg-red-100 text-red-600',
            badge:       'bg-red-100 text-red-700',
            avatar:      'bg-red-200 text-red-800',
        },
    },
};

// ── Modal Rechazo ─────────────────────────────────────────────────────────────
const ModalRechazo = ({ solicitud, onClose, onExito }) => {
    const [motivo, setMotivo] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);

    const handleRechazar = async () => {
        if (!motivo.trim()) { setError('Ingresa el motivo del rechazo.'); return; }
        setEnviando(true);
        try {
            await solicitudesApi.rechazarPosgrados(solicitud.id, motivo.trim());
            onExito();
        } catch (e) {
            setError(e.message || 'No se pudo rechazar.');
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !enviando) onClose(); }}>
            <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <h3 className="mb-1 text-lg font-bold text-slate-900">Rechazar solicitud</h3>
                <p className="mb-4 text-sm text-slate-500">
                    Estudiante: <strong>{solicitud.nombreEstudiante}</strong>
                </p>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Motivo <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={motivo}
                    onChange={(e) => { setMotivo(e.target.value); setError(null); }}
                    rows={4}
                    placeholder="Describe el motivo del rechazo…"
                    className="mb-3 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-red-400 focus:outline-none resize-none"
                />
                {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={enviando}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleRechazar} disabled={enviando || !motivo.trim()}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                        {enviando ? 'Rechazando…' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ListaSolicitudesPosgrados = () => {
    const { tipo, estado } = useParams();
    const [datos, setDatos] = useState({ terminacion: [], grado: [] });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [generandoId, setGenerandoId] = useState(null);
    const [errorAccion, setErrorAccion] = useState(null);
    const [solicitudARechazar, setSolicitudARechazar] = useState(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await solicitudesApi.getBandejaPosgrados();
            setDatos(data || { terminacion: [], grado: [] });
        } catch (e) {
            setError(e.message || 'No se pudo cargar.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const cfg = CONFIG[estado];
    if (!cfg) {
        return <p className="font-medium text-red-600">Sección no válida.</p>;
    }

    const listaBase = tipo === 'terminacion'
        ? (datos.terminacion || [])
        : (datos.grado || []);

    const solicitudes = estado === 'pendientes'
        ? listaBase.filter(s => ESTADOS_PENDIENTE.includes(s.estado))
        : estado === 'aprobadas'
            ? listaBase.filter(s => s.estado === 'APROBADA')
            : listaBase.filter(s => s.estado === 'RECHAZADA');

    const handleGenerar = async (s) => {
        setGenerandoId(s.id);
        setErrorAccion(null);
        try {
            let blob;
            if (s.estado === 'APROBADA_DIRECTOR') {
                ({ blob } = await solicitudesApi.aprobarPosgrados(s.id));
            } else {
                ({ blob } = await solicitudesApi.descargarCertificadoPdf(s.id));
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `acta-terminacion-${s.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            await cargar();
        } catch {
            setErrorAccion('No se pudo generar el acta.');
        } finally {
            setGenerandoId(null);
        }
    };

    const puedeGenerar = (s) =>
        tipo === 'terminacion' && (
            s.estado === 'APROBADA_DIRECTOR' ||
            (s.estado === 'APROBADA' && !s.actaGenerada)
        );

    const puedeRechazar = (s) =>
        s.estado !== 'RECHAZADA' && s.estado !== 'APROBADA';

    const tipoLabel = tipo === 'terminacion' ? 'TERMINACIÓN DE MATERIAS' : 'PROCESO DE GRADO';

    const columnas = [
        {
            header: 'Estudiante',
            render: (s) => (
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${cfg.colores.avatar}`}>
                        {(s.nombreEstudiante || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{s.nombreEstudiante || '—'}</p>
                        <p className="text-xs text-slate-500">CC {s.cedulaEstudiante} · Cód. {s.codigoEstudiante || '—'}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Programa',
            render: (s) => <p className="text-sm text-slate-600">{s.programa || '—'}</p>,
        },
        {
            header: 'Fecha',
            render: (s) => <p className="text-sm text-slate-600">{formatFecha(s.fechaSolicitud)}</p>,
        },
        {
            header: 'Estado',
            render: (s) => <EstadoBadge estado={s.estado} />,
        },
        ...(tipo === 'grado' ? [{
            header: 'Proyecto',
            render: (s) => <p className="text-sm text-slate-600 max-w-xs truncate">{s.tituloProyecto || '—'}</p>,
        }] : []),
    ];

    const renderAcciones = (s) => (
        <>
            {puedeGenerar(s) && (
                <button
                    type="button"
                    disabled={generandoId === s.id}
                    onClick={() => handleGenerar(s)}
                    className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {generandoId === s.id ? 'Generando…' : 'Generar acta'}
                </button>
            )}
            {puedeRechazar(s) && (
                <button
                    type="button"
                    disabled={generandoId === s.id}
                    onClick={() => setSolicitudARechazar(s)}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Rechazar
                </button>
            )}
        </>
    );

    const renderMobileCard = (s) => (
        <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${cfg.colores.avatar}`}>
                        {(s.nombreEstudiante || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{s.nombreEstudiante || '—'}</p>
                        <p className="text-xs text-slate-500">{formatFecha(s.fechaSolicitud)}</p>
                    </div>
                </div>
                <EstadoBadge estado={s.estado} />
            </div>
            <div className="text-xs text-slate-500 mb-3">
                <p>{s.programa || '—'}</p>
                <p>CC {s.cedulaEstudiante}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
                {puedeGenerar(s) && (
                    <button type="button" disabled={generandoId === s.id} onClick={() => handleGenerar(s)}
                        className="flex-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50">
                        {generandoId === s.id ? 'Generando…' : 'Generar acta'}
                    </button>
                )}
                {puedeRechazar(s) && (
                    <button type="button" disabled={generandoId === s.id} onClick={() => setSolicitudARechazar(s)}
                        className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                        Rechazar
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            <BandejaListadoLayout
                cfg={cfg}
                estado={estado}
                breadcrumb={`TRÁMITES / POSGRADOS / BANDEJA / ${tipoLabel}`}
                rutaVolver="/tramites"
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
                    onClose={() => setSolicitudARechazar(null)}
                    onExito={() => { setSolicitudARechazar(null); cargar(); }}
                />
            )}
        </>
    );
};

export default ListaSolicitudesPosgrados;
