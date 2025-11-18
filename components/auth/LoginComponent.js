import { useState } from 'react';
import { useRouter } from 'next/router';
import { handleApiSuccess, handleApiError } from '../../lib/errorHandler';
import { useAuth } from '../../hooks/useAuth';
import { executeRecaptcha } from '../../lib/recaptcha';

export default function LoginComponent({ onNavigate }) {
  const router = useRouter();
  const { login, checkAuthStatus } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
      handleApiError(new Error('Please enter both email and password.'));
      return;
    }

    setIsLoading(true);
    
    // Only log in non-test environments
    const isTestEnv = process.env.NODE_ENV === 'test' || typeof jest !== 'undefined';
    
    if (!isTestEnv) {
      console.log('Login attempt with data:', { email: loginData.email, password: '***' });
    }
    
    try {
      // Execute reCAPTCHA before login
      const recaptchaToken = await executeRecaptcha('login');
      
      if (!isTestEnv) {
        console.log('reCAPTCHA token obtained for login');
      }
      
      const result = await login(loginData.email, loginData.password, loginData.rememberMe, recaptchaToken);
      
      if (result.success) {
        if (!isTestEnv) {
          console.log('Login successful:', result);
        }
        handleApiSuccess('Login successful! Welcome back.');
        // Trigger immediate auth status refresh to update header
        await checkAuthStatus();
        router.push('/');
      } else {
        if (!isTestEnv) {
          console.error('Login failed:', result.error);
        }
        // Show only the specific error message from the server
        handleApiError(new Error(result.error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLogin = (provider) => {
    if (provider.toLowerCase() === 'steam') {
      // Redirect to Steam authentication
      window.location.href = '/api/auth/steam';
    } else if (provider.toLowerCase() === 'discord') {
      // Redirect to Discord authentication
      window.location.href = '/api/auth/discord';
    } else if (provider.toLowerCase() === 'google') {
      // Redirect to Google authentication
      window.location.href = '/api/auth/google';
    } else {
      console.log(`Login with ${provider} - Not implemented yet`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">Sign In</h1>
      <p className="text-white/80 mb-4 md:mb-6 text-sm md:text-base">Welcome back! Please sign in to your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label className="block text-white/90 text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={loginData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-white/90 text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={loginData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/20 text-blue-600 focus:ring-blue-400"
            />
            <span className="ml-2 text-white/80 text-sm">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => onNavigate('forgot-password')}
            className="text-[#29adb2] hover:text-[#1e8a8f] text-sm"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#00337c] text-white/60">Or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex-1 h-12 bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
          >
            <svg className="w-5 h-5 md:mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="hidden md:inline">Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Discord')}
            className="flex-1 h-12 bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
          >
            <svg className="w-5 h-5 md:mr-2 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="hidden md:inline">Discord</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Steam')}
            className="flex-1 h-12 bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
          >
            <svg className="w-5 h-5 md:mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.632 20.307 6.279 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.633.264-1.336.005-1.973-.254-.634-.737-1.141-1.356-1.427-.635-.297-1.357-.277-1.987-.016l1.51.624c.956.396 1.405 1.442 1.009 2.397-.396.955-1.442 1.405-2.397 1.009s-1.405-1.442-1.009-2.397l.052-.127zm6.97-8.744c-.009 1.664-1.354 3.007-3.019 3.007-1.665 0-3.009-1.343-3.009-3.007 0-1.665 1.344-3.009 3.009-3.009 1.665 0 3.01 1.344 3.019 3.009zm-2.263 0c0-.418-.34-.758-.758-.758s-.758.34-.758.758.34.758.758.758.758-.34.758-.758z"/>
            </svg>
            <span className="hidden md:inline">Steam</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
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