/**
 * FAQSection Component - Frequently Asked Questions with collapsible items
 */
import { useState } from 'react';

const FAQSection = ({ data }) => {
  const {
    title = 'Frequently Asked Questions',
    subtitle = 'Find answers to common questions',
    faqs = [
      {
        question: 'How do I create an account?',
        answer: 'You can create an account by clicking the "Sign Up" button and following the registration process.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and various digital payment methods.'
      },
      {
        question: 'How long does delivery take?',
        answer: 'Digital products are delivered instantly after payment confirmation.'
      }
    ],
    showSearch = true,
    layout = 'single-column',
    backgroundColor = 'transparent',
    customClasses = '',
    marginTop = '0',
    marginBottom = '2rem'
  } = data;

  const [openItems, setOpenItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const containerStyle = {
    marginTop,
    marginBottom,
    backgroundColor
  };

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFaqs = searchTerm
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  return (
    <div 
      className={`faq-section ${customClasses}`}
      style={containerStyle}
    >
      <div className="max-w-4xl mx-auto bg-white/10 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-white/90">{subtitle}</p>
          )}
        </div>

        {showSearch && (
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full px-4 py-3 pl-10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-white/70 bg-white/10"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        <div className={`space-y-4 ${layout === 'two-column' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          {filteredFaqs.map((faq, index) => {
            const isOpen = openItems.has(index);
            return (
              <div
                key={index}
                className="border border-white/30 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-between"
                >
                  <span className="font-semibold text-white pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-white transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isOpen && (
                  <div className="px-6 py-4 bg-white/5 border-t border-white/30">
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFaqs.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-white/70">No FAQs found matching your search.</p>
          </div>
        )}

        <div className="mt-12 text-center p-6 bg-white/5 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-white/80 mb-4">
            Can't find the answer you're looking for? Please contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;