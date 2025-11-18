/**
 * CustomModal - Professional modal component to replace browser dialogs
 * Supports confirm, alert, prompt, and custom content modals
 */
import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faExclamationTriangle, 
  faCheckCircle, 
  faInfoCircle,
  faQuestionCircle,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

const CustomModal = ({
  isOpen,
  onClose,
  onConfirm,
  type = 'confirm', // 'confirm', 'alert', 'prompt', 'custom'
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default', // 'default', 'danger', 'success', 'warning', 'info'
  children,
  showCancel = true,
  inputValue = '',
  onInputChange,
  inputPlaceholder = ''
}) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus input for prompt modals
  useEffect(() => {
    if (isOpen && type === 'prompt' && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen, type]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return faExclamationTriangle;
      case 'success':
        return faCheckCircle;
      case 'warning':
        return faExclamationTriangle;
      case 'info':
        return faInfoCircle;
      default:
        return type === 'confirm' ? faQuestionCircle : faInfoCircle;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getButtonColors = () => {
    switch (variant) {
      case 'danger':
        return {
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
          cancel: 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        };
      case 'success':
        return {
          confirm: 'bg-green-600 hover:bg-green-700 text-white',
          cancel: 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        };
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancel: 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        };
      default:
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancel: 'bg-gray-300 hover:bg-gray-400 text-gray-800'
        };
    }
  };

  const buttonColors = getButtonColors();

  const handleConfirm = () => {
    if (onConfirm) {
      if (type === 'prompt') {
        onConfirm(inputValue);
      } else {
        onConfirm();
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon 
              icon={getIcon()} 
              className={`text-xl ${getIconColor()}`}
            />
            <h3 className="text-xl font-semibold text-gray-900">
              {title || (type === 'confirm' ? 'Confirm Action' : 'Information')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children ? (
            children
          ) : (
            <>
              {message && (
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                  {message}
                </p>
              )}
              
              {type === 'prompt' && (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => onInputChange && onInputChange(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {showCancel && (
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${buttonColors.cancel}`}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${buttonColors.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;