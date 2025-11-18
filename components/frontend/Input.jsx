import React from 'react';

const Input = React.forwardRef(({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-3 py-2 
        bg-white/10 
        border border-white/20 
        rounded-lg 
        text-white 
        placeholder-white/70
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        focus:border-transparent
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;