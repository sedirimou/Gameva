import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export default function CheckoutForm({ customerInfo, items, total, paymentIntentId, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    console.log('Payment submission started. OrderId:', orderId);
    console.log('PaymentIntentId:', paymentIntentId);

    if (!orderId) {
      setMessage("Order ID is missing. Please refresh the page and try again.");
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Submit the form and get the PaymentElement
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error('Elements submit error:', submitError);
        setMessage(submitError.message);
        setIsLoading(false);
        return;
      }

      const returnUrl = `${window.location.origin}/thankyou/${orderId}`;
      console.log('Attempting payment confirmation with return URL:', returnUrl);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
              email: customerInfo.email,
              address: {
                line1: customerInfo.address,
                city: customerInfo.city,
                country: customerInfo.country,
                postal_code: customerInfo.postalCode,
              },
            },
          },
        },
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        console.error('Error type:', error.type);
        console.error('Error code:', error.code);
        
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage("An unexpected error occurred: " + error.message);
        }
      } else {
        console.log('Payment succeeded! Should redirect to:', `/thankyou/${orderId}`);
        setMessage('Payment successful! Redirecting...');
        
        // Payment succeeded - Stripe will handle the redirect automatically
        // with the return_url we provided in confirmParams
      }
    } catch (submitError) {
      console.error('Payment submission error:', submitError);
      setMessage("Payment failed. Please try again.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "accordion",
    fields: {
      billingDetails: 'auto'
    },
    wallets: {
      applePay: 'auto',
      googlePay: 'auto'
    },
    terms: {
      bancontact: 'auto',
      card: 'auto',
      ideal: 'auto',
      sepaDebit: 'auto'
    }
  };

  return (
    <div>
      {/* Regular Payment Form */}
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement 
          id="payment-element" 
          options={paymentElementOptions}
          onReady={() => setPaymentElementReady(true)}
          onChange={(event) => {
            if (event.error) {
              setMessage(event.error.message);
            } else {
              setMessage('');
            }
          }}
          onLoadError={(error) => {
            console.warn('Payment element load error:', error);
            setMessage('Payment options are loading. Please wait a moment.');
          }}
        />
        <button 
          disabled={isLoading || !stripe || !elements || !paymentElementReady} 
          id="submit"
          className="w-full text-white font-bold py-4 px-6 rounded-lg mt-6 transition-colors disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
        >
          <span id="button-text">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : !paymentElementReady ? (
              'Loading payment options...'
            ) : (
              `Pay €${total.toFixed(2)}`
            )}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && <div id="payment-message" className="text-red-500 mt-4">{message}</div>}
      </form>
    </div>
  );
}