import React from 'react';

const Select = React.forwardRef(({ 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  children,
  ...props 
}, ref) => {
  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-3 py-2 
        bg-white/10 
        border border-white/20 
        rounded-lg 
        text-white 
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        focus:border-transparent
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;