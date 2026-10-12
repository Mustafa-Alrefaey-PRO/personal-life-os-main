import { useParams } from 'react-router-dom';

/**
 * Record id from a `/section/:id` route: null on `/section/new` (no id param),
 * NaN for a malformed id, which simply matches no record.
 */
export function useRecordId(): number | null {
  const { id } = useParams();
  return id === undefined ? null : Number(id);
}
