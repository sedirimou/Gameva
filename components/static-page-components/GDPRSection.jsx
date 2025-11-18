import React from 'react';

export default function GDPRSection({ data }) {
  const {
    title = "Data Protection & Privacy",
    sections = []
  } = data || {};

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full flex items-center justify-center text-sm font-bold text-white mr-3">
                {index + 1}
              </span>
              {section.title}
            </h3>
            <div className="text-white/80 space-y-3">
              {section.content.split('\n').map((paragraph, pIndex) => (
                paragraph.trim() && <p key={pIndex}>{paragraph}</p>
              ))}
            </div>
            {section.items && (
              <ul className="mt-4 space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-white/80 flex items-start">
                    <span className="text-[#29adb2] mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}