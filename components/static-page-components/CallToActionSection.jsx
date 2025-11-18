import React from 'react';

const CallToActionSection = ({ data }) => {
  if (!data) return null;

  const { title, description, buttons } = data;

  return (
    <div className="text-center">
      <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-white/90 mb-6">
            {description}
          </p>
        )}
        {buttons && buttons.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttons.map((button, index) => (
              <a 
                key={index}
                href={button.link} 
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  button.style === 'primary' 
                    ? 'bg-white text-[#153e8f] hover:bg-gray-100'
                    : 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#153e8f]'
                }`}
              >
                {button.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallToActionSection;