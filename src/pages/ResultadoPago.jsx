import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default function ResultadoPago() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const referencia = searchParams.get('reference') || searchParams.get('ref');
    const statusUrl = searchParams.get('status');          // lo que trae la URL de Wompi

    const [estado, setEstado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!referencia) {
            setCargando(false);
            setEstado({ estado: statusUrl === 'APPROVED' ? 'APROBADO' : 'PENDIENTE', referencia: null });
            return;
        }

        const verificar = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const resp = await fetch(`${apiBase}/pagos/estado/${referencia}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!resp.ok) throw new Error('No se pudo verificar el pago');
                const data = await resp.json();
                setEstado(data);
            } catch (e) {
                // Fallback: usar el status de la URL si el backend no responde
                setEstado({ estado: statusUrl === 'APPROVED' ? 'APROBADO' : 'PENDIENTE', referencia });
            } finally {
                setCargando(false);
            }
        };
        verificar();
    }, [referencia, statusUrl]);

    const esAprobado = estado?.estado === 'APROBADO';
    const esRechazado = estado?.estado === 'RECHAZADO';

    const handleVolver = () => navigate('/proceso-de-grado');

    if (cargando) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <svg className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-slate-600 font-medium">Verificando tu pago…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Header UFPS */}
                <div className="text-center mb-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        UFPS — Sistema de Trámites de Posgrado
                    </p>
                </div>

                <div className="rounded-3xl bg-white shadow-lg overflow-hidden">

                    {/* Banner */}
                    <div className={`px-6 py-8 flex flex-col items-center text-center ${esAprobado ? 'bg-green-500' : esRechazado ? 'bg-red-500' : 'bg-amber-500'
                        }`}>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-4">
                            {esAprobado ? (
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : esRechazado ? (
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {esAprobado ? '¡Pago exitoso!' : esRechazado ? 'Pago rechazado' : 'Pago en proceso'}
                        </h2>
                        <p className="text-sm text-white/80">
                            {esAprobado
                                ? 'Tu pago fue procesado correctamente.'
                                : esRechazado
                                    ? 'El pago no pudo ser procesado.'
                                    : 'Estamos verificando tu pago.'}
                        </p>
                    </div>

                    {/* Detalle */}
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                            {referencia && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Referencia</span>
                                    <span className="text-sm font-mono font-medium text-slate-800">{referencia}</span>
                                </div>
                            )}
                            {estado?.monto && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Valor pagado</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(estado.monto)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</span>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${esAprobado ? 'bg-green-100 text-green-700' : esRechazado ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {esAprobado ? 'Aprobado' : esRechazado ? 'Rechazado' : 'Pendiente'}
                                </span>
                            </div>
                        </div>

                        {esAprobado && (
                            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                                Tu proceso ha sido actualizado. Puedes continuar con los siguientes pasos.
                            </div>
                        )}

                        {esRechazado && (
                            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                El pago fue rechazado o cancelado. Puedes intentarlo nuevamente desde tu proceso de grado.
                            </div>
                        )}

                        <button
                            onClick={handleVolver}
                            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                            Volver al proceso de grado
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Universidad Francisco de Paula Santander · Sección de Posgrados
                </p>
            </div>
        </div>
    );
}