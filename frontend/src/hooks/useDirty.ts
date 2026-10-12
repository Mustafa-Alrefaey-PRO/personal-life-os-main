import { useState } from 'react';

/** True once `value` differs from what it was on the first render (compared as JSON), e.g. a form with unsaved edits. */
export function useDirty(value: unknown): boolean {
  const [initial] = useState(() => JSON.stringify(value));
  return JSON.stringify(value) !== initial;
}
