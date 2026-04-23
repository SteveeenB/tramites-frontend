import React, { useState } from 'react';
import { formatCOP } from '../../constants/procesodeGrado';

const BANCOS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Banco de Occidente',
  'Banco Popular',
  'BBVA Colombia',
  'Colpatria',
  'Davivienda',
  'Itaú',
  'Nequi',
  'Scotiabank',
];

const ModalPagoPSE = ({ solicitud, onClose }) => {
  const [tipoPersona, setTipoPersona] = useState('');
  const [banco, setBanco] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  const puedeConfirmar = tipoPersona && banco && aceptaTerminos && !procesando;

  const handleConfirmar = () => {
    setProcesando(true);
    // Simula procesamiento
    setTimeout(() => {
      setProcesando(false);
      setExito(true);
    }, 2200);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !procesando) onClose(); }}
    >
      {/* Modal */}
      <div className="relative mx-4 w-full max-w-lg animate-[slideUp_0.3s_ease-out] rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="rounded-t-3xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Pago seguro — PSE</h2>
                <p className="text-xs text-blue-200">Serás redirigido al portal de tu banco</p>
              </div>
            </div>
            {!procesando && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/20 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {exito ? (
            /* Vista de éxito */
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 animate-[bounceIn_0.5s_ease-out] items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">¡Transacción en proceso!</h3>
              <p className="mb-1 text-sm text-slate-600">
                Tu pago está siendo procesado por <strong>{banco}</strong>.
              </p>
              <p className="mb-5 text-xs text-slate-400">
                Recibirás una notificación cuando se confirme el pago.
              </p>
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Valor pagado</p>
                <p className="text-2xl font-bold text-green-700">{formatCOP(solicitud.liquidacion?.valor)}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Volver al trámite
              </button>
            </div>
          ) : (
            <>
              {/* Resumen del cobro */}
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Concepto</p>
                    <p className="text-sm font-medium text-slate-800">{solicitud.liquidacion?.concepto}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</p>
                    <p className="text-xl font-bold text-slate-900">{formatCOP(solicitud.liquidacion?.valor)}</p>
                  </div>
                </div>
              </div>

              {/* Tipo de persona */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo de persona
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Natural', 'Jurídica'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoPersona(tipo)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                        tipoPersona === tipo
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      Persona {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de banco */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selecciona tu banco
                </label>
                <div className="relative">
                  <select
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 transition focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">— Selecciona una entidad —</option>
                    {BANCOS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Términos */}
              <label className="mb-5 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <span className="text-xs leading-5 text-slate-500">
                  Acepto los <strong className="text-blue-600">términos y condiciones</strong> del servicio de pagos PSE y autorizo la transacción.
                </span>
              </label>

              {/* Botón de pago */}
              <button
                type="button"
                disabled={!puedeConfirmar}
                onClick={handleConfirmar}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                  puedeConfirmar
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400'
                }`}
              >
                {procesando ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Pagar con PSE
                  </>
                )}
              </button>

              {/* Footer de seguridad */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Conexión segura · Datos cifrados · PSE · ACH Colombia
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes bounceIn {
          0%   { opacity: 0; transform: scale(0.3); }
          50%  { opacity: 1; transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ModalPagoPSE;
