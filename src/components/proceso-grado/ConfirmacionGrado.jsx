import React, { useState, useEffect, useCallback } from 'react';
import { CheckIcon } from './icons';
import { formatFecha } from '../../constants/procesodeGrado';
import { solicitudesApi } from '../../api/solicitudesApi';
import { getEstadoPazYSalvos } from '../../api/pazYSalvoApi';
import ModalPagoPSE from './ModalPagoPSE';

/* ─── Constantes ─────────────────────────────────────────────────────── */
const FECHAS_GRADO = [
  { id: 'f1', fecha: '2026-08-14', label: 'Viernes, 14 de agosto de 2026', hora: '9:00 AM', lugar: 'Auditorio Principal UFPS', modalidad: 'CEREMONIA' },
  { id: 's1', fecha: '2026-08-05', label: 'Miércoles, 5 de agosto de 2026', hora: '8:00 AM', lugar: 'Secretaría de Posgrados', modalidad: 'SECRETARIA' },
  { id: 'f2', fecha: '2026-08-28', label: 'Viernes, 28 de agosto de 2026', hora: '10:00 AM', lugar: 'Auditorio Principal UFPS', modalidad: 'CEREMONIA' },
  { id: 's2', fecha: '2026-09-02', label: 'Miércoles, 2 de septiembre de 2026', hora: '8:00 AM', lugar: 'Secretaría de Posgrados', modalidad: 'SECRETARIA' },
  { id: 'f3', fecha: '2026-09-11', label: 'Viernes, 11 de septiembre de 2026', hora: '9:00 AM', lugar: 'Coliseo UFPS', modalidad: 'CEREMONIA' },
  { id: 's3', fecha: '2026-09-16', label: 'Miércoles, 16 de septiembre de 2026', hora: '8:00 AM', lugar: 'Secretaría de Posgrados', modalidad: 'SECRETARIA' },
  { id: 'f4', fecha: '2026-09-25', label: 'Jueves, 25 de septiembre de 2026', hora: '10:00 AM', lugar: 'Coliseo UFPS', modalidad: 'CEREMONIA' },
];

const COSTO_CEREMONIA_EXTRA = 40000;
const BANCOS = ['Bancolombia', 'Banco de Bogotá', 'Banco de Occidente', 'Davivienda', 'BBVA Colombia', 'Nequi'];

