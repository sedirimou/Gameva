import Head from 'next/head';
import MainLayout from '../components/layout/MainLayout';

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us - Gamava</title>
        <meta name="description" content="Learn about Gamava - Your trusted destination for digital gaming products, software, and entertainment." />
        <meta name="keywords" content="about gamava, gaming platform, digital games, about us" />
      </Head>

      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#000d6e] to-[#153e8f] py-16">
          <div className="max-w-[1200px] mx-auto px-4">
            
            {/* Page Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                About Gamava
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Your trusted destination for digital gaming products, software, and entertainment solutions.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              
              {/* Our Story */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                  Our Story
                </h2>
                <p className="text-white/90 mb-4 leading-relaxed">
                  Founded with a passion for gaming and technology, Gamava has emerged as a leading platform 
                  for digital gaming products. We specialize in providing instant access to the latest games, 
                  software, and digital entertainment across all major platforms.
                </p>
                <p className="text-white/90 leading-relaxed">
                  Our journey began with a simple vision: to make digital gaming accessible, affordable, 
                  and instant for gamers worldwide. Today, we serve thousands of satisfied customers with 
                  our extensive catalog of premium gaming products.
                </p>
              </div>

              {/* Our Mission */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                  Our Mission
                </h2>
                <p className="text-white/90 mb-4 leading-relaxed">
                  To revolutionize the digital gaming marketplace by providing instant, secure, and 
                  affordable access to the world's best gaming content. We believe every gamer deserves 
                  access to premium experiences without barriers.
                </p>
                <p className="text-white/90 leading-relaxed">
                  We're committed to building lasting relationships with our customers through exceptional 
                  service, competitive pricing, and a seamless shopping experience that puts gamers first.
                </p>
              </div>

            </div>

            {/* What We Offer */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                What We Offer
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Gaming Products */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">PC Games</h3>
                  <p className="text-white/80 text-sm">
                    Extensive collection of PC games across all genres and platforms
                  </p>
                </div>

                {/* Software */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Software</h3>
                  <p className="text-white/80 text-sm">
                    Professional software and applications for productivity and creativity
                  </p>
                </div>

                {/* Gift Cards */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Gift Cards</h3>
                  <p className="text-white/80 text-sm">
                    Digital gift cards for all major gaming platforms and stores
                  </p>
                </div>

                {/* Subscriptions */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Subscriptions</h3>
                  <p className="text-white/80 text-sm">
                    Gaming subscriptions and premium memberships at competitive prices
                  </p>
                </div>

              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                Why Choose Gamava?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Instant Delivery</h3>
                    <p className="text-white/80">
                      Get your digital products instantly after purchase with our automated delivery system.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Secure Transactions</h3>
                    <p className="text-white/80">
                      All transactions are protected with industry-standard encryption and security measures.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
                    <p className="text-white/80">
                      Our dedicated support team is available around the clock to assist you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1s1 .45 1 1v2h6V2c0-.55.45-1 1-1s1 .45 1 1v2h3c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h3zm0 4h10v2H7V8zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Best Prices</h3>
                    <p className="text-white/80">
                      Competitive pricing with regular discounts and special offers for our customers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Quality Products</h3>
                    <p className="text-white/80">
                      All products are genuine and sourced from authorized distributors and publishers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Global Reach</h3>
                    <p className="text-white/80">
                      Serving customers worldwide with region-specific products and localized support.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Contact CTA */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Ready to Start Gaming?
                </h2>
                <p className="text-white/90 mb-6">
                  Join thousands of satisfied customers and discover your next favorite game today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/category/all-products" 
                    className="bg-white text-[#153e8f] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Browse Products
                  </a>
                  <a 
                    href="/contact-us" 
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#153e8f] transition-colors"
                  >
                    Contact Us
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