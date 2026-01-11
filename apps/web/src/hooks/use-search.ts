'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchTickers } from '@/lib/api';
import type { SearchResponse } from '@recon/shared';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    // Simple debounce using setTimeout
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchTickers(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    query,
    setQuery: handleQueryChange,
    results: data?.results || [],
    isLoading: isLoading && debouncedQuery.length >= 1,
    error,
  };
}
