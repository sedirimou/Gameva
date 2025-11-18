/**
 * ModalContext - Global modal management system
 * Provides modal functions across all components via React Context
 */
import React, { createContext, useContext } from 'react';
import CustomModal from '../ui/CustomModal';
import { useModal } from '../../hooks/useModal';

const ModalContext = createContext();

export const useGlobalModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useGlobalModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const modalFunctions = useModal();

  return (
    <ModalContext.Provider value={modalFunctions}>
      {children}
      
      {/* Global Modal Component */}
      <CustomModal
        isOpen={modalFunctions.modal.isOpen}
        onClose={modalFunctions.modal.onCancel}
        onConfirm={modalFunctions.modal.onConfirm}
        type={modalFunctions.modal.type}
        title={modalFunctions.modal.title}
        message={modalFunctions.modal.message}
        confirmText={modalFunctions.modal.confirmText}
        cancelText={modalFunctions.modal.cancelText}
        variant={modalFunctions.modal.variant}
        showCancel={modalFunctions.modal.showCancel}
        inputValue={modalFunctions.modal.inputValue}
        onInputChange={modalFunctions.handleInputChange}
        inputPlaceholder={modalFunctions.modal.inputPlaceholder}
      />
    </ModalContext.Provider>
  );
};