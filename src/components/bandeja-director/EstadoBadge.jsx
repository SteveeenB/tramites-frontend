import React from 'react';

const ESTADOS = {
  PENDIENTE_PAGO:  { label: 'Pago pendiente', className: 'bg-amber-100 text-amber-700' },
  EN_REVISION:     { label: 'En revisión',    className: 'bg-blue-100 text-blue-700'   },
  PAGO_PENDIENTE:  { label: 'Pago pendiente', className: 'bg-amber-100 text-amber-700' },
  APROBADA:        { label: 'Aprobada',       className: 'bg-green-100 text-green-700' },
  RECHAZADA:       { label: 'Rechazada',      className: 'bg-red-100 text-red-700'     },
};

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADOS[estado] ?? { label: estado, className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

export default EstadoBadge;
