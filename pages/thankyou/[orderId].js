import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import EcommerceLayout from '../../components/layout/EcommerceLayout';
import { useCurrency } from '../../hooks/useCurrency';
import { getProductImageUrl, getProductImageAlt } from '../../lib/imageUtils';
import { cartWishlistManager } from '../../lib/cartWishlistManager';

export default function ThankYouPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { formatPrice } = useCurrency();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    // Fetch order data from database using payment intent ID
    const fetchOrderData = async (currentRetry = 0) => {
      try {
        const response = await fetch(`/api/orders/confirm/${orderId}`);
        if (response.ok) {
          const order = await response.json();
          
          // Enrich order items with fresh product data for images
          if (order.items && order.items.length > 0) {
            const productIds = order.items.map(item => item.id);
            const productsResponse = await fetch('/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: productIds })
            });

            if (productsResponse.ok) {
              const products = await productsResponse.json();
              
              const enrichedItems = order.items.map(orderItem => {
                const freshProduct = products.find(p => p.id === orderItem.id);
                if (freshProduct) {
                  return {
                    ...orderItem,
                    ...freshProduct,
                    platform: freshProduct.platform || orderItem.platform
                  };
                }
                return orderItem;
              });

              order.items = enrichedItems;
            }
          }
          
          setOrderData(order);
        } else {
          // Order not found - retry up to 3 times before redirecting
          if (currentRetry < 3) {
            console.log(`Order not found, orderId: ${orderId}. Retry ${currentRetry + 1}/3 in 2 seconds...`);
            setTimeout(() => {
              fetchOrderData(currentRetry + 1);
            }, 2000);
            return;
          } else {
            console.log('Order not found after 3 retries, redirecting to home');
            router.push('/');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        console.error('OrderId that failed:', orderId);
        
        if (currentRetry < 2) {
          console.log(`Retrying due to error. Retry ${currentRetry + 1}/2 in 3 seconds...`);
          setTimeout(() => {
            fetchOrderData(currentRetry + 1);
          }, 3000);
          return;
        } else {
          console.log('Failed to fetch order after retries, redirecting to home');
          router.push('/');
          return;
        }
      }
      setLoading(false);
    };

    fetchOrderData(0);
  }, [orderId, router]);

  useEffect(() => {
    // Clear cart after successful payment confirmation
    if (orderData) {
      cartWishlistManager.clearCart();
    }
  }, [orderData]);



  if (loading) {
    return (
      <EcommerceLayout title="Order Confirmation" description="Your order confirmation on Gamava">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
        </div>
      </EcommerceLayout>
    );
  }

  if (!orderData) {
    return (
      <EcommerceLayout title="Order Not Found" description="Order not found on Gamava">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-white/80 mb-8">The order you're looking for could not be found.</p>
          <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Return Home
          </Link>
        </div>
      </EcommerceLayout>
    );
  }

  return (
    <EcommerceLayout 
      title="Order Confirmation" 
      description="Your order has been confirmed on Gamava"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-white">Order Confirmed!</h1>
          <p className="text-xl text-white/80 mb-4">Thank you for your purchase</p>
          <p className="text-white/70">Order ID: <span className="font-semibold text-[#29adb2]">{orderData.order_id}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Details Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-8 text-white">Order Details</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-white/80 font-medium">Order Number:</span>
                <span className="font-semibold text-white">{orderData.order_id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/80 font-medium">Order Date:</span>
                <span className="font-semibold text-white">{new Date(orderData.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/80 font-medium">Customer:</span>
                <span className="font-semibold text-white">{orderData.customer_name || 'Guest Customer'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/80 font-medium">Email:</span>
                <span className="font-semibold text-white text-sm">{orderData.customer_email || 'Not provided'}</span>
              </div>
            </div>

            <div className="border-t border-white/20 mt-8 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total Amount:</span>
                <span className="text-xl font-bold text-[#29adb2]">{formatPrice(parseFloat(orderData.sellingPrice || orderData.total || 0))}</span>
              </div>
            </div>
          </div>

          {/* Items Purchased Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-8 text-white">Items Purchased</h2>
            
            <div className="space-y-4">
              {orderData.items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-16 h-16 bg-[#153e8f] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={getProductImageUrl(item)} 
                      alt={getProductImageAlt(item)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-game.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-white text-sm mb-1 truncate">{item.name}</h5>
                    <p className="text-white/60 text-xs mb-2">{item.platform}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/60">Qty: {item.quantity}</span>
                      <div className="flex items-center gap-2">
                        {/* Show original price with strikethrough if sale price exists */}
                        {item.sale_price && (
                          <span className="text-xs text-white/60 line-through">
                            {formatPrice((parseFloat(item.price || 0) * (item.quantity || 1)))}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-[#29adb2]">{formatPrice((parseFloat(item.sale_price || item.sellingPrice || item.price || item.finalPrice || 0) * (item.quantity || 1)))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-12">
          <h2 className="text-2xl font-bold mb-8 text-white text-center">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#29adb2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2">Check Your Email</h3>
              <p className="text-white/80 text-sm">
                We've sent your game keys and receipt to<br />
                {orderData.customer_email || 'your email address'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#99b476] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2">Download & Play</h3>
              <p className="text-white/80 text-sm">
                Follow the instructions in your email to activate your games
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-center text-lg"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => {
              // Create a simple invoice format and trigger download
              const invoiceContent = `
                GAMAVA - INVOICE
                ================
                
                Order ID: ${orderData.order_id}
                Order Date: ${new Date(orderData.created_at).toLocaleDateString()}
                Customer: ${orderData.customer_name || 'Guest Customer'}
                Email: ${orderData.customer_email || 'Not provided'}
                
                ITEMS:
                ${orderData.items.map(item => 
                  `${item.name} (${item.platform}) - Qty: ${item.quantity} - €${(parseFloat(item.price || item.finalPrice || 0) * (item.quantity || 1)).toFixed(2)}`
                ).join('\n')}
                
                TOTAL: €${parseFloat(orderData.total || 0).toFixed(2)}
                
                Thank you for your purchase!
              `;
              
              const blob = new Blob([invoiceContent], { type: 'text/plain' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `invoice-${orderData.order_id}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
            className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/15 transition-colors text-center text-lg"
          >
            Download Invoice
          </button>
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/15 transition-colors text-center text-lg"
          >
            Continue to your account
          </Link>
        </div>
      </div>
    </EcommerceLayout>
  );
}