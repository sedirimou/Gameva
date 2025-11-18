/**
 * Session Manager for handling guest user sessions
 */

export class SessionManager {
  constructor() {
    this.sessionKey = 'gamava_session_id';
  }

  // Generate a unique session ID
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get or create session ID for guest users
  getSessionId() {
    if (typeof window === 'undefined') return null;
    
    let sessionId = localStorage.getItem(this.sessionKey);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.sessionKey, sessionId);
    }
    
    return sessionId;
  }

  // Clear session ID (for logout or session reset)
  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.sessionKey);
  }

  // Get user identification for API calls
  getUserIdentification() {
    // In a real app, you would check for logged-in user first
    // For now, we'll use session ID for all users
    const sessionId = this.getSessionId();
    
    return {
      user_id: null, // Set this if user is logged in
      session_id: sessionId
    };
  }
}

export const sessionManager = new SessionManager();