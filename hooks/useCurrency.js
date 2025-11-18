/**
 * Currency Hook - Static Frontend Only
 * Handles currency display and selection (no backend conversion)
 */

import { useState, useEffect, useCallback } from 'react';
import { SSRSafeStorage } from '../lib/ssrSafeStorage.js';

export function useCurrency() {
  const [currentCurrency, setCurrentCurrency] = useState('EUR');
  const [loading, setLoading] = useState(false);

  // Static currency list for frontend display - Only EUR supported
  const currencies = [
    { code: 'EUR', symbol: '€', decimals: 2, symbol_position: 'before', is_euro: true }
  ];

  // Initialize currency from storage
  useEffect(() => {
    try {
      const savedCurrency = SSRSafeStorage.getItem('selected_currency');
      if (savedCurrency && currencies.find(c => c.code === savedCurrency)) {
        setCurrentCurrency(savedCurrency);
      }
    } catch (error) {
      console.error('Error loading currency preference:', error);
      // Clear invalid currency data and set to EUR
      SSRSafeStorage.removeItem('selected_currency');
      setCurrentCurrency('EUR');
    }
  }, []);

  // Listen for currency changes from settings modal
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      const { currency } = event.detail;
      setCurrentCurrency(currency);
      SSRSafeStorage.setItem('selected_currency', currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  // Format price with EUR symbol (no conversion, display only)
  const formatPrice = useCallback((priceInEur, targetCurrency = null) => {
    const price = parseFloat(priceInEur || 0);
    return `€${price.toFixed(2)}`;
  }, []);

  // Format multiple prices
  const formatPrices = useCallback((prices, targetCurrency = null) => {
    const result = {};
    for (const [key, price] of Object.entries(prices)) {
      result[key] = formatPrice(price, targetCurrency);
    }
    return result;
  }, [formatPrice]);

  // Calculate total for cart/checkout (always in EUR)
  const calculateTotal = useCallback((items, targetCurrency = null) => {
    if (!Array.isArray(items)) return 0;
    
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.sale_price || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
    
    return parseFloat(total.toFixed(2));
  }, []);

  // Format cart total with EUR currency
  const formatTotal = useCallback((items, targetCurrency = null) => {
    const total = calculateTotal(items, targetCurrency);
    return formatPrice(total, targetCurrency);
  }, [calculateTotal, formatPrice]);

  // Change currency
  const changeCurrency = useCallback((currencyCode) => {
    if (currencies.find(c => c.code === currencyCode)) {
      setCurrentCurrency(currencyCode);
      SSRSafeStorage.setItem('selected_currency', currencyCode);
      
      // Dispatch event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('currencyChanged', { 
          detail: { currency: currencyCode } 
        }));
      }
    }
  }, []);

  return {
    currentCurrency,
    currencies,
    loading,
    formatPrice,
    formatPrices,
    calculateTotal,
    formatTotal,
    changeCurrency
  };
}