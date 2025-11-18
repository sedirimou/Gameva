/**
 * Stripe Configuration
 * Handles Stripe initialization for both server and client side
 */

// Server-side Stripe instance (for API routes)
let stripeServerInstance = null;

export function getStripeServer() {
  if (!stripeServerInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    const Stripe = require('stripe');
    stripeServerInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeServerInstance;
}

// Client-side Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
  options: {
    locale: 'en'
  }
};

// Export Stripe publishable key for client-side use
export const STRIPE_PUBLISHABLE_KEY = stripeConfig.publishableKey;

// Validate Stripe configuration
export function validateStripeConfig() {
  const errors = [];
  
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY environment variable is missing');
  }
  
  if (!stripeConfig.publishableKey) {
    errors.push('STRIPE_PUBLISHABLE_KEY environment variable is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}