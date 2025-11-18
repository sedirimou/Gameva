import React from 'react';
import LeeCMSRenderer from './cms/LeeCMSRenderer';

// Legacy component registry for backwards compatibility
function PageRenderer({ components = [] }) {
  // Check if this is LeeCMS content (array of rows) or legacy components
  const isLeeCMSContent = Array.isArray(components) && 
    components.length > 0 && 
    components.some(item => item.layout || item.components);

  if (isLeeCMSContent) {
    return <LeeCMSRenderer content={components} />;
  }

  // Legacy static page rendering for backwards compatibility
  if (!Array.isArray(components) || components.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Page Content Loading...</h1>
          <p className="text-white/80">This page is being built with our content management system.</p>
        </div>
      </div>
    );
  }

  // Legacy component rendering
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {components.map((component, index) => (
        <div key={index} className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
          <p className="text-yellow-300">Legacy component type: {component.type || 'unknown'}</p>
          <p className="text-yellow-200 text-sm">Please upgrade this page to use LeeCMS</p>
        </div>
      ))}
    </div>
  );
}

export default PageRenderer;