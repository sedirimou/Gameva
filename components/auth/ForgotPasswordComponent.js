import { useState } from 'react';
import { handleApiSuccess, handleApiError } from '../../lib/errorHandler';
import { executeRecaptcha } from '../../lib/recaptcha';

export default function ForgotPasswordComponent({ onNavigate }) {
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ""
  });
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Execute reCAPTCHA before password reset
      const recaptchaToken = await executeRecaptcha('forgot_password');
      console.log('reCAPTCHA token obtained for password reset');
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...forgotPasswordData,
          recaptchaToken
        }),
      });

      if (response.ok) {
        setResetEmail(forgotPasswordData.email);
        setIsEmailSent(true);
        handleApiSuccess('Password reset instructions sent to your email.');
      } else {
        const error = await response.json();
        handleApiError(new Error(error.error || 'Password reset failed. Please try again.'));
      }
    } catch (error) {
      console.error('Reset error:', error);
      handleApiError(error, 'Connection error occurred. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setForgotPasswordData(prev => ({ ...prev, [field]: value }));
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Check Your Email</h1>
        <p className="text-white/80 mb-6 md:mb-8 text-sm md:text-base">
          We've sent a password reset link to <span className="text-[#29adb2]">{resetEmail}</span>
        </p>
        <p className="text-white/60 text-xs md:text-sm mb-6 md:mb-8">
          Didn't receive the email? Check your spam folder or try again.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => setIsEmailSent(false)}
            className="w-full py-3 bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Try Different Email
          </button>
          
          <div className="text-center">
            <button
              onClick={() => onNavigate('login')}
              className="text-[#29adb2] hover:text-[#1e8a8f] font-medium"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">Forgot Password</h1>
      <p className="text-white/80 mb-4 md:mb-6 text-sm md:text-base">Enter your email address and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label className="block text-white/90 text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={forgotPasswordData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email address"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Send Reset Link
        </button>

        <div className="text-center space-y-2">
          <p className="text-white/80 text-sm">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-[#29adb2] hover:text-[#1e8a8f] font-medium"
            >
              Sign In
            </button>
          </p>
          <p className="text-white/80 text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-[#29adb2] hover:text-[#1e8a8f] font-medium"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
      
      {/* reCAPTCHA Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-white/60">
          This site is protected by reCAPTCHA and the Google{" "}
          <a 
            href="https://policies.google.com/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#29adb2] hover:text-[#1e8a8f] underline"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a 
            href="https://policies.google.com/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#29adb2] hover:text-[#1e8a8f] underline"
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </div>
    </div>
  );
}