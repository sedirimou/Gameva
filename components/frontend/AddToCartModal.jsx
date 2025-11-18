import React, { useEffect } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useRouter } from 'next/router';

const AddToCartModal = ({ isOpen, onClose, cartCount, productName }) => {
  const router = useRouter();

  // Auto-close modal after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Navigate to cart page
  const handleViewCart = () => {
    onClose();
    router.push('/cart');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-80 h-80 mx-4 text-center relative flex flex-col justify-center items-center">
        {/* Blue background section with content */}
        <div className="bg-[#153e8f] rounded-3xl p-8 pt-16 w-full shadow-2xl transform transition-all duration-300 relative">
          {/* Shopping cart icon with checkmark - Half overlapping the blue background */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-25 rounded-full backdrop-blur-sm">
              <ShoppingCart className="w-10 h-10 text-white" />
              {/* Checkmark overlay */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-4 mt-4">
            Added to cart
          </h2>

          {/* Cart count message */}
          <p className="text-white text-opacity-90 mb-6 text-lg">
            You have {cartCount || 1} item{(cartCount || 1) !== 1 ? 's' : ''} in your cart
          </p>

          {/* Action buttons */}
          <div className="space-y-4 w-full">
            <button
              onClick={onClose}
              className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
            >
              Continue shopping
            </button>
            
            <button
              onClick={handleViewCart}
              className="w-full border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              View cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;