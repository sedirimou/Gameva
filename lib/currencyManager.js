/**
 * Currency Management System - Static Frontend Only
 * Handles currency display and user preferences (no backend conversion)
 */

import { SSRSafeStorage } from './ssrSafeStorage.js';

export class CurrencyManager {
  constructor() {
    // Static currency list for frontend display only
    this.currencies = [
      { code: 'EUR', symbol: '€', decimals: 2, symbol_position: 'before', is_euro: true }
    ];
    
    this.currentCurrency = this.currencies[0]; // Default to EUR
    this.baseCurrency = 'EUR'; // Base currency is always EUR
    this.listeners = [];
  }

  /**
   * Initialize currency manager (simplified for frontend only)
   */
  async initialize() {
    try {
      // Load saved currency preference
      const savedCurrency = SSRSafeStorage.getItem('selected_currency');
      if (savedCurrency) {
        const currency = this.currencies.find(c => c.code === savedCurrency);
        if (currency) {
          this.currentCurrency = currency;
        }
      }
      return true;
    } catch (error) {
      console.error('Error initializing currency manager:', error);
      return false;
    }
  }

  /**
   * Get all available currencies
   */
  getCurrencies() {
    return this.currencies;
  }

  /**
   * Get current selected currency
   */
  getCurrentCurrency() {
    return this.currentCurrency;
  }

  /**
   * Set current currency by code
   */
  setCurrency(currencyCode) {
    const currency = this.currencies.find(c => c.code === currencyCode);
    if (currency) {
      this.currentCurrency = currency;
      SSRSafeStorage.setItem('selected_currency', currencyCode);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Format price with EUR symbol (no conversion, display only)
   */
  formatPrice(priceInEur, targetCurrencyCode = null) {
    // Always format as EUR since we're not doing real conversion
    const price = parseFloat(priceInEur || 0);
    return `€${price.toFixed(2)}`;
  }

  /**
   * Format multiple prices at once
   */
  formatPrices(prices, targetCurrencyCode = null) {
    const result = {};
    for (const [key, price] of Object.entries(prices)) {
      result[key] = this.formatPrice(price, targetCurrencyCode);
    }
    return result;
  }

  /**
   * Get currency preference from localStorage only
   */
  loadCurrencyPreference() {
    const storedCurrency = SSRSafeStorage.getItem('selected_currency');
    return storedCurrency || 'EUR';
  }

  /**
   * Initialize user currency preference
   */
  initializeUserCurrency() {
    const preferredCurrency = this.loadCurrencyPreference();
    return this.setCurrency(preferredCurrency);
  }

  /**
   * Add listener for currency changes
   */
  onCurrencyChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove currency change listener
   */
  removeCurrencyListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners of currency change
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentCurrency);
      } catch (error) {
        console.error('Error in currency change listener:', error);
      }
    });
  }

  /**
   * Get currency info by code
   */
  getCurrencyByCode(code) {
    return this.currencies.find(c => c.code === code);
  }

  /**
   * Calculate total for cart/checkout (always in EUR)
   */
  calculateTotal(items, targetCurrencyCode = null) {
    let total = 0;
    
    items.forEach(item => {
      const price = parseFloat(item.final_price || item.finalPrice || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      total += price * quantity;
    });

    return total;
  }

  /**
   * Format cart total with EUR currency
   */
  formatTotal(items, targetCurrencyCode = null) {
    const total = this.calculateTotal(items, targetCurrencyCode);
    return this.formatPrice(total, targetCurrencyCode);
  }
}

// Create singleton instance
export const currencyManager = new CurrencyManager();