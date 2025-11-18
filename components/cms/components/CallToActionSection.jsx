/**
 * CallToActionSection Component - Full-width CTA section
 */
const CallToActionSection = ({ data }) => {
  const {
    title = 'Ready to Get Started?',
    subtitle = 'Join thousands of satisfied customers',
    description = 'Experience the best digital marketplace for gaming products and software.',
    primaryButtonText = 'Get Started',
    primaryButtonUrl = '#',
    secondaryButtonText = '',
    secondaryButtonUrl = '#',
    backgroundType = 'gradient',
    backgroundColor = '#153e8f',
    backgroundImage = '',
    textColor = '#ffffff',
    customClasses = '',
    marginTop = '0',
    marginBottom = '2rem'
  } = data;

  const containerStyle = {
    marginTop,
    marginBottom,
    color: textColor
  };

  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #153e8f 0%, #1e40af 100%)'
        };
      case 'color':
        return {
          backgroundColor
        };
      case 'image':
        return {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #153e8f 0%, #1e40af 100%)'
        };
    }
  };

  return (
    <div 
      className={`cta-section py-16 px-8 ${customClasses}`}
      style={{ ...containerStyle, ...getBackgroundStyle() }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
        
        {subtitle && (
          <h3 className="text-xl md:text-2xl mb-6 opacity-90">{subtitle}</h3>
        )}
        
        {description && (
          <p className="text-lg md:text-xl mb-8 opacity-80 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {primaryButtonText && (
            <a
              href={primaryButtonUrl}
              className="bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
            >
              {primaryButtonText}
            </a>
          )}
          
          {secondaryButtonText && (
            <a
              href={secondaryButtonUrl}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;