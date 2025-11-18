import React from 'react';

export default function ShippingInfoBlock({ 
  title = 'Shipping Information',
  content = '<p>Add your shipping details here...</p>'
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">🚚</div>
        <h3 className="text-2xl font-bold text-white">
          {title}
        </h3>
      </div>
      
      <div className="prose prose-lg prose-invert max-w-none">
        <div 
          className="text-white/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}