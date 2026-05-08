import React, { useState, useEffect, useCallback } from 'react';
import { CheckIcon, DownloadIcon } from './icons';
import { formatFecha } from '../../constants/procesodeGrado';
import { solicitudesApi } from '../../api/solicitudesApi';
import { getEstadoPazYSalvos } from '../../api/pazYSalvoApi';

// Fechas disponibles de grado (demo)
const FECHAS_GRADO = [
  { id: 'f1', fecha: '2026-08-14', label: 'Viernes, 14 de agosto de 2026',    hora: '9:00 AM',  lugar: 'Auditorio Principal UFPS' },
  { id: 'f2', fecha: '2026-08-28', label: 'Viernes, 28 de agosto de 2026',    hora: '10:00 AM', lugar: 'Auditorio Principal UFPS' },
  { id: 'f3', fecha: '2026-09-11', label: 'Viernes, 11 de septiembre de 2026', hora: '9:00 AM',  lugar: 'Coliseo UFPS'            },
  { id: 'f4', fecha: '2026-09-25', label: 'Jueves, 25 de septiembre de 2026',  hora: '10:00 AM', lugar: 'Coliseo UFPS'            },
];

/* ─── Sección 1: Pago de grado ───────────────────────────────────────── */
const BANCOS = ['Bancolombia', 'Banco de Bogotá', 'Banco de Occidente', 'Davivienda', 'BBVA Colombia', 'Nequi'];

