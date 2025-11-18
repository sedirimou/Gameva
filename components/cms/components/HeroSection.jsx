/**
 * HeroSection Component - Page hero section
 */
import { useRouter } from 'next/router';

const HeroSection = ({ data, isEditing = false }) => {
  const {
    title = '',
    subtitle = '',
    description = '',
    backgroundImage = '',
    backgroundColor = 'transparent',
    textColor: customTextColor = '',
    overlayOpacity = '0.5',
    primaryButtonText = '',
    primaryButtonLink = '#',
    secondaryButtonText = '',
    secondaryButtonLink = '#',
    showSecondaryButton = false,
    textAlignment = 'center',
    layout = 'fullscreen',
    height = 'medium',
    alignment = 'center',
    customClasses = '',
    marginTop = '0',
    marginBottom = '2rem',
    titleFontSize = 'large',
    subtitleFontSize = 'medium',
    descriptionFontSize = 'base'
  } = data;

  const router = useRouter();
  
  // Determine if we're in admin context or frontend
  const isAdminContext = isEditing || router.pathname.startsWith('/admin');
  const textColor = isAdminContext ? '#000000' : '#ffffff';

  const containerStyle = {
    marginTop,
    marginBottom,
    color: textColor,
    minHeight: height === 'small' ? '80px' : height === 'large' ? '600px' : '300px'
  };

  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {
      background: backgroundColor
    };
  };

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  const getFontSizeClass = (size, type) => {
    const fontSizes = {
      title: {
        small: 'text-3xl md:text-4xl lg:text-5xl',
        medium: 'text-4xl md:text-5xl lg:text-6xl',
        large: 'text-5xl md:text-6xl lg:text-7xl',
        xlarge: 'text-6xl md:text-7xl lg:text-8xl'
      },
      subtitle: {
        small: 'text-lg md:text-xl',
        medium: 'text-xl md:text-2xl',
        large: 'text-2xl md:text-3xl',
        xlarge: 'text-3xl md:text-4xl'
      },
      description: {
        small: 'text-sm md:text-base',
        medium: 'text-base md:text-lg',
        large: 'text-lg md:text-xl',
        xlarge: 'text-xl md:text-2xl'
      }
    };
    
    return fontSizes[type]?.[size] || fontSizes[type]?.medium || 'text-base';
  };

  const textAlign = textAlignment || alignment;

  return (
    <div 
      className={`hero-section relative flex ${alignmentClasses[textAlign]} ${customClasses}`}
      style={{ ...containerStyle, ...getBackgroundStyle() }}
    >
      <div className="w-full max-w-6xl mx-auto px-6 py-4">
        <div className={`space-y-3 ${textAlign === 'center' ? 'max-w-4xl mx-auto' : 'max-w-2xl'}`}>
          {title && (
            <h1 className={`${getFontSizeClass(titleFontSize, 'title')} font-bold leading-tight`}>
              {title}
            </h1>
          )}
          
          {subtitle && (
            <h2 className={`${getFontSizeClass(subtitleFontSize, 'subtitle')} font-medium opacity-90`}>
              {subtitle}
            </h2>
          )}
          
          {description && (
            <p className={`${getFontSizeClass(descriptionFontSize, 'description')} opacity-80 leading-relaxed`}>
              {description}
            </p>
          )}
          

        </div>
      </div>
    </div>
  );
};

export default HeroSection;