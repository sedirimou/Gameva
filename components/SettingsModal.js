import { useState, useEffect } from 'react';
import { SSRSafeStorage } from '../lib/ssrSafeStorage.js';

export default function SettingsModal({ isOpen, onClose }) {
  const [language, setLanguage] = useState('English US');
  const [currency, setCurrency] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Language options
  const languages = [
    'English US',
    'English UK',
    'French',
    'German',
    'Spanish',
    'Italian',
    'Portuguese',
    'Dutch',
    'Polish',
    'Russian',
    'Japanese',
    'Chinese',
    'Korean'
  ];

  // Initialize currencies when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeCurrencies();
    }
  }, [isOpen]);

  const initializeCurrencies = () => {
    // Static currency list - Only EUR supported
    const staticCurrencies = [
      { code: 'EUR', symbol: '€', decimals: 2, symbol_position: 'before', is_euro: true }
    ];
    
    setCurrencies(staticCurrencies);
    
    // Get current currency from localStorage
    const storedCurrency = SSRSafeStorage.getItem('selected_currency');
    
    if (storedCurrency) {
      // Find the stored currency in the list
      const currentCurrency = staticCurrencies.find(c => c.code === storedCurrency);
      if (currentCurrency) {
        setCurrency(`${currentCurrency.code} (${currentCurrency.symbol})`);
      }
    } else {
      // Fallback to Euro if no preference is stored
      const euroCurrency = staticCurrencies.find(c => c.code === 'EUR');
      if (euroCurrency) {
        setCurrency(`${euroCurrency.code} (${euroCurrency.symbol})`);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Extract currency code from the selected format "EUR (€)"
      const currencyCode = currency.split(' ')[0];
      
      // Save to server (database for logged users, localStorage for guests)
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          currency: currencyCode
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Always save to localStorage for immediate access
        localStorage.setItem('preferred_language', language);
        localStorage.setItem('preferred_currency', currencyCode);
        
        // Trigger currency change event for real-time updates across the site
        window.dispatchEvent(new CustomEvent('currencyChanged', { 
          detail: { currency: currencyCode, language } 
        }));

        // Simple success notification
        console.log('Settings saved successfully!');
        onClose();
      } else {
        console.error('Failed to save settings:', data.error);
        alert('Error saving settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-[#00347d] rounded-lg p-8 w-full max-w-md mx-4 border border-white/30"
        style={{ backgroundColor: '#00347d' }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Update your settings
          </h2>
          <p className="text-white/80 text-sm">
            Set your preferred language, and the currency.
          </p>
        </div>

        {/* Language Section */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3">
            Language
          </label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-[#00347d] text-white">
                  {lang}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Currency Section */}
        <div className="mb-8">
          <label className="block text-white font-medium mb-3">
            Currency
          </label>
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {currencies.map((curr) => (
                <option 
                  key={curr.id} 
                  value={`${curr.code} (${curr.symbol})`} 
                  className="bg-[#00347d] text-white"
                >
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
            style={{
              background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}