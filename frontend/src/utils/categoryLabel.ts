import type { TFunction } from 'i18next';

/** Maps the English DB value stored for each category to its i18n key. */
export const CATEGORY_I18N_KEYS: Record<string, string> = {
  'Work':          'categories.work',
  'Personal':      'categories.personal',
  'Health':        'categories.health',
  'Finance':       'categories.finance',
  'Shopping':      'categories.shopping',
  'Learning':      'categories.learning',
  'Other':         'categories.other',
  'Salary':        'categories.salary',
  'Freelance':     'categories.freelance',
  'Business':      'categories.business',
  'Investment':    'categories.investment',
  'Gift':          'categories.gift',
  'Food & Dining': 'categories.foodDining',
  'Transport':     'categories.transport',
  'Entertainment': 'categories.entertainment',
  'Utilities':     'categories.utilities',
  'Education':     'categories.education',
  'Rent':          'categories.rent',
};

export const TASK_CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Shopping', 'Learning', 'Other'];
export const RECEIPT_CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Education', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
export const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Education', 'Rent', 'Other'];

/** Translated label for a stored category value; unknown values are shown as-is. */
export function categoryLabel(value: string, t: TFunction): string {
  return t(CATEGORY_I18N_KEYS[value] ?? value);
}

/** Select options for a category list, led by a "choose" placeholder. */
export function categoryOptions(values: string[], t: TFunction) {
  return [
    { value: '', label: t('categories.placeholder') },
    ...values.map((value) => ({ value, label: categoryLabel(value, t) })),
  ];
}
