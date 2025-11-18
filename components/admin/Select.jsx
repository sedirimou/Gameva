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
        bg-white 
        border border-gray-300 
        rounded-lg 
        text-black 
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

Select.displayName = 'AdminSelect';

export default Select;