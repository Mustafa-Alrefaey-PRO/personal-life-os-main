import { Alert } from './Alert';

/** Inline form error, styled like every other alert. */
export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <Alert variant="error" message={message} />;
}
