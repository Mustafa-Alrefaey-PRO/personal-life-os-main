import { useState } from 'react';

export const PAGE_SIZE = 6;

/** Client-side paging over an already filtered list. The page clamps when the list shrinks. */
export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const paged = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    paged,
    paginationProps: { page: currentPage, totalPages, onPageChange: setPage, totalItems: items.length, pageSize },
  };
}
