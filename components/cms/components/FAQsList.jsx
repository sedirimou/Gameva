/**
 * FAQsList Component - Simple list of FAQs without search
 */
import { useState } from 'react';

const FAQsList = ({ data }) => {
  const {
    title = 'Common Questions',
    faqs = [
      {
        question: 'Sample Question 1?',
        answer: 'This is a sample answer to the first question.'
      },
      {
        question: 'Sample Question 2?',
        answer: 'This is a sample answer to the second question.'
      }
    ],
    showNumbers = true,
    openByDefault = false,
    accentColor = '#29adb2',
    customClasses = '',
    marginTop = '0',
    marginBottom = '2rem'
  } = data;

  const [openItems, setOpenItems] = useState(
    openByDefault ? new Set(faqs.map((_, index) => index)) : new Set()
  );

  const containerStyle = {
    marginTop,
    marginBottom
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

  return (
    <div 
      className={`faqs-list ${customClasses}`}
      style={containerStyle}
    >
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {title}
          </h2>
        )}

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openItems.has(index);
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-start justify-between"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    {showNumbers && (
                      <span 
                        className="flex-shrink-0 w-6 h-6 rounded-full text-white text-sm font-semibold flex items-center justify-center"
                        style={{ backgroundColor: accentColor }}
                      >
                        {index + 1}
                      </span>
                    )}
                    <span className="font-medium text-gray-900 text-left">
                      {faq.question}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ml-4 ${
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
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className={showNumbers ? 'ml-9' : ''}>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
    </div>
  );
};

export default FAQsList;