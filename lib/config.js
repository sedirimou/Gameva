/**
 * Environment Configuration Manager
 * Handles different environments (Replit, Vercel, Production, Local Development)
 * 
 * Provides centralized, reliable URL detection across all environments
 * and prevents environment variable conflicts or undefined values.
 */

export const getEnvironmentConfig = () => {
  // Explicit boolean checks for environment detection
  const isReplit = Boolean(process.env.REPL_ID || process.env.REPL_SLUG);
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Local development port configuration
  const LOCAL_PORT = process.env.PORT || 5000; // Default to 5000 for Replit compatibility
  
  // Production URL - set this manually for your production deployment
  const PRODUCTION_URL = process.env.PRODUCTION_SITE_URL;
  
  let siteUrl;
  let environment;
  
  // Environment-specific URL detection
  if (isProduction) {
    if (isVercel && process.env.VERCEL_URL) {
      // Vercel deployment
      siteUrl = `https://${process.env.VERCEL_URL}`;
      environment = 'vercel';
    } else if (PRODUCTION_URL) {
      // Other production deployment with custom domain
      siteUrl = PRODUCTION_URL;
      environment = 'production';
    } else if (isReplit && process.env.REPL_SLUG && process.env.REPL_OWNER) {
      // Replit production deployment
      siteUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
      environment = 'replit-production';
    } else {
      // Fallback for production without proper configuration
      siteUrl = 'https://localhost';
      environment = 'production-fallback';
      console.warn('Production environment detected but no PRODUCTION_SITE_URL configured');
    }
  } else {
    // Development environments
    if (isReplit && process.env.REPL_SLUG && process.env.REPL_OWNER) {
      // Replit development environment
      siteUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
      environment = 'replit-development';
    } else {
      // Local development
      siteUrl = `http://localhost:${LOCAL_PORT}`;
      environment = 'local';
    }
  }
  
  return {
    siteUrl,
    environment,
    isProduction,
    isDevelopment,
    isReplit,
    isVercel,
    port: LOCAL_PORT,
    // Additional utility flags
    isServer: typeof window === 'undefined',
    isClient: typeof window !== 'undefined'
  };
};

// Create configuration object
export const config = getEnvironmentConfig();

// Export individual values for convenience
export const SITE_URL = config.siteUrl;
export const ENVIRONMENT = config.environment;
export const IS_PRODUCTION = config.isProduction;
export const IS_DEVELOPMENT = config.isDevelopment;
export const IS_REPLIT = config.isReplit;
export const IS_VERCEL = config.isVercel;
export const IS_SERVER = config.isServer;
export const IS_CLIENT = config.isClient;

// Debug logging in development
if (IS_DEVELOPMENT && IS_SERVER) {
  console.log('🔧 Environment Configuration:', {
    environment: ENVIRONMENT,
    siteUrl: SITE_URL,
    isProduction: IS_PRODUCTION,
    isReplit: IS_REPLIT,
    isVercel: IS_VERCEL,
    port: config.port
  });
}