import React from 'react';

const InstantDeliverySection = ({ data }) => {
  if (!data) return null;

  const { title, leftColumn, rightColumn } = data;
  
  // Provide default values if data is incomplete
  const safeLeftColumn = leftColumn || { title: 'How It Works', steps: [] };
  const safeRightColumn = rightColumn || { title: 'Delivery Times', deliveryTimes: [] };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
      {/* Left Column - How It Works */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
          {safeLeftColumn.title}
        </h2>
        
        <div className="space-y-4">
          {(safeLeftColumn.steps || []).map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
              <p className="text-white/90">{typeof step === 'string' ? step : step?.description || 'Step description'}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Column - Delivery Times */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
          {safeRightColumn.title}
        </h2>
        
        <div className="space-y-4">
          {(safeRightColumn.deliveryTimes || []).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20">
              <span className="text-white">{item.product}</span>
              <div className="flex items-center space-x-2">
                <span className="text-white/90">{item.time}</span>
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'success' ? 'bg-green-400' : 
                  item.status === 'warning' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstantDeliverySection;