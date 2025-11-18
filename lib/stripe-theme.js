// GameVa Stripe Theme Configuration
// Complete theme override for Stripe Elements with GameVa colors

export const gamevaStripeTheme = {
  // Use 'none' theme for maximum customization
  theme: 'none',
  
  // GameVa color variables
  variables: {
    // Primary colors
    colorPrimary: '#153E90',
    colorPrimaryText: '#ffffff',
    
    // Background colors
    colorBackground: 'transparent',
    colorBackgroundText: 'rgba(255, 255, 255, 0.1)',
    colorBackgroundDestructive: '#df1b41',
    
    // Text colors
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
    colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
    
    // Border colors
    colorBorder: 'rgba(255, 255, 255, 0.2)',
    colorBorderAccent: '#153E90',
    colorBorderFocus: '#153E90',
    
    // Status colors
    colorDanger: '#df1b41',
    colorDangerText: '#ffffff',
    colorSuccess: '#99b476',
    colorSuccessText: '#ffffff',
    colorWarning: '#c5e898',
    colorWarningText: '#000000',
    
    // Icon colors
    tabIconColor: '#ffffff',
    tabIconSelectedColor: '#ffffff',
    tabIconHoverColor: 'rgba(255, 255, 255, 0.8)',
    
    // Typography
    fontFamily: 'Onest, Inter, system-ui, sans-serif',
    fontFamilySecondary: 'Onest, Inter, system-ui, sans-serif',
    fontSize: '14px',
    fontSizeBase: '14px',
    fontSizeLg: '16px',
    fontSizeSm: '12px',
    fontSizeXs: '11px',
    fontWeightLight: '300',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600',
    
    // Spacing
    spacingUnit: '4px',
    spacingXs: '4px',
    spacingSm: '6px',
    spacingMd: '8px',
    spacingLg: '12px',
    spacingXl: '16px',
    
    // Border radius
    borderRadius: '8px',
    
    // Focus
    focusBoxShadow: '0 0 0 2px rgba(21, 62, 144, 0.3)',
    focusOutline: 'none',
  },
  
  // Custom CSS rules for complete styling control
  rules: {
    // Container styling
    '.Block': {
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      boxShadow: 'none',
    },
    
    // Tab styling
    '.Tab': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '12px 16px',
      fontFamily: 'Onest, Inter, system-ui, sans-serif',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      marginBottom: '8px',
    },
    
    '.Tab:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    
    '.Tab--selected': {
      backgroundColor: '#153E90',
      borderColor: '#153E90',
      color: '#ffffff',
      fontWeight: '600',
    },
    
    '.Tab--selected:hover': {
      backgroundColor: '#0f2d6b',
      borderColor: '#0f2d6b',
    },
    
    // Input field styling
    '.Input': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '12px',
      fontFamily: 'Onest, Inter, system-ui, sans-serif',
      fontSize: '14px',
      transition: 'all 0.2s ease',
    },
    
    '.Input:hover': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    
    '.Input:focus': {
      borderColor: '#153E90',
      boxShadow: '0 0 0 2px rgba(21, 62, 144, 0.3)',
      outline: 'none',
    },
    
    '.Input--invalid': {
      borderColor: '#df1b41',
      boxShadow: '0 0 0 2px rgba(223, 27, 65, 0.3)',
    },
    
    '.Input::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    
    // Label styling
    '.Label': {
      color: '#ffffff',
      fontFamily: 'Onest, Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px',
    },
    
    // Error message styling
    '.Error': {
      color: '#df1b41',
      fontFamily: 'Onest, Inter, system-ui, sans-serif',
      fontSize: '12px',
      marginTop: '4px',
    },
    
    // Icon styling
    '.Icon': {
      color: '#ffffff',
    },
    
    '.TabIcon': {
      color: '#ffffff',
    },
    
    '.TabIcon--selected': {
      color: '#ffffff',
    },
    
    // Card brand icon styling
    '.CardBrandIcon': {
      color: '#ffffff',
      filter: 'brightness(1.2)',
    },
    
    // Loading spinner
    '.Spinner': {
      color: '#153E90',
    },
    
    // Button styling (for payment buttons)
    '.SubmitButton': {
      backgroundColor: '#153E90',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontFamily: 'Onest, Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    
    '.SubmitButton:hover': {
      backgroundColor: '#0f2d6b',
    },
    
    '.SubmitButton:active': {
      backgroundColor: '#0a1f4d',
    },
    
    '.SubmitButton:disabled': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      color: 'rgba(255, 255, 255, 0.5)',
      cursor: 'not-allowed',
    },
    
    // Accordion styling for payment methods
    '.AccordionItem': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      marginBottom: '8px',
    },
    
    '.AccordionItem--selected': {
      backgroundColor: 'rgba(21, 62, 144, 0.2)',
      borderColor: '#153E90',
    },
    
    // Checkbox and radio button styling
    '.Checkbox': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
    },
    
    '.Checkbox--checked': {
      backgroundColor: '#153E90',
      borderColor: '#153E90',
    },
    
    '.Radio': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
    },
    
    '.Radio--checked': {
      backgroundColor: '#153E90',
      borderColor: '#153E90',
    },
    
    // Loading state
    '.LoadingIndicator': {
      color: '#153E90',
    },
    
    // Terms and conditions
    '.TermsText': {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '12px',
      fontFamily: 'Onest, Inter, system-ui, sans-serif',
    },
  }
};

// Payment Element specific options
export const gamevaPaymentElementOptions = {
  layout: {
    type: 'tabs',
    defaultCollapsed: false,
    radios: false,
    spacedAccordionItems: true
  },
  
  fields: {
    billingDetails: 'auto'
  },
  
  terms: {
    card: 'never'
  },
  
  wallets: {
    applePay: 'auto',
    googlePay: 'auto'
  }
};

// Express Checkout Element options
export const gamevaExpressCheckoutOptions = {
  buttonType: {
    applePay: 'pay',
    googlePay: 'pay'
  },
  
  buttonTheme: {
    applePay: 'black',
    googlePay: 'black'
  },
  
  buttonHeight: 48,
  
  layout: {
    maxColumns: 1,
    maxRows: 1
  }
};

// Complete Stripe configuration
export const gamevaStripeConfig = {
  appearance: gamevaStripeTheme,
  clientSecret: null, // Will be set dynamically
  loader: 'auto'
};