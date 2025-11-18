import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from "../../components/layout/MainLayout";
import LoginComponent from "../../components/auth/LoginComponent";
import RegisterComponent from "../../components/auth/RegisterComponent";
import ForgotPasswordComponent from "../../components/auth/ForgotPasswordComponent";
import { loadRecaptchaScript } from "../../lib/recaptcha";

export default function AuthPage() {
  const router = useRouter();
  const { type } = router.query;
  // Use router.query.type directly with fallback to avoid state delays
  const authType = ['login', 'register', 'forgot-password'].includes(type) ? type : 'login';

  // Load reCAPTCHA script for auth pages
  useEffect(() => {
    if (router.isReady) {
      loadRecaptchaScript().catch(error => {
        console.error('Failed to load reCAPTCHA:', error);
      });
    }
  }, [router.isReady]);

  // Remove redirect logic to prevent navigation delays
  useEffect(() => {
    if (!router.isReady) return;
    if (type && !['login', 'register', 'forgot-password'].includes(type)) {
      router.replace('/auth/login');
    }
  }, [type, router]);

  const getPageTitle = () => {
    switch (authType) {
      case 'login':
        return 'Login - Gamava';
      case 'register':
        return 'Register - Gamava';
      case 'forgot-password':
        return 'Forgot Password - Gamava';
      default:
        return 'Authentication - Gamava';
    }
  };

  const getLeftPanelContent = () => {
    switch (authType) {
      case 'login':
        return {
          image: '/login.svg',
          alt: 'Login'
        };
      case 'register':
        return {
          image: '/signup.svg',
          alt: 'Register'
        };
      case 'forgot-password':
        return {
          image: '/login.svg',
          alt: 'Forgot Password'
        };
      default:
        return {
          image: '/login.svg',
          alt: 'Authentication'
        };
    }
  };

  const navigateTo = (newType) => {
    router.push(`/auth/${newType}`);
  };

  const leftPanelContent = getLeftPanelContent();

  return (
    <MainLayout 
      title={getPageTitle()}
      description={`${authType === 'login' ? 'Sign in to' : authType === 'register' ? 'Create account on' : 'Reset password for'} Gamava - Your gaming destination`}
      includeFooter={true}
    >
      <div className="flex-1 relative">
        {/* Green gradient wave background - positioned below payment banner */}
        <div className="absolute left-0 right-0 overflow-hidden" style={{ bottom: '-65px', height: '1000px' }}>
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(41, 173, 178, 0.3)" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(153, 180, 118, 0.2)" d="M0,224L48,229.3C96,235,192,245,288,229.3C384,213,480,171,576,165.3C672,160,768,192,864,197.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        {/* Auth Form Container */}
        <div className="relative z-10 flex items-center justify-center min-h-full py-4 md:py-20 px-4 md:px-8">
          <div className="w-full max-w-4xl">
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 overflow-hidden" style={{ minHeight: authType === 'forgot-password' ? '400px' : '500px', maxHeight: 'calc(100vh - 120px)' }}>
              <div className="flex flex-col md:flex-row h-full">
                {/* Left side - Hidden on mobile, visible on desktop */}
                <div className="hidden md:block md:w-1/2">
                  <div className="flex items-center justify-center relative overflow-hidden h-full">
                    <img 
                      src={leftPanelContent.image} 
                      alt={leftPanelContent.alt} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right side - Full width on mobile, half width on desktop */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-[#00337c] min-h-[400px] overflow-y-auto">
                  {authType === 'login' && <LoginComponent onNavigate={navigateTo} />}
                  {authType === 'register' && <RegisterComponent onNavigate={navigateTo} />}
                  {authType === 'forgot-password' && <ForgotPasswordComponent onNavigate={navigateTo} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}