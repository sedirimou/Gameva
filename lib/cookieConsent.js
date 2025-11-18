/**
 * Cookie Consent Library Integration
 * Handles initialization and configuration of Osano Cookie Consent
 */

import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

let isInitialized = false;

/**
 * Generate a unique consent ID
 */
function generateConsentId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `consent_${timestamp}_${random}`;
}

/**
 * Check if current route is an admin route
 */
function isAdminRoute() {
  if (typeof window === 'undefined') return false;
  
  const pathname = window.location.pathname;
  return pathname.startsWith('/admin') || pathname.includes('/admin/');
}

/**
 * Initialize Cookie Consent with database settings
 */
export async function initializeCookieConsent() {
  if (isInitialized) {
    return;
  }

  // Don't initialize cookie consent in admin pages
  if (isAdminRoute()) {
    console.log('Cookie consent skipped - admin route detected');
    return;
  }

  try {
    // Fetch settings from API
    const response = await fetch('/api/cookie-consent');
    if (!response.ok) {
      console.warn('Failed to fetch cookie consent settings, using defaults');
      return;
    }

    const data = await response.json();
    if (!data.settings || !data.settings.is_enabled) {
      console.log('Cookie consent is disabled');
      return;
    }
    
    console.log('🍪 Initializing cookie consent as small bottom-left icon');

    const settings = data.settings;

    // Create custom small cookie icon instead of modal
    createCookieIcon(settings);
    isInitialized = true;

  } catch (error) {
    console.error('Failed to initialize cookie consent:', error);
  }
}

/**
 * Create small cookie icon in bottom-left corner
 */
function createCookieIcon(settings) {
  if (typeof window === 'undefined') return;

  // Check if user has already accepted cookies or dismissed the icon
  const cookieAccepted = localStorage.getItem('cookieConsent');
  const cookieDismissed = localStorage.getItem('cookieConsentDismissed');
  
  if (cookieAccepted === 'accepted' || cookieDismissed === 'true') {
    console.log('🍪 Cookie consent already handled, not showing icon');
    return;
  }

  // Remove any existing cookie icons
  const existingIcon = document.getElementById('custom-cookie-icon');
  if (existingIcon) {
    existingIcon.remove();
  }

  // Create cookie icon container
  const cookieIcon = document.createElement('div');
  cookieIcon.id = 'custom-cookie-icon';
  cookieIcon.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" style="cursor: pointer; transition: all 0.3s ease;">
      <defs>
        <linearGradient id="cookieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#99b476;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#29adb2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#cookieGradient)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <!-- Cookie holes/chips -->
      <circle cx="14" cy="14" r="2" fill="white"/>
      <circle cx="26" cy="16" r="1.5" fill="white"/>
      <circle cx="16" cy="26" r="1.5" fill="white"/>
      <circle cx="28" cy="26" r="2" fill="white"/>
      <circle cx="22" cy="12" r="1" fill="white"/>
      <circle cx="12" cy="22" r="1" fill="white"/>
      <circle cx="30" cy="20" r="1" fill="white"/>
      <!-- Cookie bite -->
      <path d="M 32 8 A 8 8 0 0 1 32 32 A 12 12 0 0 0 32 8 Z" fill="#153E90"/>
    </svg>
  `;

  // Apply styling
  cookieIcon.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    transition: all 0.3s ease;
    padding: 0;
    margin: 0;
  `;

  // Add hover effect for SVG
  const svgElement = cookieIcon.querySelector('svg');
  cookieIcon.addEventListener('mouseenter', () => {
    svgElement.style.transform = 'scale(1.1)';
    svgElement.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';
  });

  cookieIcon.addEventListener('mouseleave', () => {
    svgElement.style.transform = 'scale(1)';
    svgElement.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
  });

  // Add click handler to open settings popup
  svgElement.addEventListener('click', () => {
    showCookieSettingsModal(settings);
    console.log('🍪 Cookie settings popup opened');
  });

  // Add to page
  document.body.appendChild(cookieIcon);
  console.log('🍪 Cookie consent icon created in bottom-left corner');
}

