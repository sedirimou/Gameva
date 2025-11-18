/**
 * useModal - Custom hook for managing modal dialogs
 * Provides easy-to-use functions to replace browser confirm/alert dialogs
 */
import { useState, useCallback } from 'react';

export const useModal = () => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    variant: 'default',
    showCancel: true,
    inputValue: '',
    inputPlaceholder: '',
    onConfirm: null,
    onCancel: null
  });

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showModal = useCallback((options) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: options.type || 'confirm',
        title: options.title || '',
        message: options.message || '',
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'default',
        showCancel: options.showCancel !== false,
        inputValue: options.inputValue || '',
        inputPlaceholder: options.inputPlaceholder || '',
        onConfirm: (value) => {
          closeModal();
          resolve(value !== undefined ? value : true);
        },
        onCancel: () => {
          closeModal();
          resolve(false);
        }
      });
    });
  }, [closeModal]);

  // Convenience methods
  const confirm = useCallback((message, title = 'Confirm Action', options = {}) => {
    return showModal({
      type: 'confirm',
      title,
      message,
      variant: options.variant || 'default',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      ...options
    });
  }, [showModal]);

  const confirmDelete = useCallback((message = 'Are you sure you want to delete this item?', title = 'Delete Confirmation') => {
    return showModal({
      type: 'confirm',
      title,
      message,
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  }, [showModal]);

  const alert = useCallback((message, title = 'Information', variant = 'info') => {
    return showModal({
      type: 'alert',
      title,
      message,
      variant,
      showCancel: false,
      confirmText: 'OK'
    });
  }, [showModal]);

  const success = useCallback((message, title = 'Success') => {
    return alert(message, title, 'success');
  }, [alert]);

  const error = useCallback((message, title = 'Error') => {
    return alert(message, title, 'danger');
  }, [alert]);

  const warning = useCallback((message, title = 'Warning') => {
    return alert(message, title, 'warning');
  }, [alert]);

  const prompt = useCallback((message, title = 'Input Required', placeholder = '', defaultValue = '') => {
    return showModal({
      type: 'prompt',
      title,
      message,
      inputValue: defaultValue,
      inputPlaceholder: placeholder,
      confirmText: 'Submit',
      cancelText: 'Cancel'
    });
  }, [showModal]);

  const handleInputChange = useCallback((value) => {
    setModal(prev => ({ ...prev, inputValue: value }));
  }, []);

  return {
    modal,
    closeModal,
    showModal,
    confirm,
    confirmDelete,
    alert,
    success,
    error,
    warning,
    prompt,
    handleInputChange
  };
};