const ModalPagoGrado = ({ solicitud, onClose, onExito }) => {
  const [tipoPersona, setTipoPersona] = useState('');
  const [banco, setBanco] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  const puedeConfirmar = tipoPersona && banco && aceptaTerminos && !procesando;
  const valorFmt = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(solicitud?.costo ?? 250000);

  const handleConfirmar = () => {
    setProcesando(true);
    setTimeout(() => { setProcesando(false); setExito(true); }, 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !procesando) onClose(); }}
    >
      <div className="relative mx-4 w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-3xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Pago Derechos de Grado — PSE</h2>
                <p className="text-xs text-blue-200">Serás redirigido al portal de tu banco</p>
              </div>
            </div>
            {!procesando && (
              <button onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {exito ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">¡Pago confirmado!</h3>
              <p className="mb-1 text-sm text-slate-600">Pago procesado por <strong>{banco}</strong>.</p>
              <p className="mb-5 text-xs text-slate-400">Recibirás una notificación de confirmación.</p>
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Valor pagado</p>
                <p className="text-2xl font-bold text-green-700">{valorFmt}</p>
              </div>
              <button onClick={onExito}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Continuar al proceso
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Concepto</p>
                  <p className="text-sm font-medium text-slate-800">Derechos de Grado</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</p>
                  <p className="text-xl font-bold text-slate-900">{valorFmt}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo de persona
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Natural', 'Jurídica'].map((tipo) => (
                    <button key={tipo} type="button" onClick={() => setTipoPersona(tipo)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                        tipoPersona === tipo
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}>
                      Persona {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selecciona tu banco
                </label>
                <select value={banco} onChange={(e) => setBanco(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none">
                  <option value="">— Selecciona una entidad —</option>
                  {BANCOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <label className="mb-5 flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600" />
                <span className="text-xs leading-5 text-slate-500">
                  Acepto los <strong className="text-blue-600">términos y condiciones</strong> del servicio de pagos PSE.
                </span>
              </label>

              <button type="button" disabled={!puedeConfirmar} onClick={handleConfirmar}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                  puedeConfirmar
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400'
                }`}>
                {procesando ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando…
                  </>
                ) : 'Pagar con PSE'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SeccionPago = ({ solicitudGrado, onPagoConfirmado }) => {
  const [mostrarModal, setMostrarModal] = useState(false);

  const handlePagoExitoso = async () => {
    try {
      await solicitudesApi.pagarGrado(solicitudGrado.id);
    } catch {
      // Es demo — si falla el backend igual avanzamos localmente
    }
    onPagoConfirmado();
    setMostrarModal(false);
  };

  return (
    <>
      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Paso 1 — Pago de Derechos de Grado</h4>
            <p className="text-xs text-slate-500">Pendiente de pago</p>
          </div>
        </div>
        <p className="mb-4 text-sm text-slate-600 leading-6">
          Para continuar con el proceso de grado debes realizar el pago de los derechos de grado.
          Una vez confirmado el pago podrás avanzar con la verificación de paz y salvos.
        </p>
        <div className="mb-4 rounded-2xl bg-white p-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Derechos de Grado</span>
          <span className="text-lg font-bold text-slate-900">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
              .format(solicitudGrado?.costo ?? 250000)}
          </span>
        </div>
        <button type="button" onClick={() => setMostrarModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Pagar con PSE
        </button>
      </div>

      {mostrarModal && (
        <ModalPagoGrado
          solicitud={solicitudGrado}
          onClose={() => setMostrarModal(false)}
          onExito={handlePagoExitoso}
        />
      )}
    </>
  );
};

/* ─── Sección 2: Estado de paz y salvos ─────────────────────────────── */
const SeccionPazYSalvo = ({ solicitudId, onTodosAprobados }) => {
  const [estado, setEstado]       = useState(null);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);

  const cargar = useCallback(async () => {
    try {
      const data = await getEstadoPazYSalvos(solicitudId);
      setEstado(data);
      if (data.todosAprobados) onTodosAprobados();
    } catch (e) {
      setError('No se pudo consultar el estado de paz y salvos.');
    } finally {
      setCargando(false);
    }
  }, [solicitudId, onTodosAprobados]);

  useEffect(() => {
    cargar();
    // Refresca cada 30 segundos mientras haya pendientes
    const intervalo = setInterval(() => {
      if (!estado?.todosAprobados) cargar();
    }, 30000);
    return () => clearInterval(intervalo);
  }, [cargar, estado?.todosAprobados]);

  if (cargando) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-400">Consultando estado de paz y salvos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">{error}</p>
        <button onClick={cargar} className="mt-3 text-sm font-semibold text-red-600 hover:underline">
          Reintentar
        </button>
      </div>
    );
  }

  const { total, aprobados, rechazados, pendientes, detalle = [] } = estado ?? {};
  const hayRechazados = rechazados > 0;

  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${
      hayRechazados
        ? 'border-red-200 bg-red-50'
        : 'border-amber-200 bg-amber-50'
    }`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
          hayRechazados ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
        }`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Paso 2 — Verificación de Paz y Salvos</h4>
          <p className={`text-xs font-medium ${hayRechazados ? 'text-red-600' : 'text-amber-700'}`}>
            {hayRechazados
              ? `${rechazados} dependencia(s) reportaron deuda pendiente`
              : `${pendientes} pendiente(s) de ${total} — esperando confirmaciones`}
          </p>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-600 leading-6">
        {hayRechazados
          ? 'Una o más dependencias indicaron que tienes deudas pendientes. Comunícate con ellas para regularizar tu situación antes de continuar.'
          : 'Las dependencias y el director de programa están verificando que te encuentras a paz y salvo. Esta página se actualiza automáticamente cada 30 segundos.'}
      </p>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{aprobados} de {total} aprobados</span>
          <span>{Math.round((aprobados / (total || 1)) * 100)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${hayRechazados ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.round((aprobados / (total || 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Detalle por dependencia */}
      {detalle.length > 0 && (
        <div className="flex flex-col gap-2">
          {detalle.map((ps) => {
            const esAprobado  = ps.estado === 'APROBADO';
            const esRechazado = ps.estado === 'RECHAZADO';
            return (
              <div key={ps.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${
                  esAprobado  ? 'border-green-200 bg-green-50' :
                  esRechazado ? 'border-red-200 bg-red-50'   :
                                'border-slate-200 bg-white'
                }`}>
                <span className="text-sm font-medium text-slate-700">
                  {ps.tipoDependencia === 'DIRECTOR_PROGRAMA' ? 'Director de Programa' : ps.tipoDependencia}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  esAprobado  ? 'bg-green-100 text-green-700' :
                  esRechazado ? 'bg-red-100 text-red-700'     :
                                'bg-amber-100 text-amber-700'
                }`}>
                  {esAprobado ? 'A paz y salvo' : esRechazado ? 'Deuda pendiente' : 'Pendiente'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!hayRechazados && (
        <button onClick={cargar}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar ahora
        </button>
      )}
    </div>
  );
};

/* ─── Sección 3: Elegir fecha de grado ──────────────────────────────── */
const SeccionFechaGrado = ({ solicitudGrado, onFechaConfirmada }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmarFecha = async () => {
    setGuardando(true);
    setError(null);
    try {
      await solicitudesApi.elegirFechaGrado(solicitudGrado.id, fechaSeleccionada.fecha);
      onFechaConfirmada(fechaSeleccionada);
    } catch (err) {
      setError(err.message || 'No se pudo guardar la fecha. Intenta nuevamente.');
      setGuardando(false);
    }
    setMostrarConfirmacion(false);
  };

  return (
    <>
      <div className="rounded-3xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Paso 3 — Elegir Fecha de Grado</h4>
            <p className="text-xs text-slate-500">Selecciona una de las fechas disponibles</p>
          </div>
        </div>
        <p className="mb-4 text-sm text-slate-600 leading-6">
          Todos los paz y salvos están verificados. Elige la fecha en que deseas participar
          en la ceremonia de grado. Una vez confirmada no podrá ser modificada.
        </p>

        <div className="flex flex-col gap-3 mb-4">
          {FECHAS_GRADO.map((f) => (
            <button key={f.id} type="button" onClick={() => setFechaSeleccionada(f)}
              className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                fechaSeleccionada?.id === f.id
                  ? 'border-purple-600 bg-purple-100'
                  : 'border-slate-200 bg-white hover:border-purple-300'
              }`}>
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                fechaSeleccionada?.id === f.id ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
              }`}>
                {fechaSeleccionada?.id === f.id && (
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{f.label}</p>
                <p className="text-xs text-slate-500">{f.hora} · {f.lugar}</p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
        )}

        <button type="button" disabled={!fechaSeleccionada || guardando}
          onClick={() => setMostrarConfirmacion(true)}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            fechaSeleccionada && !guardando
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'cursor-not-allowed bg-slate-200 text-slate-400'
          }`}>
          Confirmar fecha seleccionada
        </button>
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && fechaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">¿Confirmar fecha de graduación?</h3>
            <p className="mb-4 text-sm text-slate-600 leading-6">
              ¿Estás seguro que deseas elegir la siguiente fecha para tu ceremonia de grado?
              <br /><br />
              <strong className="text-slate-900">{fechaSeleccionada.label}</strong><br />
              <span className="text-slate-500">{fechaSeleccionada.hora} · {fechaSeleccionada.lugar}</span>
            </p>
            <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              ⚠️ Esta selección es definitiva y no podrá ser modificada una vez confirmada.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMostrarConfirmacion(false)} disabled={guardando}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={handleConfirmarFecha} disabled={guardando}
                className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {guardando ? 'Guardando…' : 'Sí, confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── Sección 4: Generar Acta ───────────────────────────────────────── */
const SeccionGenerarActa = ({ solicitudGrado, fechaGradoInfo }) => {
  const [generando, setGenerando] = useState(false);
  const [errorActa, setErrorActa] = useState(null);
  const [actaDescargada, setActaDescargada] = useState(false);

  const handleGenerarActa = async () => {
    setGenerando(true);
    setErrorActa(null);
    try {
      const { blob, contentDisposition } = await solicitudesApi.descargarActa(solicitudGrado.id);
      const filename =
        contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] ||
        `acta_grado_${solicitudGrado.id}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setActaDescargada(true);
    } catch (err) {
      setErrorActa(err.message || 'No se pudo generar el acta. Intenta nuevamente.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckIcon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Paso 4 — Acta de Grado</h4>
          <p className="text-xs text-green-700 font-medium">¡Todo listo para tu graduación!</p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-white p-4 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha de grado</p>
          <p className="text-sm font-semibold text-slate-900">
            {fechaGradoInfo?.label || solicitudGrado?.fechaGrado}
          </p>
          {fechaGradoInfo?.hora && (
            <p className="text-xs text-slate-500">{fechaGradoInfo.hora} · {fechaGradoInfo.lugar}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</p>
          <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700 mt-0.5">
            Aprobada
          </span>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-600 leading-6">
        Tu acta de grado está lista. Descárgala para uso oficial y presentación ante las autoridades universitarias.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleGenerarActa} disabled={generando}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
          <DownloadIcon className="h-4 w-4" />
          {generando ? 'Generando…' : 'Descargar Acta de Grado'}
        </button>
        {actaDescargada && (
          <span className="text-sm font-medium text-green-700">✓ Acta descargada correctamente</span>
        )}
      </div>

      {errorActa && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorActa}</p>
      )}
    </div>
  );
};

/* ─── Componente principal ───────────────────────────────────────────── */
const ConfirmacionGrado = ({ solicitudGrado }) => {
  //console.log('estadoPagoGrado:', solicitudGrado?.estadoPagoGrado);
  //console.log('objeto completo:', JSON.stringify(solicitudGrado));
  const [pagoRealizado, setPagoRealizado] = useState(
  solicitudGrado?.estadoPagoGrado === 'APROBADO'
);

useEffect(() => {
  if (solicitudGrado?.estadoPagoGrado === 'APROBADO') {
    setPagoRealizado(true);
  }
}, [solicitudGrado]);
  const [pazYSalvosOk, setPazYSalvosOk] = useState(false);
  const [fechaGradoInfo, setFechaGradoInfo] = useState(() => {
    if (!solicitudGrado?.fechaGrado) return null;
    return (
      FECHAS_GRADO.find((f) => f.fecha === solicitudGrado.fechaGrado) || {
        id: 'custom',
        fecha: solicitudGrado.fechaGrado,
        label: solicitudGrado.fechaGrado,
        hora: '',
        lugar: '',
      }
    );
  });

  const fechaYaElegida = !!fechaGradoInfo || !!solicitudGrado?.fechaGrado;

  // Callback estable para evitar re-renders infinitos en SeccionPazYSalvo
  const handleTodosAprobados = useCallback(() => setPazYSalvosOk(true), []);

  return (
    <div className="space-y-4">
      {/* Banner de aprobación */}
      <div className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">¡Solicitud de Grado Aprobada!</h3>
            <p className="text-sm text-slate-600">
              Aprobada el {formatFecha(solicitudGrado?.fechaDecision)}. Completa los siguientes pasos.
            </p>
          </div>
        </div>
      </div>

      {/* ── Paso 1: Pago ─────────────────────────────────────────────── */}
      {!pagoRealizado && (
        <SeccionPago
          solicitudGrado={solicitudGrado}
          onPagoConfirmado={() => setPagoRealizado(true)}
        />
      )}

      {pagoRealizado && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckIcon className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">
            Paso 1 completado — Pago de Derechos de Grado confirmado
          </p>
        </div>
      )}

      {/* ── Paso 2: Paz y salvos (solo si pagó y fecha no elegida aún) ─ */}
      {pagoRealizado && !fechaYaElegida && !pazYSalvosOk && (
        <SeccionPazYSalvo
          solicitudId={solicitudGrado.id}
          onTodosAprobados={handleTodosAprobados}
        />
      )}

      {pagoRealizado && (pazYSalvosOk || fechaYaElegida) && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckIcon className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">
            Paso 2 completado — Verificación de paz y salvos aprobada
          </p>
        </div>
      )}

      {/* ── Paso 3: Elegir fecha (solo si paz y salvos ok y no hay fecha) */}
      {pagoRealizado && pazYSalvosOk && !fechaYaElegida && (
        <SeccionFechaGrado
          solicitudGrado={solicitudGrado}
          onFechaConfirmada={(f) => setFechaGradoInfo(f)}
        />
      )}

      {pagoRealizado && fechaYaElegida && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckIcon className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">
            Paso 3 completado — Fecha de grado:{' '}
            {fechaGradoInfo?.label || solicitudGrado?.fechaGrado}
          </p>
        </div>
      )}

      {/* ── Proceso finalizado ───────────────────────────────────────── */}
{pagoRealizado && fechaYaElegida && (
  <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-1">
          ¡Tu proceso de grado ha sido completado!
        </h4>
        <p className="text-sm text-slate-600 leading-6 mb-4">
          Has cumplido satisfactoriamente con todos los requisitos del proceso de grado.
          La oficina de posgrados se pondrá en contacto contigo con los detalles finales
          de la ceremonia.
        </p>
        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white border border-green-200 px-5 py-3 shadow-sm">
          <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha prevista de graduación
            </p>
            <p className="text-sm font-bold text-slate-900">
              {fechaGradoInfo?.label || solicitudGrado?.fechaGrado}
            </p>
            {fechaGradoInfo?.hora && (
              <p className="text-xs text-slate-500">
                {fechaGradoInfo.hora} · {fechaGradoInfo.lugar}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ConfirmacionGrado;
