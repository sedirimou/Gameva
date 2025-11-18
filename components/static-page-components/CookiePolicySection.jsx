import React from 'react';

export default function CookiePolicySection({ data }) {
  const {
    title = "Cookie Policy",
    introduction = "",
    cookieTypes = []
  } = data || {};

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      
      {introduction && (
        <div className="text-white/80 mb-8 space-y-3">
          {introduction.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {cookieTypes.map((cookieType, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full mr-3 ${
                cookieType.required ? 'bg-red-500' : 'bg-green-500'
              }`}></div>
              <h3 className="text-xl font-semibold text-white">{cookieType.name}</h3>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                cookieType.required 
                  ? 'bg-red-500/20 text-red-300' 
                  : 'bg-green-500/20 text-green-300'
              }`}>
                {cookieType.required ? 'Required' : 'Optional'}
              </span>
            </div>
            
            <p className="text-white/80 mb-4">{cookieType.description}</p>
            
            {cookieType.examples && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Examples:</h4>
                <ul className="space-y-1">
                  {cookieType.examples.map((example, exIndex) => (
                    <li key={exIndex} className="text-white/70 text-sm flex items-start">
                      <span className="text-[#29adb2] mr-2">•</span>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-[#99b476]/20 to-[#29adb2]/20 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">Manage Your Preferences</h3>
        <p className="text-white/80 mb-4">
          You can update your cookie preferences at any time using our cookie settings panel.
        </p>
        <button className="bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-xl transition-all duration-300">
          Cookie Settings
        </button>
      </div>
    </div>
  );
}