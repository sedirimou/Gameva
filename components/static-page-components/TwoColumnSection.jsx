import React from 'react';

const TwoColumnSection = ({ data }) => {
  if (!data || !data.columns) return null;

  const { title, columns } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
      {columns.map((column, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
            {column.title}
          </h2>
          {column.content && Array.isArray(column.content) ? (
            column.content.map((paragraph, pIndex) => (
              <p key={pIndex} className="text-white/90 mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : column.items && Array.isArray(column.items) ? (
            <div className="space-y-4">
              {column.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <p className="text-white/90">{item}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default TwoColumnSection;