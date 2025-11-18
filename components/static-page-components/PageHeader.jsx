import React from 'react';

const PageHeader = ({ data }) => {
  if (!data) return null;

  const { title, description } = data;

  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
        {title}
      </h1>
      {description && (
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;