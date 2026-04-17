import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ──────────────────────────────────────────────
// Constantes de certificados
// ──────────────────────────────────────────────
const CERTIFICADOS = [
  {
    id: 'CONSTANCIA_REGISTRO_CALIFICADO',
    label: 'CONSTANCIA REGISTRO CALIFICADO DE UN PROGRAMA ACADEMICO',
    precioDigital: 8800,
    precioFisico: 12500,
  },
  {
    id: 'CONSTANCIA_MATRICULA',
    label: 'CONSTANCIA MATRICULA ACADEMICA POSGRADO',
    precioDigital: 6500,
    precioFisico: 9800,
  },
  {
    id: 'CONSTANCIA_BUENA_CONDUCTA',
    label: 'CONSTANCIA BUENA CONDUCTA POSGRADO',
    precioDigital: 7200,
    precioFisico: 11000,
  },
];

const ESTADOS_BADGE = {
  PENDIENTE_PAGO: {
    label: 'Pendiente de pago',
    className: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',
  },
  EN_REVISION: {
    label: 'En revisión',
    className: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300',
  },
  APROBADA: {
    label: 'Aprobada',
    className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300',
  },
  RECHAZADA: {
    label: 'Rechazada',
    className: 'bg-red-100 text-red-700 ring-1 ring-red-300',
  },
};

