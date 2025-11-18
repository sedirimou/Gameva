import Head from 'next/head';
import MainLayout from '../components/layout/MainLayout';

export default function ShippingInfo() {
  return (
    <>
      <Head>
        <title>Shipping & Delivery Information - Gamava</title>
        <meta name="description" content="Learn about Gamava's digital product delivery, shipping policies, and instant delivery system for games, software, and digital products." />
        <meta name="keywords" content="gamava shipping, digital delivery, instant delivery, product delivery, gaming products" />
      </Head>

      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#000d6e] to-[#153e8f] py-16">
          <div className="max-w-[1200px] mx-auto px-4">
            
            {/* Page Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Shipping & Delivery Information
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Everything you need to know about how we deliver your digital products instantly and securely.
              </p>
            </div>

            {/* Instant Delivery Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                Instant Digital Delivery
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <p className="text-white/90">Complete your purchase using any of our secure payment methods</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <p className="text-white/90">Receive instant email confirmation with your order details</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <p className="text-white/90">Your product key and activation instructions are delivered immediately</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">4</span>
                      </div>
                      <p className="text-white/90">Access your library anytime through your account dashboard</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Delivery Time</h3>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/80">Digital Games & Software</span>
                      <span className="text-green-400 font-semibold">Instant</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/80">Gift Cards</span>
                      <span className="text-green-400 font-semibold">Instant</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/80">Subscriptions</span>
                      <span className="text-green-400 font-semibold">Instant</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Pre-orders</span>
                      <span className="text-yellow-400 font-semibold">Release Date</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Email Delivery */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                  Email Delivery
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Product keys delivered to your registered email address</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Detailed activation instructions included</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Order confirmation and receipt attached</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Backup delivery to account dashboard</p>
                  </div>
                </div>
              </div>

              {/* Account Dashboard */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                  Account Dashboard
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Access your complete purchase history</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Re-download product keys anytime</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Track order status and delivery confirmation</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-white/90">Organize your digital library</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Regional Availability */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                Regional Availability
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Global Products</h3>
                  <p className="text-white/80 mb-4">Available worldwide with no regional restrictions</p>
                  <div className="flex items-center text-green-400">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="font-semibold">~86,000 products</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Region-Specific</h3>
                  <p className="text-white/80 mb-4">Products with regional activation requirements</p>
                  <div className="space-y-2 text-white/70 text-sm">
                    <div>• Europe: ~73,000 products</div>
                    <div>• North America: ~69,000 products</div>
                    <div>• Asia: ~60,000 products</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Language Support</h3>
                  <p className="text-white/80 mb-4">Multi-language activation instructions</p>
                  <div className="space-y-2 text-white/70 text-sm">
                    <div>• English (Primary)</div>
                    <div>• German, French, Spanish</div>
                    <div>• Additional languages available</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                Delivery Troubleshooting
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Common Issues</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Email Not Received</h4>
                      <p className="text-white/80 text-sm">Check your spam/junk folder and whitelist support@gamava.com</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Invalid Product Key</h4>
                      <p className="text-white/80 text-sm">Ensure correct platform and check for typing errors</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Region Restrictions</h4>
                      <p className="text-white/80 text-sm">Verify product compatibility with your region before purchase</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Quick Solutions</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Step 1: Check Account</h4>
                      <p className="text-white/80 text-sm">Log into your dashboard and check "My Orders" section</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Step 2: Verify Email</h4>
                      <p className="text-white/80 text-sm">Check all email folders including spam and promotions</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Step 3: Contact Support</h4>
                      <p className="text-white/80 text-sm">If issues persist, contact our 24/7 support team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support CTA */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Need Help with Your Order?
                </h2>
                <p className="text-white/90 mb-6">
                  Our support team is available 24/7 to assist with any delivery issues or questions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/contact-us" 
                    className="bg-white text-[#153e8f] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Contact Support
                  </a>
                  <a 
                    href="/user/orders" 
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#153e8f] transition-colors"
                  >
                    Track My Orders
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </MainLayout>
    </>
  );
}