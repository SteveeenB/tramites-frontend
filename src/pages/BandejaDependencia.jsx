import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMisSolicitudesPazYSalvo, responderPazYSalvo } from '../api/pazYSalvoApi';
import { ArrowLeftIcon, CheckCircleIcon, CheckIcon, ClockIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Alerta, Badge, Boton, Campo, Cargando, CLASE_CAMPO, EncabezadoPagina, Modal, TarjetaEstadistica } from '../components/ui';
import { UI } from '../constants/tramitesColors';

// ── Secciones visuales ────────────────────────────────────────────────────────
const SECCIONES = [
    {
        key: 'PENDIENTE', titulo: 'Pendientes', descripcion: 'Esperando tu respuesta',
        icono: ClockIcon, tono: 'advertencia',
        colores: { avatar: 'bg-amber-100 text-amber-800', iconWrapper: 'bg-amber-100 text-amber-700' },
    },
    {
        key: 'APROBADO', titulo: 'A Paz y Salvo', descripcion: 'Estudiantes sin deudas',
        icono: CheckCircleIcon, tono: 'exito',
        colores: { avatar: 'bg-green-100 text-green-800', iconWrapper: 'bg-green-100 text-green-700' },
    },
    {
        key: 'RECHAZADO', titulo: 'No a Paz y Salvo', descripcion: 'Estudiantes con deudas',
        icono: XCircleIcon, tono: 'error',
        colores: { avatar: 'bg-red-100 text-red-800', iconWrapper: 'bg-red-100 text-red-700' },
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

    const opcion = (valor, activa, Icono, texto) => (
        <button
            type="button"
            aria-pressed={decision === valor}
            onClick={() => setDecision(valor)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors ${UI.foco} ${decision === valor ? activa : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
            <Icono className="h-4 w-4" aria-hidden="true" />
            {texto}
        </button>
    );

    return (
        <Modal
            titulo="Responder Paz y Salvo"
            onCerrar={loading ? undefined : onClose}
            pie={(
                <>
                    <Boton variante="secundario" onClick={onClose} disabled={loading}>Cancelar</Boton>
                    <Boton
                        variante={decision === 'APROBADO' ? 'exito' : 'primario'}
                        onClick={handleSubmit}
                        cargando={loading}
                        disabled={decision === 'RECHAZADO' && !observaciones.trim()}
                    >
                        {loading ? 'Guardando…' : 'Confirmar'}
                    </Boton>
                </>
            )}
        >
            <p className="mb-5 text-sm text-gray-600">
                Estudiante: <span className="font-semibold text-gray-900">{pazYSalvo.nombreEstudiante || pazYSalvo.cedulaEstudiante}</span>
            </p>
            <fieldset className="mb-4">
                <legend className="mb-2 text-sm font-semibold text-gray-700">Decisión</legend>
                <div className="flex gap-3">
                    {opcion('APROBADO', 'border-green-600 bg-green-50 text-green-800', CheckIcon, 'A Paz y Salvo')}
                    {opcion('RECHAZADO', 'border-red-600 bg-red-50 text-red-800', XMarkIcon, 'No a Paz y Salvo')}
                </div>
            </fieldset>
            <Campo
                id="observaciones-paz-y-salvo"
                etiqueta="Observaciones"
                requerido={decision === 'RECHAZADO'}
                error={decision === 'RECHAZADO' && !observaciones.trim() ? 'El motivo es obligatorio al rechazar.' : undefined}
            >
                <textarea id="observaciones-paz-y-salvo" value={observaciones} onChange={e => setObservaciones(e.target.value)}
                    rows={3}
                    className={`${CLASE_CAMPO} resize-none`}
                    placeholder={decision === 'RECHAZADO' ? 'Indique el motivo (obligatorio)…' : 'Opcional'}
                    aria-describedby={decision === 'RECHAZADO' && !observaciones.trim() ? 'observaciones-paz-y-salvo-error' : undefined}
                />
            </Campo>
        </Modal>
    );
};

// ── Tabla de detalle ──────────────────────────────────────────────────────────
const TablaDetalle = ({ solicitudes, seccion, onResponder, onVolver }) => {
    const [modal, setModal] = useState(null);

    const handleConfirmar = async (id, decision, observaciones) => {
        await onResponder(id, decision, observaciones);
        setModal(null);
    };

    return (
        <>
            <EncabezadoPagina
                migas="Trámites / Paz y salvos"
                titulo={seccion.titulo}
                etiqueta={<Badge tono={seccion.tono}>{solicitudes.length}</Badge>}
                descripcion={seccion.descripcion}
                acciones={<Boton variante="secundario" icono={ArrowLeftIcon} onClick={onVolver}>Volver a la bandeja</Boton>}
            />

            <div className={UI.tarjeta}>
                {solicitudes.length === 0 ? (
                    <div className="px-6 py-20 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <seccion.icono className="h-7 w-7" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No hay solicitudes en este estado.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr className="border-b border-gray-200">
                                        {['Estudiante', 'Programa', 'Solicitud N°', 'Fecha', 'Observaciones'].map(h => (
                                            <th key={h} scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                                {h}
                                            </th>
                                        ))}
                                        <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {solicitudes.map(ps => (
                                        <tr key={ps.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${seccion.colores.avatar}`}>
                                                        {(ps.nombreEstudiante || '?').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{ps.nombreEstudiante || ps.cedulaEstudiante}</p>
                                                        <p className="text-xs text-gray-500">CC {ps.cedulaEstudiante}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{ps.programa || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">#{ps.solicitudId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {ps.fechaSolicitud ? new Date(ps.fechaSolicitud).toLocaleDateString('es-CO') : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                {ps.observaciones || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {ps.estado === 'PENDIENTE' && (
                                                        <Boton tamano="sm" onClick={() => setModal(ps)}>Responder</Boton>
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
                                <div key={ps.id} className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${seccion.colores.avatar}`}>
                                            {(ps.nombreEstudiante || '?').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{ps.nombreEstudiante || ps.cedulaEstudiante}</p>
                                            <p className="text-xs text-gray-500">{ps.programa || '—'}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">CC {ps.cedulaEstudiante} · Sol. #{ps.solicitudId}</p>
                                    {ps.observaciones && <p className="text-xs text-gray-600 mb-2">{ps.observaciones}</p>}
                                    {ps.estado === 'PENDIENTE' && (
                                        <Boton tamano="sm" anchoCompleto onClick={() => setModal(ps)}>Responder</Boton>
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
                    <EncabezadoPagina
                        migas="Trámites / Paz y salvos"
                        titulo="Paz y Salvos"
                        etiqueta={!loading && !error && <Badge tono="error">{total} total</Badge>}
                        descripcion="Revisa y responde las solicitudes de paz y salvo de los estudiantes que van a grado."
                    />
                </>
            )}

            {loading && <Cargando texto="Cargando paz y salvos…" />}

            {error && (
                <Alerta tipo="error">
                    {error}
                    <button type="button" onClick={cargar} className={`ml-3 rounded underline ${UI.foco}`}>Reintentar</button>
                </Alerta>
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
                    <div className="grid gap-4 sm:grid-cols-3">
                        {SECCIONES.map(sec => {
                            const cantidad = conteo(sec.key);
                            return (
                                <TarjetaEstadistica
                                    key={sec.key}
                                    icono={sec.icono}
                                    tono={sec.tono}
                                    titulo={sec.titulo}
                                    valor={cantidad}
                                    unidad={`solicitud${cantidad !== 1 ? 'es' : ''}`}
                                    descripcion={sec.descripcion}
                                    onClick={() => setVistaDetalle(sec.key)}
                                />
                            );
                        })}
                    </div>
                )
            )}
        </>
    );
}
