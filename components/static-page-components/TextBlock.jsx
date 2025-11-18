import React from 'react';

export default function TextBlock({ 
  content = '<p>Add your text content here...</p>', 
  alignment = 'left' 
}) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment] || 'text-left';

  return (
    <div className={`prose prose-lg prose-invert max-w-none ${alignmentClass}`}>
      <div 
        className="text-white/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}