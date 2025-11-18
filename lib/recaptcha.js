/**
 * Google reCAPTCHA v3 Integration Utilities
 * Handles client-side script loading and server-side token verification
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Load reCAPTCHA v3 script dynamically on required pages
 * @param {Function} onLoad - Callback function when script loads
 */
export const loadRecaptchaScript = (onLoad = null) => {
  // Check if script is already loaded
  if (window.grecaptcha) {
    if (onLoad) onLoad();
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    
    script.onload = () => {
      if (onLoad) onLoad();
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Execute reCAPTCHA and get token
 * @param {string} action - Action name for this request
 * @returns {Promise<string>} reCAPTCHA token
 */
export const executeRecaptcha = async (action = 'submit') => {
  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA not loaded');
  }

  try {
    const token = await window.grecaptcha.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, 
      { action }
    );
    return token;
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error);
    throw new Error('reCAPTCHA verification failed');
  }
};

/**
 * Verify reCAPTCHA token on server side
 * @param {string} token - reCAPTCHA token from client
 * @param {number} scoreThreshold - Minimum score threshold (default: 0.5)
 * @returns {Promise<Object>} Verification result
 */
export const verifyRecaptchaToken = async (token, scoreThreshold = 0.5) => {
  if (!token) {
    return {
      success: false,
      error: 'No reCAPTCHA token provided'
    };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'reCAPTCHA verification failed',
        details: data['error-codes']
      };
    }

    if (data.score < scoreThreshold) {
      return {
        success: false,
        error: 'reCAPTCHA score too low',
        score: data.score,
        threshold: scoreThreshold
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
      hostname: data.hostname
    };

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: 'reCAPTCHA verification service unavailable'
    };
  }
};

/**
 * Custom hook for reCAPTCHA integration
 */
export const useRecaptcha = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    loadRecaptchaScript()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load reCAPTCHA:', error);
        setIsLoading(false);
      });
  }, []);

  const execute = useCallback(async (action = 'submit') => {
    if (!isLoaded) {
      throw new Error('reCAPTCHA not loaded yet');
    }
    return executeRecaptcha(action);
  }, [isLoaded]);

  return {
    isLoaded,
    isLoading,
    execute
  };
};