/**
 * Show cookie settings modal when icon is clicked
 */
function showCookieSettingsModal(settings) {
  if (typeof window === 'undefined') return;

  // Remove any existing modal
  const existingModal = document.getElementById('cookie-settings-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal backdrop
  const modalBackdrop = document.createElement('div');
  modalBackdrop.id = 'cookie-settings-modal';
  modalBackdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: ${settings.theme_color || '#153e8f'};
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  `;

  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">${settings.banner_title || 'Cookie Preferences'}</h2>
      <button id="close-cookie-modal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 4px;">×</button>
    </div>
    
    <p style="margin-bottom: 24px; line-height: 1.6; opacity: 0.9;">
      ${settings.banner_description || 'We use cookies to enhance your browsing experience and analyze website traffic. You can choose which categories of cookies to accept.'}
    </p>

    <div style="margin-bottom: 24px;">
      <!-- Essential Cookies -->
      <div style="margin-bottom: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
        <button id="essential-toggle" style="
          background: none;
          border: none;
          color: white;
          padding: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
        ">
          <span>Essential Cookies</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="checkbox" id="essential-cookies" checked disabled style="transform: scale(1.2);">
            <span id="essential-arrow" style="transform: rotate(0deg); transition: transform 0.2s ease;">▼</span>
          </div>
        </button>
        <div id="essential-content" style="
          display: none;
          padding: 0 16px 16px 16px;
          font-size: 0.875rem;
          opacity: 0.8;
          line-height: 1.5;
        ">
          ${settings.essential_cookies_description || 'Required for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility.'}
        </div>
      </div>

      <!-- Analytics Cookies -->
      <div style="margin-bottom: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
        <button id="analytics-toggle" style="
          background: none;
          border: none;
          color: white;
          padding: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
        ">
          <span>Analytics Cookies</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="checkbox" id="analytics-cookies" style="transform: scale(1.2);">
            <span id="analytics-arrow" style="transform: rotate(0deg); transition: transform 0.2s ease;">▼</span>
          </div>
        </button>
        <div id="analytics-content" style="
          display: none;
          padding: 0 16px 16px 16px;
          font-size: 0.875rem;
          opacity: 0.8;
          line-height: 1.5;
        ">
          ${settings.analytics_cookies_description || 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.'}
        </div>
      </div>

      <!-- Marketing Cookies -->
      <div style="margin-bottom: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
        <button id="marketing-toggle" style="
          background: none;
          border: none;
          color: white;
          padding: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
        ">
          <span>Marketing Cookies</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="checkbox" id="marketing-cookies" style="transform: scale(1.2);">
            <span id="marketing-arrow" style="transform: rotate(0deg); transition: transform 0.2s ease;">▼</span>
          </div>
        </button>
        <div id="marketing-content" style="
          display: none;
          padding: 0 16px 16px 16px;
          font-size: 0.875rem;
          opacity: 0.8;
          line-height: 1.5;
        ">
          ${settings.marketing_cookies_description || 'Used to deliver personalized advertisements and track the effectiveness of advertising campaigns.'}
        </div>
      </div>
    </div>

    <!-- Show Details Dropdown (moved after Marketing Cookies) -->
    <div style="margin-bottom: 24px;">
      <button id="show-details-toggle" style="
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 0.875rem;
        cursor: pointer;
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s ease;
      ">
        <span>Show details</span>
        <span id="details-arrow" style="transform: rotate(0deg); transition: transform 0.2s ease;">▼</span>
      </button>
      
      <div id="details-content" style="
        display: none;
        margin-top: 12px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.5;
      ">
        <div style="margin-bottom: 12px;">
          <strong>Date of consent:</strong> <span id="consent-date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div>
          <strong>Your consent ID:</strong> <span id="consent-id">${generateConsentId()}</span>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="accept-selected" style="
        background: linear-gradient(131deg, #99b476 0%, #29adb2 100%);
        border: none;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Save Preferences</button>
      
      <button id="accept-all-cookies" style="
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Accept All</button>
    </div>
  `;

  modalBackdrop.appendChild(modalContent);
  document.body.appendChild(modalBackdrop);

  // Add event listeners
  const closeModal = () => {
    modalBackdrop.remove();
  };

  const acceptSelectedCookies = () => {
    const analytics = document.getElementById('analytics-cookies').checked;
    const marketing = document.getElementById('marketing-cookies').checked;
    
    localStorage.setItem('cookieConsent', 'customized');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    localStorage.setItem('cookieAnalytics', analytics.toString());
    localStorage.setItem('cookieMarketing', marketing.toString());
    
    console.log('🍪 Custom cookie preferences saved:', { analytics, marketing });
    
    // Remove the cookie icon since preferences have been set
    const cookieIcon = document.getElementById('custom-cookie-icon');
    if (cookieIcon) cookieIcon.remove();
    
    closeModal();
  };

  const acceptAllCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    localStorage.setItem('cookieAnalytics', 'true');
    localStorage.setItem('cookieMarketing', 'true');
    
    console.log('🍪 All cookies accepted');
    
    // Remove the cookie icon since all cookies have been accepted
    const cookieIcon = document.getElementById('custom-cookie-icon');
    if (cookieIcon) cookieIcon.remove();
    
    closeModal();
  };

  // Cookie category dropdown toggles
  const toggleCookieDropdown = (categoryName) => {
    const content = document.getElementById(`${categoryName}-content`);
    const arrow = document.getElementById(`${categoryName}-arrow`);
    const isVisible = content.style.display !== 'none';
    
    if (isVisible) {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    } else {
      content.style.display = 'block';
      arrow.style.transform = 'rotate(180deg)';
    }
  };

  // Show details dropdown toggle
  const toggleDetailsDropdown = () => {
    const detailsContent = document.getElementById('details-content');
    const detailsArrow = document.getElementById('details-arrow');
    const isVisible = detailsContent.style.display !== 'none';
    
    if (isVisible) {
      detailsContent.style.display = 'none';
      detailsArrow.style.transform = 'rotate(0deg)';
    } else {
      detailsContent.style.display = 'block';
      detailsArrow.style.transform = 'rotate(180deg)';
    }
  };

  // Event listeners
  document.getElementById('close-cookie-modal').addEventListener('click', closeModal);
  document.getElementById('accept-selected').addEventListener('click', acceptSelectedCookies);
  document.getElementById('accept-all-cookies').addEventListener('click', acceptAllCookies);
  document.getElementById('show-details-toggle').addEventListener('click', toggleDetailsDropdown);
  
  // Cookie category dropdown event listeners
  document.getElementById('essential-toggle').addEventListener('click', () => toggleCookieDropdown('essential'));
  document.getElementById('analytics-toggle').addEventListener('click', () => toggleCookieDropdown('analytics'));
  document.getElementById('marketing-toggle').addEventListener('click', () => toggleCookieDropdown('marketing'));
  
  // Prevent checkbox clicks from toggling dropdowns
  document.getElementById('essential-cookies').addEventListener('click', (e) => e.stopPropagation());
  document.getElementById('analytics-cookies').addEventListener('click', (e) => e.stopPropagation());
  document.getElementById('marketing-cookies').addEventListener('click', (e) => e.stopPropagation());
  
  // Close modal when clicking backdrop
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // Add hover effects to buttons
  const buttons = modalContent.querySelectorAll('button');
  buttons.forEach(button => {
    if (button.id === 'accept-selected') {
      button.addEventListener('mouseenter', () => {
        button.style.background = 'linear-gradient(131deg, #a4c282 0%, #35b8bd 100%)';
        button.style.transform = 'translateY(-1px)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)';
        button.style.transform = 'translateY(0)';
      });
    } else if (button.id === 'accept-all-cookies') {
      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 255, 255, 0.2)';
        button.style.transform = 'translateY(-1px)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(255, 255, 255, 0.1)';
        button.style.transform = 'translateY(0)';
      });
    }
  });
}

