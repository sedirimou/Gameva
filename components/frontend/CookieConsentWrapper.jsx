/**
 * Cookie Consent Wrapper Component
 * Only loads and initializes cookie consent for frontend pages
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initializeCookieConsent } from '../../lib/cookieConsent';

export default function CookieConsentWrapper() {
  const router = useRouter();

  useEffect(() => {
    // Only initialize on frontend pages (not admin)
    if (!router.pathname.startsWith('/admin')) {
      const timer = setTimeout(() => {
        initializeCookieConsent();
      }, 1000); // Small delay to ensure page is fully loaded

      return () => clearTimeout(timer);
    }
  }, [router.pathname]);

  // This component doesn't render anything visible
  return null;
}