import React, { useState } from 'react';
import { formatCOP } from '../../constants/procesodeGrado';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Modal de pago con Wompi PSE.
 * Props:
 *   - solicitud: objeto de la solicitud (debe tener .id y .costo)
 *   - tipoPago: 'TERMINACION' | 'GRADO' | 'MODALIDAD_CEREMONIA'
 *   - cedula: cédula del estudiante
 *   - onClose: función para cerrar el modal
 */
const ModalPagoPSE = ({ solicitud, tipoPago = 'TERMINACION', cedula, onClose }) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const monto = solicitud?.costo ?? (tipoPago === 'MODALIDAD_CEREMONIA' ? 40000 : 150000);

  const handlePagar = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${apiBase}/pagos/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          solicitudId: solicitud.id,
          tipoPago,
          cedula,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'No se pudo iniciar el pago');
      }

      const data = await resp.json();
      // Redirigir a Wompi checkout
      window.location.href = data.checkoutUrl;

    } catch (e) {
      setError(e.message || 'Error al conectar con el servicio de pagos.');
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !cargando) onClose(); }}
    >
      <div className="relative mx-4 w-full max-w-md rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="rounded-t-3xl bg-gradient-to-r from-red-600 to-red-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Pago con Wompi PSE</h2>
                <p className="text-xs text-red-200">Serás redirigido a la plataforma de pago</p>
              </div>
            </div>
            {!cargando && (
              <button onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">

          {/* Detalle del pago */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Concepto</p>
              <p className="text-sm font-medium text-slate-800">
                {tipoPago === 'TERMINACION' ? 'Terminación de Materias'
                  : tipoPago === 'GRADO' ? 'Derechos de Grado'
                    : 'Derechos de Ceremonia'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-900">{formatCOP(monto)}</p>
            </div>
          </div>

          {/* Info Wompi */}
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-700 leading-5">
              Al hacer clic en <strong>Pagar ahora</strong> serás redirigido a la plataforma segura de
              Wompi para completar el pago. Puedes usar tarjeta de crédito/débito, PSE o Nequi.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePagar}
              disabled={cargando}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {cargando ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirigiendo…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pagar ahora
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            Pago seguro procesado por <strong>Wompi</strong> · SSL encriptado
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalPagoPSE;