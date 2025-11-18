import React from 'react';

const RegionalAvailabilitySection = ({ data }) => {
  if (!data || !data.regions) return null;

  const { title, regions } = data;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
        <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {regions.map((region, index) => (
          <div key={index} className="text-center">
            <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
              region.status === 'success' 
                ? 'bg-green-500' 
                : 'bg-gradient-to-r from-[#99b476] to-[#29adb2]'
            }`}>
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.41 3.59-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.41-3.59 8-8 8z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{region.title}</h3>
            <p className="text-white/80 mb-3">{region.description}</p>
            {region.stat && (
              <p className="text-green-400 font-semibold">{region.stat}</p>
            )}
            {region.details && (
              <div className="mt-3 space-y-1">
                {region.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-white/70 text-sm">{detail}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionalAvailabilitySection;