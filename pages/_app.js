import '../styles/globals.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import Head from 'next/head'
import { initializeMonitoring } from '../lib/clientMonitor'
import { initializeCookieConsent } from '../lib/cookieConsent'
import ErrorBoundary from '../components/ErrorBoundary'

// Tell Font Awesome to skip adding the CSS automatically since it's being imported above
config.autoAddCss = false

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize API monitoring
    initializeMonitoring();
    
    // Initialize Cookie Consent only for non-admin pages
    const isAdminPage = window.location.pathname.startsWith('/admin');
    if (!isAdminPage) {
      initializeCookieConsent();
    }

    // Preline UI removed per user request
    
    // Complete currency cleanup - remove all PLN/USD references
    if (typeof window !== 'undefined') {
      // Remove all currency-related keys
      localStorage.removeItem('preferred_currency');
      localStorage.removeItem('currency_preference');
      localStorage.removeItem('selected_currency');
      
      // Remove all cache that might contain old currency data
      localStorage.removeItem('categories_cache');
      localStorage.removeItem('platforms_cache');
      localStorage.removeItem('filters_cache');
      localStorage.removeItem('settings_cache');
      localStorage.removeItem('essentialData_cache');
      localStorage.removeItem('siteSettings_cache');
      
      // Clear any Stripe-related currency cache
      sessionStorage.removeItem('stripe_currency');
      sessionStorage.removeItem('payment_currency');
      sessionStorage.removeItem('checkout_currency');
      
      // Force set EUR as the only currency
      localStorage.setItem('selected_currency', 'EUR');
      
      console.log('Complete currency cleanup completed - EUR only');
    }

    // Ping Neon database every 2 minutes to keep it awake
    const pingNeon = async () => {
      try {
        await fetch('/api/ping-neon');
      } catch (error) {
        console.warn('Neon ping failed:', error);
      }
    };

    // Initial ping after 30 seconds
    const initialTimeout = setTimeout(pingNeon, 30000);
    
    // Regular ping every 2 minutes
    const interval = setInterval(pingNeon, 120000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <SpeedInsights />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ zIndex: 99999 }}
        toastStyle={{
          backgroundColor: '#1e293b',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px'
        }}
      />
    </ErrorBoundary>
  )
}