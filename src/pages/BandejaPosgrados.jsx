import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudesApi } from '../api/solicitudesApi';
import { useAuth } from '../hooks/useAuth';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../components/bandeja-director/icons';

const ESTADOS_PENDIENTE = ['EN_REVISION', 'PENDIENTE_PAGO', 'APROBADA_DIRECTOR'];

const agrupar = (lista) => ({
    pendientes: lista.filter(s => ESTADOS_PENDIENTE.includes(s.estado)),
    aprobadas:  lista.filter(s => s.estado === 'APROBADA'),
    rechazadas: lista.filter(s => s.estado === 'RECHAZADA'),
});

const SECCIONES = [
    {
        key:         'pendientes',
        titulo:      'En Proceso',
        descripcion: 'Esperando revisión o acción',
        icono:       <ClockIcon className="h-14 w-14" />,
        bg:          'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',
        sombra:      'shadow-amber-200',
        anillo:      'ring-amber-300',
    },
    {
        key:         'aprobadas',
        titulo:      'Aprobadas',
        descripcion: 'Certificado o proceso completado',
        icono:       <CheckCircleIcon className="h-14 w-14" />,
        bg:          'bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700',
        sombra:      'shadow-green-200',
        anillo:      'ring-green-300',
    },
    {
        key:         'rechazadas',
        titulo:      'Rechazadas',
        descripcion: 'Solicitudes no aprobadas',
        icono:       <XCircleIcon className="h-14 w-14" />,
        bg:          'bg-gradient-to-br from-red-400 to-rose-600 hover:from-red-500 hover:to-rose-700',
        sombra:      'shadow-red-200',
        anillo:      'ring-red-300',
    },
];

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

const TABS = [
    { key: 'terminacion', label: 'Terminación de Materias' },
    { key: 'grado',       label: 'Proceso de Grado' },
];

export default function BandejaPosgrados() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [tab, setTab] = useState('terminacion');
    const [datos, setDatos] = useState({ terminacion: [], grado: [] });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        if (!usuario) return;
        setCargando(true);
        setError(null);
        try {
            const data = await solicitudesApi.getBandejaPosgrados();
            setDatos(data || { terminacion: [], grado: [] });
        } catch (e) {
            setError(e.message || 'No se pudo cargar la bandeja.');
        } finally {
            setCargando(false);
        }
    }, [usuario]);

    useEffect(() => { cargar(); }, [cargar]);

    const lista   = tab === 'terminacion' ? (datos.terminacion || []) : (datos.grado || []);
    const grupos  = agrupar(lista);
    const total   = (datos.terminacion || []).length + (datos.grado || []).length;

    return (
        <>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                TRÁMITES / POSGRADOS / BANDEJA DE SOLICITUDES
            </div>

            <div className="mb-2 flex flex-wrap items-baseline gap-3">
                <h2 className="text-3xl font-bold text-slate-900">Bandeja de Solicitudes</h2>
                {!cargando && !error && (
                    <span className="rounded-full bg-red-100 px-3 py-0.5 text-sm font-bold text-red-700">
                        {total} total
                    </span>
                )}
            </div>
            <p className="mb-6 text-sm text-slate-500">
                Gestión de solicitudes de terminación de materias y proceso de grado.
            </p>

            {/* Tabs */}
            <div className="mb-8 flex gap-1 rounded-2xl bg-slate-100 p-1">
                {TABS.map(t => {
                    const cuenta = t.key === 'terminacion'
                        ? (datos.terminacion || []).length
                        : (datos.grado || []).length;
                    return (
                        <button key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {t.label}
                            <span className={`rounded-full px-2 py-0.5 text-xs ${tab === t.key ? 'bg-slate-100' : 'bg-slate-200'}`}>
                                {cuenta}
                            </span>
                        </button>
                    );
                })}
            </div>

            {cargando && (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-medium">Cargando bandeja…</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-2xl bg-red-50 px-6 py-5 text-sm font-medium text-red-600">
                    {error}
                    <button onClick={cargar} className="ml-3 underline">Reintentar</button>
                </div>
            )}

            {!cargando && !error && (
                <div className="grid flex-1 gap-6 sm:grid-cols-3">
                    {SECCIONES.map(sec => (
                        <TarjetaEstado
                            key={sec.key}
                            seccion={sec}
                            cantidad={(grupos[sec.key] || []).length}
                            onClick={() => navigate(`/tramites/bandeja-posgrados/${tab}/${sec.key}`)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
