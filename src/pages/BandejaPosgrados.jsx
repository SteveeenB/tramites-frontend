import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudesApi } from '../api/solicitudesApi';
import { useAuth } from '../hooks/useAuth';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Alerta, Badge, Cargando, EncabezadoPagina, TarjetaEstadistica } from '../components/ui';
import { UI } from '../constants/tramitesColors';

const ESTADOS_PENDIENTE = ['EN_REVISION', 'PENDIENTE_PAGO', 'APROBADA_DIRECTOR'];

// FIX TP-198 (Johan Bueno, 07/10/2026): la bandeja de Posgrados también
// agrupa como "rechazadas" las que ella misma rechazó (RECHAZADA_POSGRADOS),
// no sólo las que rechazó el Director (RECHAZADA). Antes el estado terminal
// RECHAZADA_POSGRADOS no caía en ninguna sección y las solicitudes
// desaparecían de la vista (CP-029).
const ESTADOS_RECHAZADA = ['RECHAZADA', 'RECHAZADA_POSGRADOS'];

const agrupar = (lista) => ({
    pendientes: lista.filter(s => ESTADOS_PENDIENTE.includes(s.estado)),
    aprobadas:  lista.filter(s => s.estado === 'APROBADA'),
    rechazadas: lista.filter(s => ESTADOS_RECHAZADA.includes(s.estado)),
});

const SECCIONES = [
    { key: 'pendientes', titulo: 'En Proceso',  descripcion: 'Esperando revisión o acción',      icono: ClockIcon,       tono: 'advertencia' },
    { key: 'aprobadas',  titulo: 'Aprobadas',   descripcion: 'Certificado o proceso completado', icono: CheckCircleIcon, tono: 'exito' },
    { key: 'rechazadas', titulo: 'Rechazadas',  descripcion: 'Solicitudes no aprobadas',         icono: XCircleIcon,     tono: 'error' },
];

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
            <EncabezadoPagina
                migas="Trámites / Posgrados / Bandeja de solicitudes"
                titulo="Bandeja de Solicitudes"
                etiqueta={!cargando && !error && <Badge tono="error">{total} total</Badge>}
                descripcion="Gestión de solicitudes de terminación de materias y proceso de grado."
            />

            {/* Tabs */}
            <div className="mb-8 flex gap-1 rounded-lg bg-gray-100 p-1">
                {TABS.map(t => {
                    const cuenta = t.key === 'terminacion'
                        ? (datos.terminacion || []).length
                        : (datos.grado || []).length;
                    return (
                        <button key={t.key}
                            type="button"
                            aria-pressed={tab === t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${UI.foco} ${tab === t.key ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}>
                            {t.label}
                            <span className={`rounded-full px-2 py-0.5 text-xs ${tab === t.key ? 'bg-gray-100' : 'bg-gray-200'}`}>
                                {cuenta}
                            </span>
                        </button>
                    );
                })}
            </div>

            {cargando && <Cargando texto="Cargando bandeja…" />}

            {error && (
                <Alerta tipo="error">
                    {error}
                    <button type="button" onClick={cargar} className={`ml-3 rounded underline ${UI.foco}`}>Reintentar</button>
                </Alerta>
            )}

            {!cargando && !error && (
                <div className="grid gap-4 sm:grid-cols-3">
                    {SECCIONES.map(sec => {
                        const cantidad = (grupos[sec.key] || []).length;
                        return (
                            <TarjetaEstadistica
                                key={sec.key}
                                icono={sec.icono}
                                tono={sec.tono}
                                titulo={sec.titulo}
                                valor={cantidad}
                                unidad={`solicitud${cantidad !== 1 ? 'es' : ''}`}
                                descripcion={sec.descripcion}
                                onClick={() => navigate(`/tramites/bandeja-posgrados/${tab}/${sec.key}`)}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}
