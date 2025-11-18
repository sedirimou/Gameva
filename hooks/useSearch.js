import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionManager } from '../lib/sessionManager';

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    // Ensure query is a string
    const queryString = typeof query === 'string' ? query : '';
    
    if (!queryString || queryString.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Cancel previous search
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {
        // Ignore abort errors from previous requests
      }
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsSearching(true);
    setError(null);

    try {
      // Try Typesense first for fast, typo-tolerant search
      let response;
      let data;
      
      try {
        response = await fetch(`/api/search/typesense?q=${encodeURIComponent(queryString.trim())}&limit=8`, {
          signal: abortController.signal
        });
        
        if (response.ok) {
          data = await response.json();
          if (!abortController.signal.aborted) {
            // Transform Typesense results to match expected format
            const products = data.hits?.map(hit => ({
              id: hit.id,
              name: hit.name,
              slug: hit.slug,
              platform: hit.platform,
              price: hit.price,
              final_price: hit.final_price,
              images_cover_url: hit.images_cover_url,
              images_cover_thumbnail: hit.images_cover_thumbnail
            })) || [];
            setSearchResults(products);
          }
          return;
        }
      } catch (typesenseError) {
        // Silently ignore AbortErrors from cancelled requests
        if (typesenseError.name === 'AbortError' || 
            typesenseError.message?.includes('signal is aborted') ||
            abortController.signal.aborted) {
          return;
        }
        console.warn('Typesense search failed, using PostgreSQL fallback');
      }

      // Fallback to PostgreSQL search
      const { userId, sessionId } = sessionManager.getUserIdentification();
      const params = new URLSearchParams({
        q: queryString.trim(),
        limit: '8'
      });

      if (userId) {
        params.append('user_id', userId);
      } else if (sessionId) {
        params.append('session_id', sessionId);
      }

      response = await fetch(`/api/search/products?${params}`, {
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      data = await response.json();
      
      if (!abortController.signal.aborted) {
        setSearchResults(data.results || []);
      }
    } catch (err) {
      // Silently ignore AbortErrors as they're expected when cancelling requests
      if (err.name === 'AbortError' || 
          err.message?.includes('signal is aborted') || 
          abortController.signal.aborted) {
        return;
      }
      
      // Handle actual errors
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setSearchResults([]);
      setIsSearching(false);
    } finally {
      if (!abortController.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  // Fetch search history
  const fetchSearchHistory = useCallback(async () => {
    try {
      const { userId, sessionId } = sessionManager.getUserIdentification();
      const params = new URLSearchParams({ limit: '3' });

      // Ensure we always have a session ID
      const finalSessionId = userId ? null : (sessionId || sessionManager.getSessionId());
      
      if (userId) {
        params.append('user_id', userId);
      } else if (finalSessionId) {
        params.append('session_id', finalSessionId);
      }

      const response = await fetch(`/api/search/history?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.history || []);
        console.log('Search history loaded:', data.history?.length || 0, 'items');
      } else {
        console.log('Search history API error:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Error fetching search history:', err);
    }
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((value) => {
    // Ensure value is a string
    const stringValue = typeof value === 'string' ? value : '';
    setSearchTerm(stringValue);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(stringValue);
    }, 300);
  }, [performSearch]);

  // Handle search submission
  const handleSearchSubmit = useCallback((query = searchTerm) => {
    // Ensure query is a string
    const queryString = typeof query === 'string' ? query : '';
    const trimmedQuery = queryString.trim();
    if (trimmedQuery) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`;
    }
  }, [searchTerm]);

  // Handle selecting a search result
  const handleResultSelect = useCallback((productSlugOrId) => {
    setShowDropdown(false);
    setSearchTerm('');
    window.location.href = `/product/${productSlugOrId}`;
  }, []);

  // Handle selecting a history item
  const handleHistorySelect = useCallback((term) => {
    setSearchTerm(term);
    setShowDropdown(false);
    handleSearchSubmit(term);
  }, [handleSearchSubmit]);

  // Show/hide dropdown
  const showSearchDropdown = useCallback(() => {
    setShowDropdown(true);
    // Always fetch search history when dropdown is shown
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  const hideSearchDropdown = useCallback(() => {
    setTimeout(() => setShowDropdown(false), 150);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    setError(null);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {
        // Ignore abort errors during cleanup
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (err) {
          // Ignore cleanup abort errors
        }
      }
    };
  }, []);

  return {
    searchTerm,
    searchResults,
    searchHistory,
    isSearching,
    showDropdown,
    error,
    handleSearchChange,
    handleSearchSubmit,
    handleResultSelect,
    handleHistorySelect,
    showSearchDropdown,
    hideSearchDropdown,
    clearSearch,
    fetchSearchHistory
  };
}