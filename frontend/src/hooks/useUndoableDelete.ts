import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/useToast';
import { usePendingDeleteStore } from '../stores/pendingDeleteStore';

const UNDO_MS = 6000;

interface UndoableDelete {
  /** Query key and pending-delete section, e.g. 'tasks' */
  section: string;
  id: number;
  /** Shown in the toast: "Doctor appointment" deleted */
  name: string;
  /** The real delete request */
  remove: () => Promise<unknown>;
}

/**
 * Delete with Undo. The record disappears at once and a neutral toast offers
 * Undo for 6 seconds (paused while hovered); the delete request is sent only
 * when the toast closes. Undo simply shows the record again. If the request
 * fails, the record comes back and a red error stays until closed.
 *
 * Closing the tab during those seconds means the delete is never sent — the
 * safe way to fail.
 */
export function useUndoableDelete() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { add, remove: clear } = usePendingDeleteStore();

  return ({ section, id, name, remove }: UndoableDelete) => {
    const key = `${section}:${id}`;
    add(key);
    showToast(t('common.deletedNamed', { name }), 'neutral', {
      duration: UNDO_MS,
      action: { label: t('common.undo'), onClick: () => clear(key) },
      onClose: async () => {
        try {
          await remove();
        } catch {
          showToast(t('common.deleteFailed', { name }), 'error');
        } finally {
          clear(key);
          queryClient.invalidateQueries({ queryKey: [section] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      },
    });
  };
}
