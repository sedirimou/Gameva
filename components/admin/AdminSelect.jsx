/**
 * Admin Select Component
 * Standardized select fields for admin panel with proper black text visibility
 */

const AdminSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option...', 
  className = '', 
  label,
  required = false,
  disabled = false,
  ...props 
}) => {
  const selectClasses = `
    w-full px-3 py-2 
    bg-white border border-gray-300 rounded-md 
    text-gray-900
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`${selectClasses} ${className}`}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="text-gray-900"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AdminSelect;