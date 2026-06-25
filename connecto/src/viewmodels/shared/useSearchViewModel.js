/**
 * Search ViewModel (Shared)
 * Manages global search state and results
 */

import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { authHeaders } from '../../services/utils/authUtils';

export const useSearchViewModel = () => {
  const { token } = useContext(AuthContext);

  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [isOpen, setIsOpen]     = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  const search = useCallback(async (q) => {
    if (!q?.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, {
        headers: authHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      }
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [token]);

  // Auto-search when debounced query changes
  useState(() => {
    if (debouncedQuery) search(debouncedQuery);
    else { setResults([]); setIsOpen(false); }
  }, [debouncedQuery]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, []);

  return {
    query,
    results,
    loading,
    isOpen,
    setQuery,
    setIsOpen,
    search,
    clear,
  };
};