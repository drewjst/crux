'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchTickers } from '@/lib/api';
import type { SearchResponse } from '@recon/shared';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Correct debounce implementation using useEffect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchTickers(debouncedQuery),
    enabled: debouncedQuery.length >= 2, // Require 2 chars to reduce noise
    staleTime: 60 * 1000, // 1 minute cache
  });

  return {
    query,
    setQuery,
    results: data?.results || [],
    isLoading: isLoading && debouncedQuery.length >= 2,
    error,
  };
}
