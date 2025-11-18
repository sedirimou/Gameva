/**
 * Admin Input Component
 * Standardized input fields for admin panel with proper black text visibility
 */

const AdminInput = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  label,
  required = false,
  disabled = false,
  min,
  max,
  rows = 3,
  ...props 
}) => {
  const baseInputClasses = `
    w-full px-3 py-2 
    bg-white border border-gray-300 rounded-md 
    text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const textareaClasses = `
    w-full px-3 py-2 
    bg-white border border-gray-300 rounded-md 
    text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    resize-vertical transition-colors duration-200
  `;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${textareaClasses} ${className}`}
          disabled={disabled}
          rows={rows}
          {...props}
        />
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseInputClasses} ${className}`}
        disabled={disabled}
        min={min}
        max={max}
        {...props}
      />
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
    </div>
  );
};

export default AdminInput;