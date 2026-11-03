import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default function ResultadoPago() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const referencia = searchParams.get('reference') || searchParams.get('ref');
    const statusUrl = searchParams.get('status');

    // Mostrar resultado inmediatamente desde los params de la URL
    const estadoInicial = statusUrl === 'APPROVED'
        ? 'APROBADO'
        : statusUrl === 'DECLINED' || statusUrl === 'ERROR'
            ? 'RECHAZADO'
            : 'PENDIENTE';

    const [estado, setEstado] = useState({ estado: estadoInicial, referencia });
    const [monto, setMonto] = useState(null);

    // Consulta en segundo plano para obtener detalles (monto, estado real de DB)
    useEffect(() => {
        if (!referencia) return;
        const token = localStorage.getItem('auth_token');
        fetch(`${apiBase}/pagos/estado/${referencia}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                // Solo actualizar si el backend ya procesó el webhook (no PENDIENTE)
                if (data.estado !== 'PENDIENTE') setEstado(data);
                if (data.monto) setMonto(data.monto);
            })
            .catch(() => {});
    }, [referencia]);

    const esAprobado = estado?.estado === 'APROBADO';
    const esRechazado = estado?.estado === 'RECHAZADO';
    const esCertificado = estado?.tipoPago === 'CERTIFICADO';

    const handleVolver = () => navigate(esCertificado ? '/certificados' : '/proceso-de-grado');

    return (
        <div className="min-h-screen bg-fondo flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                <div className="mb-8 flex items-center justify-center gap-3">
                    <img src="/LOGO.png" alt="Logo UFPS" className="h-10 w-10 rounded-sm" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                        UFPS · Sistema de Posgrados
                    </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow animate-fade-in-up">

                    {/* Banner */}
                    <div className={`px-6 py-8 flex flex-col items-center text-center ${esAprobado ? 'bg-green-700' : esRechazado ? 'bg-primario' : 'bg-amber-700'}`}>
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
                        <h1 className="text-xl font-bold text-white mb-1">
                            {esAprobado ? '¡Pago exitoso!' : esRechazado ? 'Pago rechazado' : 'Pago en proceso'}
                        </h1>
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
                        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                            {referencia && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Referencia</span>
                                    <span className="text-sm font-mono font-medium text-gray-800">{referencia}</span>
                                </div>
                            )}
                            {monto && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Valor pagado</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(monto)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</span>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${esAprobado ? 'bg-green-100 text-green-700' : esRechazado ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {esAprobado ? 'Aprobado' : esRechazado ? 'Rechazado' : 'Pendiente'}
                                </span>
                            </div>
                        </div>

                        {esAprobado && (
                            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                                Tu proceso ha sido actualizado. Puedes continuar con los siguientes pasos.
                            </div>
                        )}

                        {esRechazado && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                El pago fue rechazado o cancelado. Puedes intentarlo nuevamente desde tu proceso de grado.
                            </div>
                        )}

                        {!esAprobado && !esRechazado && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                                Si completaste el pago, el estado se actualizará en unos segundos al volver a tu proceso.
                            </div>
                        )}

                        <button
                            onClick={handleVolver}
                            className="w-full rounded-lg bg-primario px-5 py-3 text-sm font-semibold text-white hover:bg-primario-hover transition"
                        >
                            {esCertificado ? 'Volver a Certificados' : 'Volver al proceso de grado'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Universidad Francisco de Paula Santander · Sección de Posgrados
                </p>
            </div>
        </div>
    );
}
