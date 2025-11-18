/**
 * CallToAction Component - Buttons and action elements
 */
import Link from 'next/link';

const CallToAction = ({ data }) => {
  const {
    buttonText = 'Click Me',
    linkUrl = '#',
    buttonStyle = 'primary',
    buttonSize = 'md',
    alignment = 'center',
    customClasses = '',
    marginTop = '0',
    marginBottom = '1rem'
  } = data;

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const styleClasses = {
    primary: 'bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white hover:shadow-xl',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-[#29adb2] text-[#29adb2] hover:bg-[#29adb2] hover:text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const containerStyle = {
    marginTop,
    marginBottom
  };

  const buttonClasses = `
    inline-block font-semibold rounded-lg transition-all duration-300
    ${styleClasses[buttonStyle]} 
    ${sizeClasses[buttonSize]}
    ${customClasses}
  `.trim();

  const isExternal = linkUrl.startsWith('http') || linkUrl.startsWith('//');

  return (
    <div 
      className={`${alignmentClasses[alignment]} ${customClasses}`}
      style={containerStyle}
    >
      {isExternal ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses}
        >
          {buttonText}
        </a>
      ) : (
        <Link href={linkUrl} className={buttonClasses}>
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default CallToAction;