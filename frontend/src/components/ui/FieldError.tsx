/** Red "!" badge shown before a label when its field is invalid. */
export function ErrorMark() {
  return (
    <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-danger text-[11px] leading-none font-bold text-on-primary">
      !
    </span>
  );
}

/** Message under an invalid field. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="mt-1 text-xs font-medium text-danger-text">{message}</p>;
}
