/**
 * Global Error Handler for API Responses
 * Provides centralized error handling with professional toast notifications
 */

import { toast } from 'react-toastify';

/**
 * Handle API errors with user-friendly notifications
 * @param {Object} error - Error object from API call
 * @param {string} customMessage - Optional custom error message
 */
export const handleApiError = (error, customMessage = null) => {
  // If custom message is provided, use it exclusively
  if (customMessage) {
    toast.error(customMessage);
    return;
  }

  // Handle simple Error objects with messages
  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }

  // Handle network errors (no response)
  if (!error.response) {
    toast.error("Network error. Please check your connection.");
    return;
  }

  const status = error.response?.status;
  const message = error.response?.data?.message || error.response?.data?.error;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      toast.error(message || "Bad request. Please check your input.");
      break;
    case 401:
      toast.error(message || "Invalid email or password");
      break;
    case 403:
      toast.error(message || "You are not authorized to perform this action.");
      break;
    case 404:
      toast.error(message || "Requested resource not found.");
      break;
    case 409:
      toast.error(message || "Conflict occurred. Please try again.");
      break;
    case 422:
      toast.error(message || "Invalid data provided. Please check your input.");
      break;
    case 429:
      toast.error(message || "Too many requests. Please wait a moment.");
      break;
    case 500:
      toast.error(message || "Internal server error. Please try again later.");
      break;
    case 502:
      toast.error(message || "Service temporarily unavailable. Please try again.");
      break;
    case 503:
      toast.error(message || "Service unavailable. Please try again later.");
      break;
    default:
      toast.error(message || "An unexpected error occurred. Please try again.");
  }
};

/**
 * Handle API success responses with notifications
 * @param {string} message - Success message to display
 * @param {Object} options - Additional toast options
 */
export const handleApiSuccess = (message, options = {}) => {
  toast.success(message, {
    autoClose: 3000,
    ...options
  });
};

/**
 * Handle API info notifications
 * @param {string} message - Info message to display
 * @param {Object} options - Additional toast options
 */
export const handleApiInfo = (message, options = {}) => {
  toast.info(message, {
    autoClose: 3000,
    ...options
  });
};

/**
 * Handle API warning notifications
 * @param {string} message - Warning message to display
 * @param {Object} options - Additional toast options
 */
export const handleApiWarning = (message, options = {}) => {
  toast.warn(message, {
    autoClose: 4000,
    ...options
  });
};

/**
 * Wrapper for fetch requests with automatic error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {boolean} showSuccessToast - Whether to show success toast
 * @param {string} successMessage - Custom success message
 */
export const apiRequest = async (url, options = {}, showSuccessToast = false, successMessage = 'Operation completed successfully') => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      // Create error object similar to axios
      const error = {
        response: {
          status: response.status,
          data: data
        }
      };
      throw error;
    }

    if (showSuccessToast) {
      handleApiSuccess(successMessage);
    }

    return data;
  } catch (error) {
    // Handle fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      handleApiError({ response: null });
    } else {
      handleApiError(error);
    }
    throw error;
  }
};

/**
 * Format error messages for specific contexts
 */
export const errorMessages = {
  auth: {
    invalidCredentials: "Invalid email or password. Please try again.",
    sessionExpired: "Your session has expired. Please log in again.",
    accessDenied: "Access denied. Please check your permissions.",
  },
  payment: {
    paymentFailed: "Payment processing failed. Please try again.",
    invalidCard: "Invalid card information. Please check your details.",
    insufficientFunds: "Insufficient funds. Please try a different payment method.",
  },
  cart: {
    addFailed: "Failed to add item to cart. Please try again.",
    updateFailed: "Failed to update cart. Please try again.",
    emptyCart: "Your cart is empty.",
  },
  wishlist: {
    addFailed: "Failed to add item to wishlist. Please try again.",
    removeFailed: "Failed to remove item from wishlist. Please try again.",
  },
  general: {
    loadingFailed: "Failed to load data. Please refresh the page.",
    saveFailed: "Failed to save changes. Please try again.",
    deleteFailed: "Failed to delete item. Please try again.",
  }
};