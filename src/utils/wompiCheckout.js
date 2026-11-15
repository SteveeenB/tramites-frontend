// Debe coincidir con los parámetros que arma WompiService.java en el backend.
// Si el backend agrega o quita uno (p. ej. expiration-time), actualizar esta
// lista o el pago se rechaza con "datos de pago no válidos".
const WOMPI_CHECKOUT_ACTION = 'https://checkout.wompi.co/p/';
const CHECKOUT_PARAMETERS = [
  'public-key',
  'currency',
  'amount-in-cents',
  'reference',
  'signature:integrity',
  'redirect-url',
  'customer-data:email',
];

export const createWompiCheckoutForm = (value, appOrigin = window.location.origin) => {
  if (typeof value !== 'string') return null;

  try {
    const checkout = new URL(value);
    if (checkout.origin !== 'https://checkout.wompi.co'
      || checkout.pathname !== '/p/'
      || checkout.hash
      || checkout.username
      || checkout.password) return null;

    const names = [...checkout.searchParams.keys()];
    if (names.length !== CHECKOUT_PARAMETERS.length
      || CHECKOUT_PARAMETERS.some((name) => names.filter((candidate) => candidate === name).length !== 1)) return null;

    const values = Object.fromEntries(CHECKOUT_PARAMETERS.map((name) => [name, checkout.searchParams.get(name)]));
    if (CHECKOUT_PARAMETERS.some((name) => !values[name])
      || values.currency !== 'COP'
      || !/^\d+$/.test(values['amount-in-cents'])
      || Number(values['amount-in-cents']) <= 0) return null;

    const callback = new URL('/pago/resultado', appOrigin);
    callback.searchParams.set('reference', values.reference);

    const form = document.createElement('form');
    form.method = 'get';
    form.action = WOMPI_CHECKOUT_ACTION;
    form.hidden = true;

    for (const name of CHECKOUT_PARAMETERS) {
      const field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      field.value = name === 'redirect-url' ? callback.href : values[name];
      form.appendChild(field);
    }

    return form;
  } catch {
    return null;
  }
};

export const submitWompiCheckout = (value) => {
  const form = createWompiCheckoutForm(value);
  if (!form) return false;

  document.body.appendChild(form);
  form.submit();
  return true;
};
