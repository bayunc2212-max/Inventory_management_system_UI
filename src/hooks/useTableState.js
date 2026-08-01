import { useMemo, useState } from 'react';

export function useTableState(initial = {}) {
  const [search, setSearch] = useState(initial.search || '');
  const [page, setPage] = useState(initial.page || 1);
  const [pageSize, setPageSize] = useState(initial.pageSize || 10);
  const [sortBy, setSortBy] = useState(initial.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(initial.sortOrder || 'DESC');
  const [filters, setFilters] = useState(initial.filters || {});

  const query = useMemo(
    () => ({
      search: search || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
      ...filters,
    }),
    [search, page, pageSize, sortBy, sortOrder, filters]
  );

  return { search, setSearch, page, setPage, pageSize, setPageSize, sortBy, setSortBy, sortOrder, setSortOrder, filters, setFilters, query };
}
