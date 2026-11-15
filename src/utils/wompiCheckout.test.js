import { createWompiCheckoutForm, submitWompiCheckout } from './wompiCheckout';

const validCheckoutUrl = 'https://checkout.wompi.co/p/?public-key=pub_test&currency=COP&amount-in-cents=30000000&reference=UFPS-GRAD-1&signature%3Aintegrity=abc123&redirect-url=https%3A%2F%2Fapp.example%2Fmalicious&customer-data%3Aemail=test%40example.com';

describe('createWompiCheckoutForm', () => {
  test('uses the fixed Wompi action and rebuilds the callback on the app origin', () => {
    const form = createWompiCheckoutForm(validCheckoutUrl, 'https://app.example');

    expect(form.action).toBe('https://checkout.wompi.co/p/');
    expect(form.method).toBe('get');
    expect(form.elements.namedItem('reference').value).toBe('UFPS-GRAD-1');
    expect(form.elements.namedItem('redirect-url').value)
      .toBe('https://app.example/pago/resultado?reference=UFPS-GRAD-1');
  });

  test.each([
    'http://checkout.wompi.co/p/?public-key=pub_test',
    validCheckoutUrl.replace('https://checkout.wompi.co/p/', 'https://checkout.wompi.co.attacker.example/p/'),
    validCheckoutUrl.replace('/p/', '/redirect/'),
    validCheckoutUrl.replace('public-key=pub_test', 'public-key=pub_test&unexpected=attacker'),
    validCheckoutUrl.replace('amount-in-cents=30000000', 'amount-in-cents=-1'),
    validCheckoutUrl.replace('currency=COP', 'currency=USD'),
    '',
    null,
  ])('rejects an invalid checkout response: %s', (value) => {
    expect(createWompiCheckoutForm(value, 'https://app.example')).toBeNull();
  });
});

describe('submitWompiCheckout', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  test('submits a form only to the fixed Wompi action', () => {
    jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    expect(submitWompiCheckout(validCheckoutUrl)).toBe(true);
    expect(document.querySelector('form').action).toBe('https://checkout.wompi.co/p/');
    expect(HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);
  });

  test('does not submit an invalid checkout response', () => {
    const submit = jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    expect(submitWompiCheckout('https://attacker.example')).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });
});
