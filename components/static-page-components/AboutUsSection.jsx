import React from 'react';

export default function AboutUsSection({ title = "About Us", content = "Tell your story here...", backgroundColor = "#153e8f" }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <span className="bg-gradient-to-r from-[#99b476] to-[#29adb2] w-1 h-8 rounded-full mr-4"></span>
        {title}
      </h2>
      <div className="prose prose-invert max-w-none">
        <div 
          className="text-white/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

export const AboutUsSectionConfig = {
  name: "About Us Section",
  component: AboutUsSection,
  props: {
    title: {
      type: "text",
      default: "About Us",
      label: "Section Title"
    },
    content: {
      type: "textarea",
      default: "Tell your story here...",
      label: "Content"
    },
    backgroundColor: {
      type: "color",
      default: "#153e8f",
      label: "Background Color"
    }
  },
  category: "Content"
};