import React, { useState } from 'react';

export default function FAQsList({ 
  title = "Frequently Asked Questions",
  faqs = [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all unopened items."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days, express shipping takes 1-2 business days."
    }
  ]
}) {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
        {title}
      </h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="text-white font-medium">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-white/70 transition-transform ${
                  openFAQ === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openFAQ === index && (
              <div className="px-6 pb-4">
                <div className="text-white/80 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const FAQsListConfig = {
  name: "FAQs List",
  component: FAQsList,
  props: {
    title: {
      type: "text",
      default: "Frequently Asked Questions",
      label: "Section Title"
    },
    faqs: {
      type: "array",
      default: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for all unopened items."
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 3-5 business days, express shipping takes 1-2 business days."
        }
      ],
      label: "FAQ Items",
      itemSchema: {
        question: { type: "text", label: "Question" },
        answer: { type: "textarea", label: "Answer" }
      }
    }
  },
  category: "Content"
};