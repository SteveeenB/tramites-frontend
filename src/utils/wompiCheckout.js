const WOMPI_CHECKOUT_ORIGIN = 'https://checkout.wompi.co';

export const getWompiCheckoutUrl = (value) => {
  if (typeof value !== 'string') return null;

  try {
    const candidate = new URL(value);
    if (candidate.origin !== WOMPI_CHECKOUT_ORIGIN || candidate.username || candidate.password) return null;

    return `${WOMPI_CHECKOUT_ORIGIN}${candidate.pathname}${candidate.search}`;
  } catch {
    return null;
  }
};
