import React, { useState } from 'react';
import { ReceiptIcon } from './icons';
import { ESTADO_CONFIG, formatFecha, formatCOP } from '../../constants/procesodeGrado';
import ModalPagoPSE from './ModalPagoPSE';

const TarjetaLiquidacion = ({ solicitud }) => {
  const [mostrarModal, setMostrarModal] = useState(false);

  const cfg = ESTADO_CONFIG[solicitud.estado] || {
    label: solicitud.estado,
    color: 'bg-slate-100 text-slate-700',
  };

  const labelEstado =
    solicitud.estado === 'PENDIENTE_PAGO' && solicitud.tipo === 'GRADO'
      ? 'Pendiente de pago de derechos de grado'
      : cfg.label;

  return (
    <>
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <ReceiptIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Solicitud registrada</h3>
            <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cfg.color}`}>
              {labelEstado}
            </span>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Concepto</p>
            <p className="text-sm font-medium text-slate-800">{solicitud.liquidacion?.concepto}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Valor a pagar</p>
            <p className="text-lg font-bold text-green-700">{formatCOP(solicitud.liquidacion?.valor)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha de solicitud</p>
            <p className="text-sm font-medium text-slate-800">{formatFecha(solicitud.fechaSolicitud)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha límite de pago</p>
            <p className="text-sm font-medium text-slate-800">{formatFecha(solicitud.liquidacion?.fechaLimite)}</p>
          </div>
        </div>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {solicitud.liquidacion?.instrucciones}
        </p>

        {solicitud.estado === 'PENDIENTE_PAGO' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMostrarModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 hover:shadow-lg"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Continuar al pago
            </button>
          </div>
        )}
      </div>

      {mostrarModal && (
        <ModalPagoPSE
          solicitud={solicitud}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </>
  );
};

export default TarjetaLiquidacion;
