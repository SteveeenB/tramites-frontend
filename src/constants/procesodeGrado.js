export const ESTADO_CONFIG = {
  PENDIENTE_PAGO: { label: 'Pendiente de pago', color: 'bg-amber-100 text-amber-700' },
  EN_REVISION:    { label: 'En revisión',        color: 'bg-blue-100 text-blue-700' },
  APROBADA:       { label: 'Aprobada',           color: 'bg-green-100 text-green-700' },
  RECHAZADA:      { label: 'Rechazada',          color: 'bg-red-100 text-red-700' },
};

export const formatFecha = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatCOP = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
