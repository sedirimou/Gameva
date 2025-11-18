import Head from 'next/head';
import Header from '../frontend/Header';
import Footer from '../frontend/Footer';
// import { useAppPreloader } from '../../hooks/useAppPreloader';
import CacheIndicator from '../debug/CacheIndicator';
import CookieConsentWrapper from '../frontend/CookieConsentWrapper';

export default function MainLayout({ 
  children, 
  title = "Gamava", 
  description = "Your gaming destination",
  includeFooter = true,
  backgroundColor = "#153E90"
}) {
  // Temporarily disabled preloader to fix React hooks issue
  // useAppPreloader();

  const backgroundClass = "min-h-screen text-white flex flex-col";
  const backgroundStyle = backgroundColor ? { backgroundColor } : {};

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={backgroundClass} style={backgroundStyle}>
        <Header />
        
        <main className="pt-[8rem] md:pt-[8rem] lg:pt-[8rem] pb-16 flex-1">
          {children}
        </main>

        {includeFooter && <Footer />}
        
        {/* Cache Performance Indicator - Development Only */}
        <CacheIndicator />
        
        {/* Cookie Consent - Frontend Only */}
        <CookieConsentWrapper />
      </div>
    </>
  );
}