/* ─── Sección 1: Pago de grado ───────────────────────────────────────── */
const ModalPagoGrado = ({ solicitud, onClose, onExito }) => {
  const [tipoPersona, setTipoPersona] = useState('');
  const [banco, setBanco] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const puedeConfirmar = tipoPersona && banco && aceptaTerminos && !procesando;
  const valorFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(solicitud?.costo ?? 250000);

  const handleConfirmar = async () => {
    setProcesando(true);
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/pagos/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          solicitudId: solicitud.id,
          tipoPago: 'GRADO',
          cedula: solicitud.cedula,
        }),
      });
      const data = await resp.json();
      console.log('Respuesta pagos/crear:', data);
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setProcesando(false);
      alert('Error al conectar con el servicio de pagos');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !procesando) onClose(); }}>
      <div className="relative mx-4 w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="rounded-t-3xl bg-gradient-to-r from-red-600 to-red-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Pago Derechos de Grado — PSE</h2>
                <p className="text-xs text-red-200">Serás redirigido al portal de tu banco</p>
              </div>
            </div>
            {!procesando && <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20">✕</button>}
          </div>
        </div>
        <div className="px-6 py-5">
          {(
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de persona</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Natural', 'Jurídica'].map((tipo) => (
                    <button key={tipo} type="button" onClick={() => setTipoPersona(tipo)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${tipoPersona === tipo ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                      Persona {tipo}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Selecciona tu banco</label>
                <select value={banco} onChange={(e) => setBanco(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-red-500 focus:outline-none">
                  <option value="">— Selecciona una entidad —</option>
                  {BANCOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <label className="mb-5 flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-red-600" />
                <span className="text-xs leading-5 text-slate-500">Acepto los <strong className="text-red-600">términos y condiciones</strong> del servicio de pagos PSE.</span>
              </label>
              <button type="button" disabled={!puedeConfirmar} onClick={handleConfirmar}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition ${puedeConfirmar ? 'bg-red-600 text-white hover:bg-red-700' : 'cursor-not-allowed bg-slate-200 text-slate-400'}`}>
                {procesando ? (<><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Procesando…</>) : 'Pagar con PSE'}
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

  return (
    <>
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Paso 1 — Pago de Derechos de Grado</h4>
            <p className="text-xs text-slate-500">Pendiente de pago</p>
          </div>
        </div>
        <p className="mb-4 text-sm text-slate-600 leading-6">
          Para continuar con el proceso de grado debes realizar el pago de los derechos de grado. Una vez confirmado el pago podrás avanzar con la verificación de paz y salvos.
        </p>
        <div className="mb-4 rounded-2xl bg-white p-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Derechos de Grado</span>
          <span className="text-lg font-bold text-slate-900">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(solicitudGrado?.costo ?? 250000)}
          </span>
        </div>
        <button type="button" onClick={() => setMostrarModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:bg-red-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Pagar con PSE
        </button>
      </div>
      {mostrarModal && (
        <ModalPagoPSE
          solicitud={solicitudGrado}
          tipoPago="GRADO"
          cedula={solicitudGrado?.cedula}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </>
  );
};

/* ─── Sección 2: Estado de paz y salvos ─────────────────────────────── */
const SeccionPazYSalvo = ({ solicitudId, onTodosAprobados }) => {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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
    const intervalo = setInterval(() => { if (!estado?.todosAprobados) cargar(); }, 30000);
    return () => clearInterval(intervalo);
  }, [cargar, estado?.todosAprobados]);

  if (cargando) return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-400">Consultando estado de paz y salvos…</p></div>;
  if (error) return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <p className="text-sm text-red-700">{error}</p>
      <button onClick={cargar} className="mt-3 text-sm font-semibold text-red-600 hover:underline">Reintentar</button>
    </div>
  );

  const { total, aprobados, rechazados, pendientes, detalle = [] } = estado ?? {};
  const hayRechazados = rechazados > 0;

  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${hayRechazados ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${hayRechazados ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Paso 2 — Verificación de Paz y Salvos</h4>
          <p className={`text-xs font-medium ${hayRechazados ? 'text-red-600' : 'text-amber-700'}`}>
            {hayRechazados ? `${rechazados} dependencia(s) reportaron deuda pendiente` : `${pendientes} pendiente(s) de ${total} — esperando confirmaciones`}
          </p>
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-600 leading-6">
        {hayRechazados ? 'Una o más dependencias indicaron que tienes deudas pendientes. Comunícate con ellas para regularizar tu situación antes de continuar.' : 'Las dependencias y el director de programa están verificando que te encuentras a paz y salvo. Esta página se actualiza automáticamente cada 30 segundos.'}
      </p>
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{aprobados} de {total} aprobados</span>
          <span>{Math.round((aprobados / (total || 1)) * 100)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full transition-all duration-500 ${hayRechazados ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.round((aprobados / (total || 1)) * 100)}%` }} />
        </div>
      </div>
      {detalle.length > 0 && (
        <div className="flex flex-col gap-2">
          {detalle.map((ps) => {
            const esAprobado = ps.estado === 'APROBADO';
            const esRechazado = ps.estado === 'RECHAZADO';
            return (
              <div key={ps.id} className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${esAprobado ? 'border-green-200 bg-green-50' : esRechazado ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                <span className="text-sm font-medium text-slate-700">{ps.tipoDependencia === 'DIRECTOR_PROGRAMA' ? 'Director de Programa' : ps.tipoDependencia}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${esAprobado ? 'bg-green-100 text-green-700' : esRechazado ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {esAprobado ? 'A paz y salvo' : esRechazado ? 'Deuda pendiente' : 'Pendiente'}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {!hayRechazados && (
        <button onClick={cargar} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar ahora
        </button>
      )}
    </div>
  );
};

/* ─── Modal pago adicional ceremonia ─────────────────────────────────── */
const ModalPagoCeremonia = ({ fecha, solicitudId, cedula, onClose, onExito }) => {
  const [tipoPersona, setTipoPersona] = useState('');
  const [banco, setBanco] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const valorFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(COSTO_CEREMONIA_EXTRA);
  const puedeConfirmar = tipoPersona && banco && acepta && !procesando;
  const handlePagar = async () => {
    setProcesando(true);
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/pagos/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          solicitudId: solicitudId,
          tipoPago: 'MODALIDAD_CEREMONIA',
          cedula: cedula,
        }),
      });
      const data = await resp.json();
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setProcesando(false);
      alert('Error al conectar con el servicio de pagos');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !procesando) onClose(); }}>
      <div className="mx-4 w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="rounded-t-3xl bg-gradient-to-r from-red-600 to-red-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">🎓</div>
              <div>
                <h2 className="text-lg font-bold">Pago — Derechos de Ceremonia</h2>
                <p className="text-xs text-red-200">{fecha?.label}</p>
              </div>
            </div>
            {!procesando && <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20">✕</button>}
          </div>
        </div>
        <div className="px-6 py-5">
          {(
            <>
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-400 mb-1">Fecha seleccionada</p>
                <p className="text-sm font-bold text-slate-900">{fecha?.label}</p>
                <p className="text-xs text-slate-500">{fecha?.hora} · {fecha?.lugar}</p>
              </div>
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Concepto</p>
                  <p className="text-sm font-medium text-slate-800">Derechos de Ceremonia de Grado</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</p>
                  <p className="text-xl font-bold text-slate-900">{valorFmt}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de persona</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Natural', 'Jurídica'].map((t) => (
                    <button key={t} type="button" onClick={() => setTipoPersona(t)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${tipoPersona === t ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                      Persona {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Selecciona tu banco</label>
                <select value={banco} onChange={(e) => setBanco(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-red-500 focus:outline-none">
                  <option value="">— Selecciona una entidad —</option>
                  {BANCOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <label className="mb-5 flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-red-600" />
                <span className="text-xs leading-5 text-slate-500">Acepto los <strong className="text-red-600">términos y condiciones</strong> del servicio PSE.</span>
              </label>
              <button type="button" disabled={!puedeConfirmar} onClick={handlePagar}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition ${puedeConfirmar ? 'bg-red-600 text-white hover:bg-red-700' : 'cursor-not-allowed bg-slate-200 text-slate-400'}`}>
                {procesando ? (<><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Procesando…</>) : 'Pagar con PSE'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Sección 3: Fecha + Modalidad de grado ─────────────────────────── */
const SeccionFechaGrado = ({ solicitudGrado, onFechaConfirmada }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [mostrarPagoCeremonia, setMostrarPagoCeremonia] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const esCeremonia = fechaSeleccionada?.modalidad === 'CEREMONIA';
  const valorCeremonia = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(COSTO_CEREMONIA_EXTRA);

  const handleClickConfirmar = () => { if (esCeremonia) setMostrarPagoCeremonia(true); else setMostrarConfirmacion(true); };

  const handlePagoCeremoniaExitoso = async () => {
    setMostrarPagoCeremonia(false);
    try { await solicitudesApi.pagarModalidad(solicitudGrado.id); } catch { /* demo */ }
    await guardarFechaYModalidad();
  };

  const handleConfirmarSecretaria = async () => { setMostrarConfirmacion(false); await guardarFechaYModalidad(); };

  const guardarFechaYModalidad = async () => {
    setGuardando(true);
    setError(null);
    try {
      await solicitudesApi.registrarModalidadGrado(solicitudGrado.id, fechaSeleccionada.modalidad);
      await solicitudesApi.elegirFechaGrado(solicitudGrado.id, fechaSeleccionada.fecha);
      onFechaConfirmada(fechaSeleccionada);
    } catch (err) {
      setError(err.message || 'No se pudo guardar. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Paso 3 — Elegir Fecha de Grado</h4>
            <p className="text-xs text-slate-500">Selecciona la fecha y modalidad de tu preferencia</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-600 leading-6">
          Todos los paz y salvos están verificados. Las fechas con <strong>🎓 Ceremonia</strong> tienen un costo adicional de <strong>{valorCeremonia}</strong>.
          Las fechas con <strong>📄 Secretaría</strong> no tienen costo extra.
        </p>

        <div className="flex flex-col gap-3 mb-4">
          {FECHAS_GRADO.map((f) => {
            const esCer = f.modalidad === 'CEREMONIA';
            const sel = fechaSeleccionada?.id === f.id;
            return (
              <button key={f.id} type="button" onClick={() => setFechaSeleccionada(f)}
                className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${sel ? (esCer ? 'border-red-600 bg-red-100' : 'border-slate-500 bg-slate-100') : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? (esCer ? 'border-red-600 bg-red-600' : 'border-slate-600 bg-slate-600') : 'border-slate-300'}`}>
                  {sel && <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{f.label}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${esCer ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {esCer ? '🎓' : '📄'} {esCer ? 'Ceremonia' : 'Secretaría'}
                  </span>
                  <span className={`text-xs font-semibold ${esCer ? 'text-red-600' : 'text-green-600'}`}>
                    {esCer ? `+ ${valorCeremonia}` : 'Sin costo extra'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <button type="button" disabled={!fechaSeleccionada || guardando} onClick={handleClickConfirmar}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${fechaSeleccionada && !guardando ? (esCeremonia ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-800 text-white hover:bg-slate-900') : 'cursor-not-allowed bg-slate-200 text-slate-400'}`}>
          {guardando ? 'Guardando…' : !fechaSeleccionada ? 'Selecciona una fecha' : esCeremonia ? '🎓 Continuar al pago de ceremonia' : '📄 Confirmar fecha por secretaría'}
        </button>
      </div>

      {mostrarPagoCeremonia && (
        <ModalPagoCeremonia
          fecha={fechaSeleccionada}
          solicitudId={solicitudGrado.id}
          cedula={solicitudGrado.cedula}
          onClose={() => setMostrarPagoCeremonia(false)}
          onExito={handlePagoCeremoniaExitoso}
        />
      )}

      {mostrarConfirmacion && fechaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">📄</div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">¿Confirmar grado por secretaría?</h3>
            <p className="mb-4 text-sm text-slate-600 leading-6">
              ¿Estás seguro que deseas realizar tu grado por secretaría en la siguiente fecha?
              <br /><br />
              <strong className="text-slate-900">{fechaSeleccionada.label}</strong><br />
              <span className="text-slate-500">{fechaSeleccionada.hora} · {fechaSeleccionada.lugar}</span>
            </p>
            <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              ⚠️ Esta selección es definitiva y no podrá ser modificada una vez confirmada.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMostrarConfirmacion(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={handleConfirmarSecretaria} className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">Sí, confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── Componente principal ───────────────────────────────────────────── */
const ConfirmacionGrado = ({ solicitudGrado }) => {
  const [pagoRealizado, setPagoRealizado] = useState(solicitudGrado?.estadoPagoGrado === 'APROBADO');

  useEffect(() => {
    if (solicitudGrado?.estadoPagoGrado === 'APROBADO') setPagoRealizado(true);
  }, [solicitudGrado]);

  const [pazYSalvosOk, setPazYSalvosOk] = useState(false);
  const [fechaGradoInfo, setFechaGradoInfo] = useState(() => {
    if (!solicitudGrado?.fechaGrado) return null;
    return FECHAS_GRADO.find((f) => f.fecha === solicitudGrado.fechaGrado) || {
      id: 'custom', fecha: solicitudGrado.fechaGrado, label: solicitudGrado.fechaGrado, hora: '', lugar: '',
    };
  });

  const fechaYaElegida = !!fechaGradoInfo || !!solicitudGrado?.fechaGrado;
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
            <p className="text-sm text-slate-600">Aprobada el {formatFecha(solicitudGrado?.fechaDecision)}. Completa los siguientes pasos.</p>
          </div>
        </div>
      </div>

      {/* Paso 1: Pago */}
      {!pagoRealizado && <SeccionPago solicitudGrado={solicitudGrado} onPagoConfirmado={() => setPagoRealizado(true)} />}
      {pagoRealizado && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckIcon className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">Paso 1 completado — Pago de Derechos de Grado confirmado</p>
        </div>
      )}

      {/* Paso 2: Paz y salvos */}
      {pagoRealizado && !fechaYaElegida && !pazYSalvosOk && <SeccionPazYSalvo solicitudId={solicitudGrado.id} onTodosAprobados={handleTodosAprobados} />}
      {pagoRealizado && (pazYSalvosOk || fechaYaElegida) && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckIcon className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">Paso 2 completado — Verificación de paz y salvos aprobada</p>
        </div>
      )}

      {/* Paso 3: Elegir fecha */}
      {pagoRealizado && pazYSalvosOk && !fechaYaElegida && <SeccionFechaGrado solicitudGrado={solicitudGrado} onFechaConfirmada={(f) => setFechaGradoInfo(f)} />}
      {pagoRealizado && fechaYaElegida && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckIcon className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">
            Paso 3 completado — {fechaGradoInfo?.label || solicitudGrado?.fechaGrado}
          </p>
        </div>
      )}

      {/* Proceso finalizado */}
      {pagoRealizado && fechaYaElegida && (
        <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">¡Tu proceso de grado ha sido completado!</h4>
              <p className="text-sm text-slate-600 leading-6 mb-4">
                Has cumplido satisfactoriamente con todos los requisitos del proceso de grado. La oficina de posgrados se pondrá en contacto contigo con los detalles finales.
              </p>
              <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white border border-green-200 px-5 py-3 shadow-sm">
                <span className="text-2xl">{fechaGradoInfo?.modalidad === 'CEREMONIA' ? '🎓' : '📄'}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Fecha esperada de graduación
                  </p>
                  <p className="text-sm font-bold text-slate-900">{fechaGradoInfo?.label || solicitudGrado?.fechaGrado}</p>
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