import { useEffect } from 'react';
import { useRouter } from 'next/router';
import EcommerceLayout from '../components/layout/EcommerceLayout';

export default function ThankYouRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's order data in localStorage
    const savedOrderData = localStorage.getItem('lastOrder');
    if (savedOrderData) {
      try {
        const parsedOrderData = JSON.parse(savedOrderData);
        
        // Redirect to the new dynamic thank you page structure
        if (parsedOrderData.orderId) {
          router.replace(`/thankyou/${parsedOrderData.orderId}`);
          return;
        }
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
    
    // If no order data or invalid data, redirect to home
    router.replace('/');
  }, [router]);

  return (
    <EcommerceLayout title="Redirecting..." description="Redirecting to order confirmation">
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
      </div>
    </EcommerceLayout>
  );
}