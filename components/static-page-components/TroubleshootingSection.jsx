import React from 'react';

const TroubleshootingSection = ({ data }) => {
  if (!data) return null;

  const { title, leftColumn, rightColumn } = data;
  
  // Provide default values if data is incomplete
  const safeLeftColumn = leftColumn || { title: 'Common Issues', issues: [] };
  const safeRightColumn = rightColumn || { title: 'Quick Solutions', steps: [] };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
      {/* Left Column - Common Issues */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
          {safeLeftColumn.title}
        </h2>
        
        <div className="space-y-6">
          {(safeLeftColumn.issues || []).map((item, index) => (
            <div key={index} className="border border-white/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                {item?.issue || item?.title || 'Issue'}
              </h3>
              <p className="text-white/80">{item?.solution || item?.description || 'Solution'}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Column - Quick Solutions */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
          {safeRightColumn.title}
        </h2>
        
        <div className="space-y-6">
          {(safeRightColumn.steps || []).map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{step?.step || step?.title || 'Step'}</h3>
                <p className="text-white/80">{step?.description || step?.content || 'Description'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingSection;