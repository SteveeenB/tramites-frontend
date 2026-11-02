export const ESTADO_CONFIG = {
  PENDIENTE_PAGO:    { label: 'Pendiente de pago',        color: 'bg-amber-100 text-amber-700'  },
  EN_REVISION:       { label: 'En revisión',              color: 'bg-blue-100 text-blue-700'    },
  APROBADA_DIRECTOR: { label: 'Aprobada por director',    color: 'bg-orange-100 text-orange-700'},
  APROBADA:          { label: 'Aprobada',                 color: 'bg-green-100 text-green-700'  },
  RECHAZADA:         { label: 'Rechazada',                color: 'bg-red-100 text-red-700'      },
};

/**
 * Convierte el valor de una fecha del backend en Date. Un LocalDate llega como
 * "2026-11-02" y `new Date()` lo interpreta como medianoche UTC, que en Colombia
 * (UTC-5) cae el día anterior; por eso esas fechas se construyen en hora local.
 */
export const parseFecha = (value) => {
  const m = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
};

export const formatFecha = (value) => {
  if (!value) return 'Sin fecha';
  const date = parseFecha(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatCOP = (valor) => {
  if (valor == null || isNaN(Number(valor))) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
};

/**
 * "2026-11-13" -> "Viernes, 13 de noviembre de 2026". Se interpreta en UTC para
 * que la zona horaria del navegador no corra la fecha un día.
 */
export const formatearFechaGrado = (iso) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const txt = d.toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};
