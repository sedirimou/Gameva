import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Head from 'next/head';
import EcommerceLayout from '../components/layout/EcommerceLayout';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { useCurrency } from '../hooks/useCurrency';
import { SSRSafeStorage } from '../lib/ssrSafeStorage';
import { getProductImageUrl } from '../lib/imageUtils';



// Initialize Stripe with publishable key - with error handling
const getStripePublishableKey = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
              process.env.VITE_STRIPE_PUBLIC_KEY;
  
  if (!key) {
    console.error('Stripe publishable key is missing');
    return null;
  }
  
  return key;
};

// Initialize Stripe promise once with error handling
let stripePromise = null;

if (typeof window !== 'undefined' && !stripePromise) {
  const publishableKey = getStripePublishableKey();
  
  // Only log in non-test environments
  const isTestEnv = process.env.NODE_ENV === 'test' || typeof jest !== 'undefined';
  if (!isTestEnv) {
    console.log('Initializing Stripe with key:', publishableKey?.substring(0, 14) + '...');
  }
  
  if (publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { formatPrice, loading: currencyLoading } = useCurrency();
  const [checkoutData, setCheckoutData] = useState(null);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'NL' // Default to Netherlands for iDEAL support
  });
  const [couponExpanded, setCouponExpanded] = useState(false);

  useEffect(() => {
    const initializeCheckout = async () => {
      console.log('🛒 Initializing checkout...');
      
      // First, check if we have checkout data from cart page
      const savedCheckoutData = localStorage.getItem('checkoutData');
      console.log('💾 Saved checkout data:', savedCheckoutData ? 'Found' : 'Not found');
      
      if (!savedCheckoutData) {
        // If no checkout data, try to load from cart directly
        console.log('🔄 No checkout data, checking cart...');
        const savedCart = localStorage.getItem('cart');
        
        if (!savedCart) {
          console.log('❌ No cart data found, redirecting to cart page');
          router.push('/cart');
          return;
        }
        
        try {
          const cartItems = JSON.parse(savedCart);
          console.log('🛍️ Found cart items:', cartItems.length);
          
          if (!cartItems.length) {
            console.log('📦 Cart is empty, redirecting to cart page');
            router.push('/cart');
            return;
          }
          
          // Create checkout data from cart
          console.log('🔄 Creating checkout data from cart...');
          const checkoutDataFromCart = {
            items: cartItems,
            subtotal: 0, // Will be calculated after fetching products
            tax: 0,
            total: 0
          };
          
          // Save to localStorage for consistency
          localStorage.setItem('checkoutData', JSON.stringify(checkoutDataFromCart));
          setCheckoutData(checkoutDataFromCart);
          
          // Continue with product enrichment
          const productIds = cartItems.map(item => 
            typeof item === 'object' ? item.id : item
          ).filter(Boolean);
          
          if (productIds.length > 0) {
            await enrichProducts(productIds, cartItems);
          }
        } catch (error) {
          console.error('❌ Error processing cart data:', error);
          router.push('/cart');
          return;
        }
      } else {
        // Use existing checkout data
        try {
          const parsedData = JSON.parse(savedCheckoutData);
          console.log('✅ Using saved checkout data:', parsedData);
          setCheckoutData(parsedData);
          
          if (parsedData.items && parsedData.items.length > 0) {
            const productIds = parsedData.items.map(item => item.id);
            await enrichProducts(productIds, parsedData.items);
          } else {
            console.log('❌ No items in checkout data, redirecting to cart');
            router.push('/cart');
            return;
          }
        } catch (error) {
          console.error('❌ Error parsing checkout data:', error);
          router.push('/cart');
          return;
        }
      }

      setLoading(false);
    };

    const enrichProducts = async (productIds, items) => {
      try {
        console.log('🔄 Enriching products...', productIds);
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: productIds })
        });

        if (response.ok) {
          const products = await response.json();
          console.log('✅ Got fresh product data:', products.length, 'products');
          
          const enriched = items.map(cartItem => {
            const itemId = typeof cartItem === 'object' ? cartItem.id : cartItem;
            const freshProduct = products.find(p => p.id === itemId);
            if (freshProduct) {
              return {
                ...freshProduct,
                quantity: cartItem.quantity || 1
              };
            }
            return cartItem;
          });

          setEnrichedItems(enriched);

          // Calculate total from fresh product data in EUR (base price)
          const calculatedTotal = enriched.reduce((sum, item) => {
            const itemPrice = item.sale_price || item.final_price || item.finalPrice || item.price || 0;
            const itemQuantity = item.quantity || 1;
            console.log(`💰 Item: ${item.name}, Price: €${itemPrice}, Quantity: ${itemQuantity}`);
            return sum + (itemPrice * itemQuantity);
          }, 0);
          
          console.log('💵 Total calculated:', calculatedTotal);
          setTotal(calculatedTotal);
        } else {
          console.error('❌ Failed to fetch products:', response.status);
        }
      } catch (error) {
        console.error('❌ Error enriching products:', error);
      }
    };

    initializeCheckout();
  }, [router]);

  const updateCustomerInfo = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const createPaymentIntent = async () => {
    console.log('Creating payment intent...', { customerInfo, total, enrichedItems });
    
    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
      alert('Please fill in all required fields (Email, First Name, Last Name)');
      return;
    }

    if (total <= 0 || enrichedItems.length === 0) {
      alert('Cart is empty or invalid total amount');
      return;
    }

    // Force EUR currency only - no other currencies supported
    const currentCurrency = 'eur';
    
    // The total is already in the selected currency from currency manager
    // DO NOT convert again - this was causing double conversion
    const finalTotal = total;
    
    console.log('Payment intent details:', {
      currency: currentCurrency,
      total: finalTotal,
      items: enrichedItems.length
    });

    try {
      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          currency: currentCurrency,
          items: enrichedItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          customerInfo: customerInfo
        })
      });

      if (paymentResponse.ok) {
        const { clientSecret, paymentIntentId, orderId } = await paymentResponse.json();
        console.log('Payment intent created successfully:', { clientSecret, paymentIntentId, orderId });
        setClientSecret(clientSecret);
        setPaymentIntentId(paymentIntentId);
        setOrderId(orderId);
      } else {
        const errorData = await paymentResponse.json();
        console.error('Payment intent creation failed:', errorData);
        alert('Failed to create payment intent. Please try again.');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <EcommerceLayout title="Checkout - Gamava" description="Complete your purchase on Gamava">
        <div className="container mx-auto px-4 max-w-6xl pt-20">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
          </div>
        </div>
      </EcommerceLayout>
    );
  }

  // Fresh Stripe form with official appearance API
  
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#153e90',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
      fontSizeBase: '14px',
      fontSizeSm: '13px'
    },
    rules: {
      '.Tab': {
        backgroundColor: '#f6f8fa',
        border: '1px solid #e3e8ee',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      '.Tab--selected': {
        backgroundColor: '#ffffff',
        borderColor: '#153e90',
        boxShadow: '0 1px 3px rgba(21, 62, 144, 0.1)'
      },
      '.Input': {
        backgroundColor: '#ffffff',
        border: '1px solid #e3e8ee',
        borderRadius: '6px',
        padding: '12px',
        fontSize: '14px'
      },
      '.Input--focus': {
        borderColor: '#153e90',
        boxShadow: '0 0 0 2px rgba(21, 62, 144, 0.1)'
      }
    }
  };

  // Force EUR currency only
  const currentCurrency = 'eur';
  
  const stripeOptions = {
    clientSecret,
    appearance,
  };
  
  // Debug logging
  console.log('Stripe configuration:', {
    hasClientSecret: !!clientSecret,
    clientSecretPrefix: clientSecret?.substring(0, 10),
    hasStripePromise: !!stripePromise
  });

  return (
    <EcommerceLayout title="Checkout - Gamava" description="Complete your purchase on Gamava">

      <div className="container mx-auto px-4 max-w-6xl pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
          <p className="text-white/70">Secure payment powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Payment Section - Left Side */}
          <div className="lg:col-span-8">
            <div className="rounded-lg p-6 bg-[#1f4694]">
              <h2 className="text-xl font-bold mb-6 text-white">Payment Details</h2>
              
              {/* Customer Information Form */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">First Name</label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => updateCustomerInfo('firstName', e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Last Name</label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => updateCustomerInfo('lastName', e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-white">Email Address</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => updateCustomerInfo('email', e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-white">Address</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => updateCustomerInfo('address', e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                    placeholder="Enter address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">City</label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) => updateCustomerInfo('city', e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Postal Code</label>
                    <input
                      type="text"
                      value={customerInfo.postalCode}
                      onChange={(e) => updateCustomerInfo('postalCode', e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-white">Country</label>
                  <select
                    value={customerInfo.country}
                    onChange={(e) => updateCustomerInfo('country', e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#153e90] focus:outline-none"
                  >
                    <option value="NL">Netherlands</option>
                    <option value="DE">Germany</option>
                    <option value="BE">Belgium</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="AT">Austria</option>
                    <option value="PL">Poland</option>
                  </select>
                </div>
              </div>

              {/* Continue to Payment Button or Stripe Payment Elements */}
              {!clientSecret ? (
                <div className="mt-6">
                  <button 
                    onClick={createPaymentIntent}
                    disabled={!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName || total <= 0}
                    className="w-full py-4 px-6 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
                    }}
                  >
                    {!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName 
                      ? 'Please fill required fields' 
                      : total <= 0 
                        ? 'Cart is empty' 
                        : 'Continue to Payment'
                    }
                  </button>
                  {(!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) && (
                    <p className="text-red-400 text-sm mt-2 text-center">
                      Please fill in Email, First Name, and Last Name to continue
                    </p>
                  )}
                </div>
              ) : stripePromise ? (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <CheckoutForm 
                    customerInfo={customerInfo}
                    items={enrichedItems}
                    total={total} // No tax
                    paymentIntentId={paymentIntentId}
                    orderId={orderId}
                  />
                </Elements>
              ) : (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-center">
                    Payment system is not available. Please check your Stripe configuration.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Right Side Sticky */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <div className="bg-white/5 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-6 text-white">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {enrichedItems.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-[#153e8f] rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={getProductImageUrl(item)} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder-game.svg'; }}
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm text-white">{item.name}</h5>
                        <p className="text-white/60 text-xs">{item.platform}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-white/60">Qty: {item.quantity}</span>
                          <div className="flex items-center gap-2">
                            {/* Show original price with strikethrough if sale price exists */}
                            {item.sale_price && (
                              <span className="text-xs text-white/60 line-through font-normal">
                                {currencyLoading ? (
                                  <div className="inline-flex items-center">
                                    <div className="animate-spin rounded-full h-1 w-1 border-b-2 border-white"></div>
                                  </div>
                                ) : (
                                  formatPrice(item.price * item.quantity)
                                )}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-white">
                              {currencyLoading ? (
                                <div className="inline-flex items-center">
                                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                                </div>
                              ) : (
                                formatPrice((item.sale_price 
                                  ? item.sale_price 
                                  : item.price) * item.quantity)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-4">
                  {/* Coupon Section */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <button 
                      onClick={() => setCouponExpanded(!couponExpanded)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-sm font-medium text-white">Have a coupon?</h3>
                      <svg 
                        className={`w-4 h-4 text-white transition-transform ${couponExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {couponExpanded && (
                      <div className="flex gap-2 mt-3">
                        <input 
                          type="text" 
                          placeholder="Enter coupon code"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                        />
                        <button 
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white text-sm hover:bg-white/20 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Subtotal:</span>
                      <span className="text-white">
                        {currencyLoading ? (
                          <div className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span className="ml-2 text-sm">Loading...</span>
                          </div>
                        ) : (
                          formatPrice(total)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Tax (VAT):</span>
                      <span className="text-white">{formatPrice(0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                      <span className="text-white">Total:</span>
                      <span className="text-white">
                        {currencyLoading ? (
                          <div className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="ml-2">Loading...</span>
                          </div>
                        ) : (
                          formatPrice(total)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  );
}

