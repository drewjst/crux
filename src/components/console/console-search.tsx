'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';

interface ConsoleSearchProps {
  onSelect: (ticker: string) => void;
}

export function ConsoleSearch({ onSelect }: ConsoleSearchProps) {
  const { query, setQuery, results, isLoading } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    (ticker: string) => {
      onSelect(ticker.toUpperCase());
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onSelect, setQuery]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        setQuery('');
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex].ticker);
        } else if (query.trim()) {
          handleSelect(query.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Reset selection index when results change
  useEffect(() => {
    setSelectedIndex(-1);
    if (query.length >= 2) {
      setIsOpen(true);
    }
  }, [query, results]);

  // Close on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 max-w-[220px]">
      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search stocks & ETFs..."
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="console-search-results"
        aria-autocomplete="list"
        className="w-full rounded bg-zinc-900 border border-zinc-800 py-1.5 pl-7 pr-7 text-xs text-zinc-200 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
      />
      {query && !isLoading && (
        <button
          onClick={() => { setQuery(''); setIsOpen(false); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {isLoading && (
        <Loader2 className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 animate-spin" />
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded border border-zinc-700 bg-zinc-900 shadow-lg">
          <ul id="console-search-results" role="listbox" className="py-1">
            {results.map((result, index) => (
              <li key={result.ticker} role="option" aria-selected={index === selectedIndex}>
                <button
                  type="button"
                  onClick={() => handleSelect(result.ticker)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                    index === selectedIndex ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                  }`}
                  tabIndex={-1}
                >
                  <span className="text-xs font-mono font-medium text-zinc-100">{result.ticker}</span>
                  {result.type === 'etf' ? (
                    <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      ETF
                    </span>
                  ) : (
                    <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-zinc-700/50 text-zinc-400 border border-zinc-700">
                      Stock
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-500 truncate ml-auto">
                    {result.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