const formatPesos = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ──────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────
const SidebarLink = ({ children, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
      active
        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-amber-500" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm11-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const CertIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-600" fill="currentColor">
    <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-red-500" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
const Certificados = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [certSeleccionado, setCertSeleccionado] = useState(CERTIFICADOS[0].id);
  const [modalidad, setModalidad] = useState('DIGITAL');
  const [historial, setHistorial] = useState([]);
  const [generando, setGenerando] = useState(false);

  const cert = CERTIFICADOS.find((c) => c.id === certSeleccionado);
  const precio = modalidad === 'DIGITAL' ? cert.precioDigital : cert.precioFisico;

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleGenerarRecibo = () => {
    setGenerando(true);
    setTimeout(() => {
      const nueva = {
        id: Date.now(),
        tipo: cert.label,
        modalidad: modalidad === 'DIGITAL' ? 'Digital' : 'Física',
        fecha: new Date().toLocaleDateString('es-CO'),
        costo: precio,
        estado: 'PENDIENTE_PAGO',
      };
      setHistorial((prev) => [nueva, ...prev]);
      setGenerando(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* ── SIDEBAR ── */}
        <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-80 lg:border-b-0 lg:border-r">
          <div className="flex-1 px-5 py-6">
            {/* Info usuario */}
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-red-100 text-lg font-bold text-red-700">
                {(usuario?.nombre || 'E').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Estudiante</p>
                <p className="font-semibold text-slate-900">{usuario?.nombre || 'Estudiante'}</p>
                {usuario?.programaAcademico && (
                  <p className="mt-0.5 text-xs text-slate-500">{usuario.programaAcademico}</p>
                )}
              </div>
            </div>

            {/* Navegación */}
            <nav className="space-y-2">
              <SidebarLink onClick={() => {}}>Información Estudiantil</SidebarLink>
              <SidebarLink onClick={() => {}}>Información Académica</SidebarLink>
              <div className="rounded-2xl bg-slate-50 p-3">
                <SidebarLink onClick={() => navigate('/tramites')}>Trámites</SidebarLink>
                <div className="mt-2 space-y-2 pl-3">
                  <SidebarLink onClick={() => navigate('/proceso-de-grado')}>
                    Proceso de Grado
                  </SidebarLink>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 ring-1 ring-red-200"
                  >
                    Certificados
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Acceso rápido proceso de grado */}
          <div className="border-t border-slate-200 p-5">
            <button
              type="button"
              onClick={() => navigate('/tramites')}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Volver a Trámites
            </button>
          </div>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex items-center justify-between gap-4 bg-red-600 px-6 py-4 text-white shadow-sm md:px-8">
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">ESTUDIANTES</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                  {(usuario?.nombre || 'U').slice(0, 2).toUpperCase()}
                </div>
                <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-80 cursor-pointer hover:opacity-100" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 opacity-80 cursor-pointer hover:opacity-100"
                fill="currentColor"
                onClick={() => navigate('/tramites')}
              >
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 p-6 md:p-8">
            {/* Breadcrumb */}
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span
                className="cursor-pointer hover:text-slate-600"
                onClick={() => navigate('/tramites')}
              >
                Trámites
              </span>
              <span>/</span>
              <span className="text-red-600">Certificados</span>
            </div>

            {/* Título + fecha */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Certificados</h2>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700">{fechaActual}</p>
              </div>
            </div>

            {/* Advertencia */}
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <WarningIcon />
                <div>
                  <p className="mb-2 text-sm font-bold text-amber-800">Advertencia</p>
                  <ul className="space-y-1 text-sm text-amber-700 list-disc list-inside leading-relaxed">
                    <li>Dispone de 3 días hábiles para cancelar el recibo de pago generado. Vencido el plazo deberá generarlo nuevamente.</li>
                    <li>Solo puede tener una solicitud vigente por tipo de certificado.</li>
                    <li>El pago puede realizarse en Bancolombia, Davienda o Banco de Bogotá.</li>
                    <li>Una vez realizado el pago, el certificado digital será enviado a su correo en un plazo de 3 a 5 minutos.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── TARJETA SOLICITAR ── */}
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <CertIcon />
                <h3 className="text-lg font-bold text-slate-900">Solicitar Certificado</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Tipo de certificado */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Tipo de Certificado
                  </label>
                  <div className="relative">
                    <select
                      value={certSeleccionado}
                      onChange={(e) => setCertSeleccionado(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      {CERTIFICADOS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Valor</p>
                    <p className="text-2xl font-extrabold text-red-600">
                      {formatPesos(precio)}
                    </p>
                  </div>
                </div>

                {/* Modalidad */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Modalidad de Entrega
                  </label>
                  <div className="space-y-3 pt-1">
                    {[
                      { value: 'DIGITAL', label: 'Digital (correo electrónico)' },
                      { value: 'FISICA', label: 'Física (recoger en oficina)' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                      >
                        <input
                          type="radio"
                          name="modalidad"
                          value={opt.value}
                          checked={modalidad === opt.value}
                          onChange={() => setModalidad(opt.value)}
                          className="h-4 w-4 accent-red-600"
                        />
                        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                        {opt.value !== modalidad && (
                          <span className="ml-auto text-xs text-slate-400">
                            +{formatPesos(cert.precioFisico - cert.precioDigital)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón generar */}
              <div className="mt-6 flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleGenerarRecibo}
                  disabled={generando}
                  className="flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RefreshIcon />
                  {generando ? 'Generando…' : 'Generar Recibo de Pago'}
                </button>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <InfoIcon />
                  Nota: Si ya dispone de una solicitud vigente, esta no aparecerá como opción para crear un nuevo recibo.
                </p>
              </div>
            </div>

            {/* ── HISTORIAL ── */}
            {historial.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h3 className="text-base font-bold text-slate-900">Historial de Solicitudes</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {historial.length} solicitud{historial.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        <th className="px-6 py-3 text-left">Tipo de Certificado</th>
                        <th className="px-6 py-3 text-left">Modalidad</th>
                        <th className="px-6 py-3 text-left">Fecha</th>
                        <th className="px-6 py-3 text-right">Costo</th>
                        <th className="px-6 py-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historial.map((item) => {
                        const badge = ESTADOS_BADGE[item.estado] || {
                          label: item.estado,
                          className: 'bg-slate-100 text-slate-600',
                        };
                        return (
                          <tr key={item.id} className="transition hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800 max-w-xs">
                              <span className="line-clamp-2">{item.tipo}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{item.modalidad}</td>
                            <td className="px-6 py-4 text-slate-600">{item.fecha}</td>
                            <td className="px-6 py-4 text-right font-semibold text-slate-800">
                              {formatPesos(item.costo)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Estado vacío historial */}
            {historial.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-12 text-center shadow-sm">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <CertIcon />
                </div>
                <p className="text-sm font-semibold text-slate-500">Sin solicitudes aún</p>
                <p className="mt-1 text-xs text-slate-400">
                  Al generar un recibo de pago, aparecerá aquí el historial de tus certificados.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Certificados;
