import React from 'react';
import Badge from '../ui/Badge';
import { TONOS } from '../../constants/tramitesColors';

const ESTADOS = {
  PENDIENTE_PAGO:    { label: 'Pago pendiente',        className: TONOS.advertencia },
  EN_REVISION:       { label: 'En revisión',           className: TONOS.info },
  PAGO_PENDIENTE:    { label: 'Pago pendiente',        className: TONOS.advertencia },
  APROBADA_DIRECTOR: { label: 'Aprobada por director', className: 'bg-orange-100 text-orange-800' },
  APROBADA:          { label: 'Aprobada',              className: TONOS.exito },
  RECHAZADA:            { label: 'Rechazada',              className: TONOS.error },
  // FIX TP-198 (Johan Bueno, 07/10/2026): el rechazo de Posgrados tiene su
  // propio estado terminal y debe diferenciarse del rechazo del Director.
  RECHAZADA_POSGRADOS:  { label: 'Rechazada por Posgrados', className: TONOS.error },
  APROBADA_POSGRADOS:   { label: 'Aprobada por Posgrados',  className: 'bg-emerald-100 text-emerald-800' },
};

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADOS[estado] ?? { label: estado, className: TONOS.neutro };
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
};

export default EstadoBadge;
