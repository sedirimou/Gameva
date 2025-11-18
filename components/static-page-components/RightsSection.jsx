import React from 'react';

export default function RightsSection({ data }) {
  const {
    title = "Your Rights",
    subtitle = "Under European data protection law, you have the following rights:",
    rights = []
  } = data || {};

  const getRightIcon = (type) => {
    switch (type) {
      case 'access': return '👁️';
      case 'rectification': return '✏️';
      case 'erasure': return '🗑️';
      case 'restriction': return '⏸️';
      case 'portability': return '📦';
      case 'objection': return '✋';
      case 'complaint': return '📋';
      default: return '⚖️';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      {subtitle && <p className="text-white/80 mb-8">{subtitle}</p>}
      
      <div className="space-y-6">
        {rights.map((right, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-lg flex items-center justify-center text-2xl mr-4 flex-shrink-0">
                {getRightIcon(right.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{right.name}</h3>
                <p className="text-white/80 mb-4">{right.description}</p>
                
                {right.howToExercise && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">How to exercise this right:</h4>
                    <p className="text-white/70 text-sm">{right.howToExercise}</p>
                  </div>
                )}

                {right.timeframe && (
                  <div className="mt-3 flex items-center">
                    <span className="text-xs text-white/60">Response timeframe: </span>
                    <span className="text-xs text-[#29adb2] font-medium ml-1">{right.timeframe}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-[#99b476]/20 to-[#29adb2]/20 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">Exercise Your Rights</h3>
        <p className="text-white/80 mb-4">
          To exercise any of these rights, please contact our Data Protection Officer using the information below:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-white/70">Email:</p>
            <p className="text-white font-medium">privacy@gamava.com</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Response Time:</p>
            <p className="text-white font-medium">Within 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}