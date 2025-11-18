import { useState } from 'react';
import Head from 'next/head';
import MainLayout from '../components/layout/MainLayout';

export default function FAQs() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      category: "General",
      questions: [
        {
          question: "What is Gamava?",
          answer: "Gamava is a digital marketplace specializing in gaming products, software, gift cards, and subscriptions. We provide instant delivery of digital products to customers worldwide."
        },
        {
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button in the top right corner of our website. You can register using your email address or sign up instantly with Steam, Discord, or Google accounts."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we use industry-standard encryption and security measures to protect your personal information. All transactions are processed through secure payment gateways."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, PayPal, and various digital payment methods through our secure Stripe payment processor."
        }
      ]
    },
    {
      category: "Orders & Delivery",
      questions: [
        {
          question: "How quickly will I receive my purchase?",
          answer: "Most digital products are delivered instantly after payment confirmation. You'll receive your product key or download link via email within seconds of completing your purchase."
        },
        {
          question: "What if I don't receive my product?",
          answer: "If you don't receive your product within 10 minutes of purchase, please check your spam folder first. If it's still not there, contact our support team and we'll resolve the issue immediately."
        },
        {
          question: "Can I track my order?",
          answer: "Yes, you can track all your orders in your account dashboard under 'My Orders'. You'll also receive email confirmations for each purchase."
        },
        {
          question: "What format will my product key be in?",
          answer: "Product keys are delivered as alphanumeric codes that you can copy and paste into the respective platform (Steam, Epic Games, etc.). We also provide activation instructions for each product."
        }
      ]
    },
    {
      category: "Product Information",
      questions: [
        {
          question: "Are all products genuine?",
          answer: "Yes, all our products are sourced from authorized distributors and publishers. We guarantee the authenticity of every product key and digital download."
        },
        {
          question: "Can I use products from any region?",
          answer: "Product regional restrictions vary by publisher. We clearly mark region-specific products and recommend checking compatibility before purchase."
        },
        {
          question: "What platforms do you support?",
          answer: "We support all major gaming platforms including Steam, Epic Games Store, Origin, Uplay, Xbox, PlayStation, Nintendo Switch, and many more."
        },
        {
          question: "Do you sell pre-order games?",
          answer: "Yes, we offer pre-orders for upcoming games. Pre-order keys are delivered on or before the official release date."
        }
      ]
    },
    {
      category: "Account & Support",
      questions: [
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within a few minutes."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email address in your account settings. You'll need to verify the new email address before the change takes effect."
        },
        {
          question: "How do I contact customer support?",
          answer: "You can reach our support team through the Contact Us page, live chat, or email us at support@gamava.com. We're available 24/7 to assist you."
        },
        {
          question: "What is your refund policy?",
          answer: "We offer refunds for unused digital products within 14 days of purchase, provided the product key hasn't been activated. Physical products can be returned according to our return policy."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          question: "My product key isn't working. What should I do?",
          answer: "First, ensure you're entering the key correctly with no extra spaces. If the key still doesn't work, contact our support team with your order details for immediate assistance."
        },
        {
          question: "Can I download my purchase multiple times?",
          answer: "Yes, you can access your purchase history and download links anytime from your account dashboard. Digital products remain available for re-download."
        },
        {
          question: "What if I accidentally purchased the wrong product?",
          answer: "Contact our support team immediately if you've purchased the wrong product. We may be able to exchange it for the correct one if the key hasn't been activated."
        },
        {
          question: "Do you offer technical support for games?",
          answer: "We provide support for purchase and activation issues. For game-specific technical problems, please contact the game's publisher or developer support team."
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Frequently Asked Questions - Gamava</title>
        <meta name="description" content="Find answers to common questions about Gamava's products, services, and policies. Get help with orders, payments, and technical issues." />
        <meta name="keywords" content="gamava faq, gaming questions, digital products help, customer support" />
      </Head>

      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#000d6e] to-[#153e8f] py-16">
          <div className="max-w-[1200px] mx-auto px-4">
            
            {/* Page Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Find answers to common questions about our products, services, and policies.
              </p>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-12">
              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  
                  <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                    <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
                    {category.category}
                  </h2>
                  
                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 100 + faqIndex;
                      const isOpen = openFAQ === globalIndex;
                      
                      return (
                        <div 
                          key={faqIndex} 
                          className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFAQ(globalIndex)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                          >
                            <h3 className="text-lg font-semibold text-white pr-4">
                              {faq.question}
                            </h3>
                            <svg
                              className={`w-5 h-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <div className="pt-4 border-t border-white/10">
                                <p className="text-white/90 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Support Section */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Can't Find What You're Looking For?
                </h2>
                <p className="text-white/90 mb-6">
                  Our support team is available 24/7 to help you with any questions or issues.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/contact-us" 
                    className="bg-white text-[#153e8f] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Contact Support
                  </a>
                  <a 
                    href="mailto:support@gamava.com" 
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#153e8f] transition-colors"
                  >
                    Email Us
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