import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { solicitudesApi } from '../api/solicitudesApi';

export default function VerificarCertificado() {
    const [searchParams] = useSearchParams();
    const codigoUrl = searchParams.get('codigo') || '';

    const [codigo, setCodigo] = useState(codigoUrl);
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const verificar = async (cod) => {
        if (!cod?.trim()) return;
        setCargando(true);
        setError(null);
        setResultado(null);
        try {
            const data = await solicitudesApi.verificarCertificado(cod.trim());
            setResultado(data);
        } catch (e) {
            setError('No se pudo conectar con el servidor de verificación.');
        } finally {
            setCargando(false);
        }
    };

    // Si viene el código en la URL, verificar automáticamente
    useEffect(() => {
        if (codigoUrl) verificar(codigoUrl);
    }, [codigoUrl]);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Header institucional */}
            <header className="bg-blue-700 text-white px-6 py-4 shadow-md">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">UFPS — Sección de Posgrados</p>
                        <h1 className="text-lg font-bold">Verificación de Certificados</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 py-12">
                <div className="w-full max-w-2xl space-y-6">

                    {/* Instrucciones */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-lg font-bold text-slate-900">Verificar autenticidad</h2>
                        <p className="mb-4 text-sm text-slate-600 leading-6">
                            Ingresa el código de verificación que aparece en el certificado expedido por la
                            Sección de Posgrados de la Universidad Francisco de Paula Santander.
                            El código tiene el formato <strong>UFPS-TM-XXX-XXXX</strong>.
                        </p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && verificar(codigo)}
                                placeholder="Ej: UFPS-TM-55-0010"
                                className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-mono text-slate-800 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={() => verificar(codigo)}
                                disabled={cargando || !codigo.trim()}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cargando ? (
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                                Verificar
                            </button>
                        </div>
                    </div>

                    {/* Error de conexión */}
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Resultado: VÁLIDO */}
                    {resultado?.valido && (
                        <div className="rounded-2xl border-2 border-green-400 bg-white shadow-md overflow-hidden">
                            {/* Banner verde */}
                            <div className="bg-green-500 px-6 py-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-green-100">Certificado válido</p>
                                    <p className="text-lg font-bold text-white">Documento auténtico y vigente</p>
                                </div>
                            </div>

                            {/* Datos del certificado */}
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Nombre</p>
                                        <p className="text-sm font-semibold text-slate-900">{resultado.nombre}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Cédula</p>
                                        <p className="text-sm font-semibold text-slate-900">{resultado.cedula}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-4 col-span-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Programa académico</p>
                                        <p className="text-sm font-semibold text-slate-900">{resultado.programa}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Fecha de expedición</p>
                                        <p className="text-sm font-semibold text-slate-900">{resultado.fechaAprobacion}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Código de verificación</p>
                                        <p className="text-sm font-mono font-semibold text-blue-700">{resultado.codigo}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3">
                                    <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-medium text-green-800">
                                        Este certificado fue expedido oficialmente por la Sección de Posgrados de la
                                        Universidad Francisco de Paula Santander y tiene plena validez académica e institucional.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resultado: INVÁLIDO */}
                    {resultado && !resultado.valido && (
                        <div className="rounded-2xl border-2 border-red-400 bg-white shadow-md overflow-hidden">
                            <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-red-100">Verificación fallida</p>
                                    <p className="text-lg font-bold text-white">Certificado no válido</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-700 mb-4">{resultado.mensaje}</p>
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-800">
                                        Si crees que esto es un error, comunícate con la Sección de Posgrados de la UFPS.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-400">
                        Universidad Francisco de Paula Santander · Sección de Posgrados · San José de Cúcuta, Colombia
                    </p>
                </div>
            </main>
        </div>
    );
}