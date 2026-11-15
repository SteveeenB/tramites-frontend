import { getWompiCheckoutUrl } from './wompiCheckout';

describe('getWompiCheckoutUrl', () => {
  test('allows the official Wompi checkout origin and preserves its path and query', () => {
    expect(getWompiCheckoutUrl('https://checkout.wompi.co/p/abc?public-key=test'))
      .toBe('https://checkout.wompi.co/p/abc?public-key=test');
  });

  test.each([
    'http://checkout.wompi.co/p/abc',
    'https://checkout.wompi.co.attacker.example/p/abc',
    'https://attacker.example/checkout.wompi.co',
    'https://user@checkout.wompi.co/p/abc',
    '//checkout.wompi.co/p/abc',
    'javascript:alert(1)',
    '',
    null,
  ])('rejects an unsafe checkout URL: %s', (value) => {
    expect(getWompiCheckoutUrl(value)).toBeNull();
  });
});
