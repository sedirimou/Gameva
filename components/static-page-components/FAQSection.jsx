import React, { useState } from 'react';

const FAQSection = ({ data }) => {
  const [expandedItems, setExpandedItems] = useState({});

  if (!data || !data.categories) return null;

  const { categories } = data;

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-8 mb-16">
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
            {category.category}
          </h2>
          
          <div className="space-y-4">
            {category.questions.map((qa, questionIndex) => {
              const key = `${categoryIndex}-${questionIndex}`;
              const isExpanded = expandedItems[key];
              
              return (
                <div key={questionIndex} className="border border-white/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleItem(categoryIndex, questionIndex)}
                    className="w-full px-6 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                  >
                    <span className="text-white font-medium">{qa.question}</span>
                    <svg 
                      className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 py-4 bg-white/5">
                      <p className="text-white/90 leading-relaxed">
                        {qa.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;