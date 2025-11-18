import { X } from "lucide-react";

export function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl border border-white/20 bg-[#00347d]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* User Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
            }}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Welcome!
        </h2>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          {/* Google */}
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full border-2 border-white/30 rounded-xl py-3 px-4 text-white hover:border-white/50 transition-all duration-200 flex items-center justify-center gap-3 bg-[#ffffff33]"
          >
            <span className="text-lg">Connect with</span>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
          </button>

          {/* Discord */}
          <button
            onClick={() => handleSocialLogin('discord')}
            className="w-full border-2 border-white/30 rounded-xl py-3 px-4 text-white hover:border-white/50 transition-all duration-200 flex items-center justify-center gap-3 bg-[#ffffff33]"
          >
            <span className="text-lg">Connect with</span>
            <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
          </button>

          {/* Steam */}
          <button
            onClick={() => handleSocialLogin('steam')}
            className="w-full border-2 border-white/30 rounded-xl py-3 px-4 text-white hover:border-white/50 transition-all duration-200 flex items-center justify-center gap-3 bg-[#ffffff33]"
          >
            <span className="text-lg">Connect with</span>
            <div className="w-8 h-8 bg-[#1b2838] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.632 20.307 6.279 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.633.264-1.336.005-1.973-.254-.634-.737-1.141-1.356-1.427-.635-.297-1.357-.277-1.987-.016l1.51.624c.956.396 1.405 1.442 1.009 2.397-.396.955-1.442 1.405-2.397 1.009s-1.405-1.442-1.009-2.397l.052-.127zm6.97-8.744c-.009 1.664-1.354 3.007-3.019 3.007-1.665 0-3.009-1.343-3.009-3.007 0-1.665 1.344-3.009 3.009-3.009 1.665 0 3.01 1.344 3.019 3.009zm-2.263 0c0-.418-.34-.758-.758-.758s-.758.34-.758.758.34.758.758.758.758-.34.758-.758z"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Sign In Button */}
        <a href="/login">
          <button
            className="w-full text-white font-semibold py-3 rounded-xl text-lg mb-6 transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
            }}
          >
            Sign in
          </button>
        </a>

        {/* Toggle Text */}
        <div className="text-center">
          <p className="text-white/80 text-sm mb-2">
            don't have an account ?
          </p>
          <a href="/signup" className="text-white font-semibold underline hover:text-white/80 transition-colors">
            Sign Up
          </a>
        </div>

      </div>
    </div>
  );
}