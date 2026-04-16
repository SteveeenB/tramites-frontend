import React from 'react';
import { ReceiptIcon } from './icons';
import { ESTADO_CONFIG, formatFecha, formatCOP } from '../../constants/procesodeGrado';

const TarjetaLiquidacion = ({ solicitud }) => {
  const cfg = ESTADO_CONFIG[solicitud.estado] || {
    label: solicitud.estado,
    color: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
          <ReceiptIcon />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Solicitud registrada</h3>
          <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cfg.color}`}>
            {cfg.label}
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
    </div>
  );
};

export default TarjetaLiquidacion;