/**
 * Apply custom CSS styling based on database settings (Legacy - not used for icon)
 */
function applyCustomStyling(settings) {
  if (typeof window === 'undefined') return;

  // Remove any existing cookie consent styles and force cache clear
  const existingStyles = document.querySelectorAll('style[data-cookie-consent]');
  existingStyles.forEach(style => style.remove());
  
  // Force clear any cached cookie consent CSS
  const allStyles = document.querySelectorAll('style');
  allStyles.forEach(style => {
    if (style.textContent && style.textContent.includes('448px')) {
      style.remove();
    }
  });

  const style = document.createElement('style');
  style.setAttribute('data-cookie-consent', 'true');
  style.setAttribute('data-version', 'v3-5-ratio-' + Date.now());
  style.textContent = `
    /* Custom Cookie Consent Styling - 3:5 Aspect Ratio Update */
    #cc-main {
      font-family: inherit !important;
    }

    /* Consent Modal - 3:5 Aspect Ratio Design */
    #cc-main .cm {
      background-color: ${settings.theme_color || '#2d4ba6'} !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
      max-width: 525px !important;
      width: 525px !important;
      height: 315px !important;
      position: fixed !important;
      bottom: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 9999 !important;
      padding: 24px !important;
      margin: 0 auto !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
    }

    #cc-main .cm__title {
      color: #ffffff !important;
      font-weight: 700 !important;
      font-size: 1.25rem !important;
      margin-bottom: 12px !important;
      line-height: 1.3 !important;
    }

    #cc-main .cm__desc {
      color: #ffffff !important;
      line-height: 1.5 !important;
      font-size: 0.9rem !important;
      margin-bottom: 20px !important;
      opacity: 0.95 !important;
    }

    /* Button Container - HORIZONTAL LAYOUT FOR 4:3 RATIO */
    #cc-main .cm__btns {
      display: flex !important;
      flex-direction: row !important;
      gap: 12px !important;
      margin-top: auto !important;
      flex-shrink: 0 !important;
      justify-content: space-between !important;
    }

    /* Primary Button (Accept All) - AGGRESSIVE GREEN GRADIENT OVERRIDE */
    .cm__btn--primary,
    #cc-main .cm__btn--primary,
    .cm__btn[data-role="all"],
    button:contains("Accept all"),
    button[class*="primary"] {
      background: linear-gradient(131deg, #99b476 0%, #29adb2 100%) !important;
      background-color: transparent !important;
      border: none !important;
      color: #ffffff !important;
      font-weight: 600 !important;
      border-radius: 6px !important;
      padding: 10px 16px !important;
      font-size: 0.85rem !important;
      transition: all 0.2s ease !important;
      flex: 1 !important;
      text-align: center !important;
      white-space: nowrap !important;
    }

    .cm__btn--primary:hover,
    #cc-main .cm__btn--primary:hover,
    .cm__btn[data-role="all"]:hover,
    button:contains("Accept all"):hover,
    button[class*="primary"]:hover {
      background: linear-gradient(131deg, #8ba366 0%, #259a9f 100%) !important;
      background-color: transparent !important;
      transform: translateY(-1px) !important;
    }

    /* Secondary Button (Accept Only Essential) - FLEX */
    #cc-main .cm__btn--secondary {
      background-color: #ffffff !important;
      border: none !important;
      color: #2d4ba6 !important;
      font-weight: 600 !important;
      border-radius: 6px !important;
      padding: 10px 16px !important;
      font-size: 0.85rem !important;
      transition: all 0.2s ease !important;
      flex: 1 !important;
      text-align: center !important;
      white-space: nowrap !important;
    }

    #cc-main .cm__btn--secondary:hover {
      background-color: #f8fafc !important;
      transform: translateY(-1px) !important;
    }

    /* Preferences Button - FLEX */
    #cc-main .cm__btn {
      background-color: #ffffff !important;
      border: none !important;
      color: #2d4ba6 !important;
      font-weight: 600 !important;
      border-radius: 6px !important;
      padding: 10px 16px !important;
      font-size: 0.85rem !important;
      transition: all 0.2s ease !important;
      flex: 1 !important;
      text-align: center !important;
      white-space: nowrap !important;
    }

    #cc-main .cm__btn:hover {
      background-color: #f8fafc !important;
      transform: translateY(-1px) !important;
    }

    /* Footer Links - NO BACKGROUND */
    #cc-main .cm__footer {
      margin-top: 16px !important;
      padding-top: 16px !important;
      border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
      background: none !important;
      background-color: transparent !important;
      text-align: center !important;
    }

    #cc-main .cm__footer a {
      color: rgba(255, 255, 255, 0.8) !important;
      text-decoration: underline !important;
      margin-right: 16px !important;
      font-size: 0.75rem !important;
      background: none !important;
      background-color: transparent !important;
      padding: 0 !important;
      border: none !important;
    }

    #cc-main .cm__footer a:hover {
      color: #ffffff !important;
      background: none !important;
      background-color: transparent !important;
    }

    /* Mobile Responsiveness - 4:3 RATIO MAINTAINED */
    @media (max-width: 768px) {
      #cc-main .cm {
        max-width: calc(100vw - 32px) !important;
        width: calc(100vw - 32px) !important;
        height: calc((100vw - 32px) * 3 / 4) !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        padding: 20px !important;
        border-radius: 10px !important;
      }
      
      /* Stack buttons vertically on mobile */
      #cc-main .cm__btns {
        flex-direction: column !important;
        gap: 10px !important;
        margin-top: auto !important;
      }
      
      #cc-main .cm__btn--primary,
      #cc-main .cm__btn--secondary,
      #cc-main .cm__btn {
        flex: none !important;
        width: 100% !important;
        padding: 10px 16px !important;
        font-size: 0.85rem !important;
      }
    }

    /* Remove duplicate button CSS - using the ones defined above */
  `;

  document.head.appendChild(style);
  
  // Log the applied dimensions for verification
  console.log('🎯 Cookie consent modal dimensions applied: 525px × 315px (3:5 aspect ratio)');
  
  // Force style application with multiple attempts and broader targeting
  const applyButtonStyle = (attempts = 0) => {
    // Target ALL possible button selectors
    const selectors = [
      '#cc-main .cm__btn--primary',
      '.cm__btn--primary', 
      '[class*="primary"]',
      'button[class*="btn"][class*="primary"]',
      '.cm__btn[data-role="all"]',
      '.cm__btns button:first-child',
      'button:contains("Accept all")'
    ];
    
    let buttonFound = false;
    
    selectors.forEach(selector => {
      try {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(btn => {
          if (btn && (btn.textContent?.includes('Accept all') || btn.classList.contains('cm__btn--primary'))) {
            btn.style.setProperty('background', 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)', 'important');
            btn.style.setProperty('background-color', 'transparent', 'important');
            btn.style.setProperty('color', '#ffffff', 'important');
            btn.style.setProperty('border', 'none', 'important');
            buttonFound = true;
            console.log('✅ Cookie consent green gradient applied via selector:', selector);
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
    
    if (!buttonFound && attempts < 20) {
      setTimeout(() => applyButtonStyle(attempts + 1), 300);
    } else if (buttonFound) {
      console.log('🎉 Green gradient successfully applied to Accept all button!');
    }
  };
  
  // Start applying styles immediately and with delays
  setTimeout(() => applyButtonStyle(), 50);
  setTimeout(() => applyButtonStyle(), 500);
  setTimeout(() => applyButtonStyle(), 1000);
}

/**
 * Helper function to adjust color brightness
 */
function adjustColor(color, amount) {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

/**
 * Show cookie preferences modal
 */
export function showCookiePreferences() {
  if (typeof window !== 'undefined' && window.CookieConsent) {
    CookieConsent.showPreferences();
  }
}

/**
 * Reset cookie consent (for testing)
 */
export function resetCookieConsent() {
  if (typeof window !== 'undefined' && window.CookieConsent) {
    CookieConsent.reset();
    isInitialized = false;
  }
}

/**
 * Check if a category is accepted
 */
export function isCategoryAccepted(category) {
  if (typeof window === 'undefined' || !window.CookieConsent) {
    return false;
  }
  return CookieConsent.acceptedCategory(category);
}