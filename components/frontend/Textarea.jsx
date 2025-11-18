import React from 'react';

const Textarea = React.forwardRef(({ 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
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
        resize-vertical
        ${className}
      `}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;