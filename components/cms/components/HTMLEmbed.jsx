/**
 * HTMLEmbed Component - Custom HTML content with sanitization
 */
import DOMPurify from 'isomorphic-dompurify';

const HTMLEmbed = ({ data }) => {
  const {
    htmlContent = '<div>Your HTML content here...</div>',
    customClasses = '',
    marginTop = '0',
    marginBottom = '1rem'
  } = data;

  const containerStyle = {
    marginTop,
    marginBottom
  };

  // Sanitize HTML content for security
  const sanitizedHTML = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 'b', 'i', 'br', 'hr',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'a', 'img', 'video', 'audio', 'iframe',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'style', 'href', 'src', 'alt', 'width', 'height',
      'target', 'rel', 'title', 'colspan', 'rowspan'
    ],
    ALLOW_DATA_ATTR: false
  });

  if (!htmlContent.trim()) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${customClasses}`}
        style={containerStyle}
      >
        <div className="text-gray-500 text-sm">No HTML content provided</div>
      </div>
    );
  }

  return (
    <div 
      className={`html-embed-content ${customClasses}`}
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export default HTMLEmbed;