export const CURRENCY = 'EGP';

/** Format an amount as "EGP 1234.50". */
export function formatMoney(amount: number): string {
  return `${CURRENCY} ${amount.toFixed(2)}`;
}
