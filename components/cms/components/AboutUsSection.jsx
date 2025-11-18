/**
 * AboutUsSection Component - About us content section
 */
const AboutUsSection = ({ data }) => {
  const {
    title = 'About Us',
    subtitle = 'Learn more about our company',
    content = 'We are a leading digital marketplace specializing in gaming products and software solutions.',
    image = '/placeholder-image.svg',
    buttonText = 'Learn More',
    buttonUrl = '#',
    layout = 'side-by-side',
    backgroundColor = 'transparent',
    customClasses = '',
    marginTop = '0',
    marginBottom = '2rem'
  } = data;

  const containerStyle = {
    marginTop,
    marginBottom,
    backgroundColor
  };

  const layoutClasses = layout === 'centered' 
    ? 'text-center' 
    : 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-center';

  return (
    <div 
      className={`about-us-section ${customClasses}`}
      style={containerStyle}
    >
      <div className={`max-w-6xl mx-auto ${layoutClasses}`}>
        {layout === 'side-by-side' && (
          <>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <h3 className="text-xl text-gray-600">{subtitle}</h3>
              )}
              <p className="text-gray-700 leading-relaxed">{content}</p>
              {buttonText && buttonUrl && (
                <div className="pt-4">
                  <a
                    href={buttonUrl}
                    className="inline-block bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow duration-300"
                  >
                    {buttonText}
                  </a>
                </div>
              )}
            </div>
            <div className="text-center">
              <img
                src={image}
                alt={title}
                onError={(e) => {
                  e.target.src = '/placeholder-image.svg';
                }}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          </>
        )}
        
        {layout === 'centered' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <h3 className="text-xl text-gray-600">{subtitle}</h3>
              )}
            </div>
            <div className="max-w-md mx-auto">
              <img
                src={image}
                alt={title}
                onError={(e) => {
                  e.target.src = '/placeholder-image.svg';
                }}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">{content}</p>
            {buttonText && buttonUrl && (
              <div className="pt-4">
                <a
                  href={buttonUrl}
                  className="inline-block bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-shadow duration-300"
                >
                  {buttonText}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUsSection;