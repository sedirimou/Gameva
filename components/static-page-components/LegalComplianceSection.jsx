import React from 'react';

export default function LegalComplianceSection({ data }) {
  const {
    title = "Legal Compliance",
    regulations = []
  } = data || {};

  const getRegulationIcon = (type) => {
    switch (type) {
      case 'gdpr': return '🔒';
      case 'ccpa': return '🛡️';
      case 'coppa': return '👶';
      case 'pci': return '💳';
      case 'accessibility': return '♿';
      default: return '📋';
    }
  };

  const getRegulationColor = (type) => {
    switch (type) {
      case 'gdpr': return 'from-blue-500 to-blue-600';
      case 'ccpa': return 'from-purple-500 to-purple-600';
      case 'coppa': return 'from-green-500 to-green-600';
      case 'pci': return 'from-orange-500 to-orange-600';
      case 'accessibility': return 'from-indigo-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regulations.map((regulation, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${getRegulationColor(regulation.type)} rounded-lg flex items-center justify-center text-2xl mr-4`}>
                {getRegulationIcon(regulation.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{regulation.name}</h3>
                <p className="text-white/60 text-sm">{regulation.jurisdiction}</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-4">{regulation.description}</p>
            
            {regulation.requirements && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Key Requirements:</h4>
                <ul className="space-y-1">
                  {regulation.requirements.map((requirement, reqIndex) => (
                    <li key={reqIndex} className="text-white/70 text-sm flex items-start">
                      <span className="text-[#29adb2] mr-2">✓</span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {regulation.status && (
              <div className="mt-4 flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  regulation.status === 'compliant' 
                    ? 'bg-green-500/20 text-green-300' 
                    : regulation.status === 'partial'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {regulation.status === 'compliant' ? 'Compliant' : 
                   regulation.status === 'partial' ? 'Partial Compliance' : 'Non-Compliant'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-[#99b476]/20 to-[#29adb2]/20 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">Compliance Statement</h3>
        <p className="text-white/80">
          Gamava is committed to maintaining the highest standards of legal compliance across all jurisdictions where we operate. 
          We regularly review and update our policies to ensure adherence to evolving regulations and best practices in data protection, 
          consumer rights, and digital commerce.
        </p>
      </div>
    </div>
  );
}