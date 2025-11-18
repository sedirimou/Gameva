import React from 'react';

export default function PaymentsSection() {
  return (
    <div className="w-full md:py-6" style={{ 
      background: 'linear-gradient(180deg, #ffffff 0%, #e9ecef 100%)',
      paddingTop: '2px',
      paddingBottom: '2px'
    }}>
      <div className="max-w-[1400px] mx-auto px-0 md:px-8">
        <div className="flex justify-center items-center h-[60px]">
          <img 
            src="/payments.svg" 
            alt="Accepted payment methods including Stripe, Visa, Mastercard, Google Pay, Apple Pay, Klarna and more"
            className="object-contain w-full md:w-auto"
            style={{ maxWidth: '900px', height: '60px' }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}