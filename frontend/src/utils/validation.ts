/** Small validators that return an i18n key for the problem, or undefined when the value is fine. */
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const isBlank = (value: string | undefined | null) => !value || !value.trim();

export const requiredKey = (value: string | undefined | null) => (isBlank(value) ? 'validation.required' : undefined);

export const emailKey = (value: string) =>
  isBlank(value) ? 'validation.required' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'validation.invalidEmail';

/** Mirrors the API: 3–32 letters, digits, dot, underscore or hyphen (no "@"). */
export const userNameKey = (value: string) =>
  isBlank(value) ? 'validation.required' : /^[A-Za-z0-9._-]{3,32}$/.test(value.trim()) ? undefined : 'validation.userNameRules';

export const positiveAmountKey = (value: number) => (value > 0 ? undefined : 'validation.amountPositive');

/** Drops undefined entries so `Object.keys(errors).length` tells whether the form is valid. */
export function compact<K extends string>(errors: Record<K, string | undefined>): FieldErrors<K> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as FieldErrors<K>;
}
