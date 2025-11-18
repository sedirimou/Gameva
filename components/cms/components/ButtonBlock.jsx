/**
 * ButtonBlock Component - Custom button with advanced styling
 */
const ButtonBlock = ({ data }) => {
  const {
    text = 'Button',
    url = '#',
    style = 'primary',
    size = 'md',
    alignment = 'center',
    icon = '',
    target = '_self',
    fullWidth = false,
    borderRadius = 'rounded-lg',
    customClasses = '',
    marginTop = '0',
    marginBottom = '1rem'
  } = data;

  const containerStyle = {
    marginTop,
    marginBottom
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const styleClasses = {
    primary: 'bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white hover:shadow-xl',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-[#29adb2] text-[#29adb2] hover:bg-[#29adb2] hover:text-white bg-transparent',
    ghost: 'text-[#29adb2] hover:bg-[#29adb2] hover:text-white bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const buttonClasses = `
    inline-flex items-center justify-center font-semibold transition-all duration-300
    ${styleClasses[style]}
    ${sizeClasses[size]}
    ${borderRadius}
    ${fullWidth ? 'w-full' : ''}
    ${customClasses}
  `.trim();

  const isExternal = url.startsWith('http') || url.startsWith('//');
  const linkTarget = isExternal ? '_blank' : target;

  return (
    <div 
      className={`button-block ${alignmentClasses[alignment]}`}
      style={containerStyle}
    >
      <a
        href={url}
        target={linkTarget}
        rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
        className={buttonClasses}
      >
        {icon && (
          <span className="mr-2" dangerouslySetInnerHTML={{ __html: icon }} />
        )}
        {text}
      </a>
    </div>
  );
};

export default ButtonBlock;