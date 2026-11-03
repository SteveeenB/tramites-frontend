import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient, downloadApiClient } from '../api/apiClient';
import PanelLayout from '../components/layout/PanelLayout';
import { parseFecha } from '../constants/procesodeGrado';
import { COLORES_IMPRESION as C } from '../constants/tramitesColors';

// ── Badges por estado de la solicitud ─────────────────────────────────
const ESTADOS_BADGE = {
  PENDIENTE_PAGO: { label: 'Pendiente de pago', className: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' },
  PAGADO:         { label: 'Generando…',        className: 'bg-blue-100  text-blue-700  ring-1 ring-blue-300'  },
  GENERADO:       { label: 'Generado',          className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' },
  LISTO_RETIRO:   { label: 'Listo para retiro', className: 'bg-teal-100  text-teal-700  ring-1 ring-teal-300'  },
  ENTREGADO:      { label: 'Entregado',         className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-300' },
  VENCIDA:        { label: 'Vencida',           className: 'bg-red-100   text-red-700   ring-1 ring-red-300'   },
};

const ESTADOS_DESCARGABLES = new Set(['GENERADO', 'LISTO_RETIRO', 'ENTREGADO']);

const formatPesos = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n || 0);

const formatFecha = (s) => {
  if (!s) return '—';
  const d = parseFecha(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── Sub-componentes UI ────────────────────────────────────────────────
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-amber-700" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm11-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const CertIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-700" fill="currentColor">
    <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-red-700" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M5 20h14v-2H5v2zm7-18L5.33 8.67 6.74 10.08 11 5.83V16h2V5.83l4.26 4.25 1.41-1.41L12 2z" />
  </svg>
);

const ReceiptIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19 2H5v20l3.5-2 3.5 2 3.5-2 3.5 2V2zm-3 12H8v-2h8v2zm0-4H8V8h8v2z" />
  </svg>
);

// ── Costo total mostrado en una fila del historial ────────────────────
const computeCosto = (item, tipos) => {
  if (item.costo != null) return item.costo;
  const t = tipos.find((c) => c.codigo === item.tipoCertificado);
  if (!t) return 0;
  const base = t.precioDigital || 0;
  const delta = t.costoLogisticaFisica || 0;
  return item.modalidadEnvio === 'FISICA' ? base + delta : base;
};

// ── Página principal ──────────────────────────────────────────────────
const Certificados = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [tipos, setTipos] = useState([]);
  const [certSeleccionado, setCertSeleccionado] = useState('');
  const [modalidad, setModalidad] = useState('DIGITAL');
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [pagando, setPagando] = useState(null);
  const [descargandoId, setDescargandoId] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // ── Computados ────────────────────────────────────────────────────
  const cert = tipos.find((c) => c.codigo === certSeleccionado);
  const precioBase  = cert?.precioDigital || 0;
  const deltaFisico = cert?.costoLogisticaFisica || 0;
  const precio = modalidad === 'FISICA' ? precioBase + deltaFisico : precioBase;

  const tieneVigente = historial.some(
    (item) => item.tipoCertificado === certSeleccionado && item.estado === 'PENDIENTE_PAGO'
  );

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  // ── Carga inicial ──────────────────────────────────────────────────
  useEffect(() => {
    apiClient('/certificados/tipos')
      .then((data) => {
        if (!data) return;
        setTipos(data);
        if (data.length > 0) setCertSeleccionado(data[0].codigo);
      })
      .catch((e) => console.error('Error cargando tipos:', e));
  }, []);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!usuario) return;
      try {
        setCargando(true);
        const data = await apiClient('/certificados');
        setHistorial((data || []).sort((a, b) => {
          const diff = new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud);
          return diff !== 0 ? diff : b.id - a.id;
        }));
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargarHistorial();
  }, [usuario]);

  // ── Acciones ──────────────────────────────────────────────────────
  const handleGenerarRecibo = async () => {
    if (!usuario) return;
    setGenerando(true);
    setError('');
    try {
      const data = await apiClient(
        `/certificados/solicitar?tipo=${certSeleccionado}&modalidad=${modalidad}`,
        { method: 'POST' }
      );
      setHistorial((prev) => [data, ...prev]);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerando(false);
    }
  };

  const handlePagar = async (id) => {
    if (!usuario) return;
    setPagando(id);
    setError('');
    try {
      const data = await apiClient('/pagos/certificado/crear', {
        method: 'POST',
        body: JSON.stringify({ certificadoId: id, cedula: usuario.cedula }),
      });
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e.message);
      setPagando(null);
    }
  };

  const handleDescargarPdf = async (id) => {
    if (!usuario) return;
    setDescargandoId(id);
    setError('');
    try {
      const { blob } = await downloadApiClient(`/certificados/${id}/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `constancia-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setDescargandoId(null);
    }
  };

  const handleDescargarRecibo = (item) => {
    // Recibo PSE simulado: ventana imprimible con datos clave.
    const w = window.open('', '_blank');
    if (!w) return;
    const tipo = tipos.find((t) => t.codigo === item.tipoCertificado);
    w.document.write(`
      <html><head><title>Recibo de Pago — Solicitud ${item.id}</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;color:${C.texto}}h1{color:${C.primario}}
      .box{border:1px solid ${C.borde};border-radius:8px;padding:20px;margin-top:20px;background:${C.fondo}}
      .row{display:flex;justify-content:space-between;margin:6px 0}
      .valor{font-size:32px;font-weight:bold;color:${C.primario};text-align:center;margin:20px 0}</style></head>
      <body><h1>UFPS - Sección de Posgrados</h1><h2>Recibo de Pago</h2>
      <div class="box">
        <div class="row"><strong>N° Solicitud:</strong><span>${item.id}</span></div>
        <div class="row"><strong>Tipo:</strong><span>${tipo?.label || item.tipoCertificado}</span></div>
        <div class="row"><strong>Modalidad:</strong><span>${item.modalidadEnvio}</span></div>
        <div class="row"><strong>Fecha solicitud:</strong><span>${formatFecha(item.fechaSolicitud)}</span></div>
        <div class="row"><strong>Vencimiento:</strong><span>${formatFecha(item.fechaVencimientoPago)}</span></div>
        <div class="valor">${formatPesos(item.costo)}</div>
        <p style="font-size:12px;color:${C.textoSuave}">Pague por PSE o en ventanilla antes de la fecha de vencimiento.</p>
      </div></body></html>
    `);
    w.document.close();
  };

  // ── Helpers ───────────────────────────────────────────────────────
  const getLabelTipo = (codigo) => tipos.find((t) => t.codigo === codigo)?.label || codigo;
  const getModalidadLabel = (m) => (m === 'DIGITAL' ? 'Digital' : 'Física');

  // ── Modal de confirmación ─────────────────────────────────────────
  const ModalConfirmacion = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-bold text-gray-900">Aceptación de términos</h3>
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-bold text-amber-900 mb-1">Recibo de Pago: {cert?.label}</p>
          <p className="text-sm font-bold text-amber-900 mb-3">
            Valor: {formatPesos(precio)} {modalidad === 'FISICA' && deltaFisico > 0 && (
              <span className="text-xs font-normal text-amber-700">
                ({formatPesos(precioBase)} + {formatPesos(deltaFisico)} logística)
              </span>
            )}
          </p>
          <p className="text-sm text-amber-800 mb-2">
            Tenga en cuenta que generar un recibo de pago se considera un compromiso.
          </p>
          <p className="text-sm font-bold text-amber-900 text-center">
            ¿Realmente desea Generar el Recibo de Pago?
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setMostrarConfirmacion(false)}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Rechazar
          </button>
          <button type="button" onClick={() => { setMostrarConfirmacion(false); handleGenerarRecibo(); }}
            className="flex-1 rounded-lg bg-primario px-4 py-2.5 text-sm font-semibold text-white hover:bg-primario-hover">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );

  // Botones de acción de una solicitud. Se usan en la tabla (escritorio) y en las
  // tarjetas (móvil).
  const renderAcciones = (item) => {
    const descargable = ESTADOS_DESCARGABLES.has(item.estado);
    const esPendiente = item.estado === 'PENDIENTE_PAGO';
    const esVencida   = item.estado === 'VENCIDA';
    return (
      <div className="flex flex-col items-stretch gap-1.5">
        {esPendiente && (
          <>
            <button type="button" onClick={() => handleDescargarRecibo(item)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <ReceiptIcon /> Recibo
            </button>
            <button type="button" onClick={() => handlePagar(item.id)} disabled={pagando === item.id}
              className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed">
              {pagando === item.id ? 'Procesando…' : 'Pagar'}
            </button>
          </>
        )}
        {descargable && (
          <button type="button" onClick={() => handleDescargarPdf(item.id)} disabled={descargandoId === item.id}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primario px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primario-hover disabled:opacity-60">
            <DownloadIcon />
            {descargandoId === item.id ? 'Descargando…' : 'Descargar PDF'}
          </button>
        )}
        {esVencida && (
          <span className="text-xs text-gray-500 text-center">—</span>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <PanelLayout usuario={usuario} selectedMenuId="certificados">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
        <button type="button" className="rounded uppercase tracking-wider hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primario-borde" onClick={() => navigate('/tramites')}>Trámites</button>
        <span>/</span>
        <span className="text-red-700">Certificados</span>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900">Certificados</h1>
        <p className="text-sm font-semibold text-gray-700">{fechaActual}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <WarningIcon />
          <div>
            <p className="mb-2 text-sm font-bold text-amber-800">Advertencia</p>
            <ul className="space-y-1 text-sm text-amber-700 list-disc list-inside leading-relaxed">
              <li>Dispone de 3 días para cancelar el recibo de pago generado.</li>
              <li>Solo puede tener una solicitud vigente por tipo de certificado.</li>
              <li>El pago puede realizarse en Bancolombia, Davivienda o Banco de Bogotá.</li>
              <li>Una vez confirmado el pago, el certificado digital se envía al correo en 3 a 5 minutos.</li>
              <li>Si elige modalidad física, el documento digital también queda disponible para descarga.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tarjeta solicitar */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="mb-6 flex items-center gap-2">
          <CertIcon />
          <h3 className="text-lg font-bold text-gray-900">Solicitar Certificado</h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="tipo-certificado" className="mb-2 block text-sm font-semibold text-gray-700">
              Tipo de Certificado
            </label>
            <div className="relative">
              <select id="tipo-certificado" value={certSeleccionado} onChange={(e) => setCertSeleccionado(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-semibold text-gray-800 shadow transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-primario-borde">
                {tipos.map((c) => (
                  <option key={c.codigo} value={c.codigo}>{c.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
              </div>
            </div>
            {cert?.descripcion && (
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">{cert.descripcion}</p>
            )}
            <div className="mt-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Valor</p>
              <p className="text-2xl font-bold text-red-700">{formatPesos(precio)}</p>
              {modalidad === 'FISICA' && deltaFisico > 0 && (
                <p className="text-xs text-gray-500">
                  Incluye {formatPesos(deltaFisico)} de impresión y sello físico.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Modalidad de Entrega
            </label>
            <div className="space-y-3 pt-1">
              {[
                { value: 'DIGITAL', label: 'Digital (correo electrónico)' },
                { value: 'FISICA',  label: 'Física (recoger en oficina)' },
              ].map((opt) => (
                <label key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:bg-gray-100">
                  <input type="radio" name="modalidad" value={opt.value}
                    checked={modalidad === opt.value} onChange={() => setModalidad(opt.value)}
                    className="h-4 w-4 accent-red-600" />
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  {opt.value === 'FISICA' && cert && deltaFisico > 0 && modalidad !== 'FISICA' && (
                    <span className="ml-auto text-xs text-gray-500">+{formatPesos(deltaFisico)}</span>
                  )}
                </label>
              ))}
            </div>
            {modalidad === 'FISICA' && cert?.direccionOficina && (
              <p className="mt-3 text-xs text-gray-500">
                Retiro en: <span className="font-semibold text-gray-700">{cert.direccionOficina}</span>
                {cert.tiempoEntregaDias > 0 && (
                  <> · Aprox. {cert.tiempoEntregaDias} día(s) hábil(es)</>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-end gap-2">
          <button type="button" onClick={() => setMostrarConfirmacion(true)} disabled={generando || tieneVigente}
            className="flex items-center gap-2 rounded-lg bg-red-700 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed">
            <RefreshIcon />
            {generando ? 'Generando…' : tieneVigente ? 'Ya tienes una solicitud vigente' : 'Generar Recibo de Pago'}
          </button>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <InfoIcon />
            Si ya dispone de una solicitud vigente, debe pagarla o esperar el vencimiento antes de generar otra.
          </p>
        </div>
      </div>

      {/* Historial unificado */}
      {cargando ? (
        <div className="flex justify-center py-12 text-sm text-gray-600">Cargando historial...</div>
      ) : historial.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-bold text-gray-900">Mis Certificados</h3>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {historial.length} solicitud{historial.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="px-4 py-3 text-left">N°</th>
                  <th className="px-4 py-3 text-left">Tipo de Certificado</th>
                  <th className="px-4 py-3 text-left">Modalidad</th>
                  <th className="px-4 py-3 text-left">Fecha solicitud</th>
                  <th className="px-4 py-3 text-left">Vencimiento pago</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historial.map((item, idx) => {
                  const badge = ESTADOS_BADGE[item.estado] || {
                    label: item.estado,
                    className: 'bg-gray-100 text-gray-600',
                  };
                  return (
                    <tr key={item.id} className="transition hover:bg-gray-50 align-top">
                      <td className="px-4 py-4 font-semibold text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-gray-800 max-w-xs">
                        <span className="line-clamp-2">{getLabelTipo(item.tipoCertificado)}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{getModalidadLabel(item.modalidadEnvio)}</td>
                      <td className="px-4 py-4 text-gray-600">{formatFecha(item.fechaSolicitud)}</td>
                      <td className="px-4 py-4 text-gray-600">{formatFecha(item.fechaVencimientoPago)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-800">
                        {formatPesos(computeCosto(item, tipos))}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${badge.className}`}>
                          {badge.label}
                        </span>
                        {item.estado === 'LISTO_RETIRO' && item.tipo?.direccionOficina && (
                          <p className="mt-1 text-[10px] text-gray-500">{item.tipo.direccionOficina}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {renderAcciones(item)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Móvil: una tarjeta por solicitud (la tabla de 8 columnas se cortaba) */}
          <ul className="divide-y divide-gray-100 md:hidden">
            {historial.map((item) => {
              const badge = ESTADOS_BADGE[item.estado] || {
                label: item.estado,
                className: 'bg-gray-100 text-gray-600',
              };
              return (
                <li key={item.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">{getLabelTipo(item.tipoCertificado)}</p>
                    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-gray-500">Valor</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-800">{formatPesos(computeCosto(item, tipos))}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-gray-500">Modalidad</dt>
                      <dd className="mt-0.5 text-gray-600">{getModalidadLabel(item.modalidadEnvio)}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-gray-500">Solicitud</dt>
                      <dd className="mt-0.5 text-gray-600">{formatFecha(item.fechaSolicitud)}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-gray-500">Vence el pago</dt>
                      <dd className="mt-0.5 text-gray-600">{formatFecha(item.fechaVencimientoPago)}</dd>
                    </div>
                  </dl>
                  {item.estado === 'LISTO_RETIRO' && item.tipo?.direccionOficina && (
                    <p className="text-xs text-gray-500">{item.tipo.direccionOficina}</p>
                  )}
                  {renderAcciones(item)}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (

        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 text-center shadow">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <CertIcon />
          </div>
          <p className="text-sm font-semibold text-gray-600">Sin solicitudes aún</p>
          <p className="mt-1 text-xs text-gray-500">
            Al generar un recibo de pago, aparecerá aquí el historial de tus certificados.
          </p>
        </div>
      )}

      {mostrarConfirmacion && <ModalConfirmacion />}
    </PanelLayout>
  );
};

export default Certificados;
