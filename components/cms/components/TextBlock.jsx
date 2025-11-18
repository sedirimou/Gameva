/**
 * TextBlock Component - Rich text content display
 */
import DOMPurify from 'isomorphic-dompurify';
import { useRouter } from 'next/router';

const TextBlock = ({ data, isEditing = false }) => {
  const {
    title = '',
    title1 = '',
    title2 = '',
    content = 'Enter your text content...',
    textAlign = 'left',
    textSize = 'medium',
    showTitle = false,
    fontSize = 'text-base',
    customClasses = '',
    marginTop = '0',
    marginBottom = '1rem'
  } = data;

  const router = useRouter();
  
  // Determine if we're in admin context or frontend
  const isAdminContext = isEditing || router.pathname.startsWith('/admin');
  const textColor = isAdminContext ? 'text-black' : 'text-white';
  const richTextClass = isAdminContext ? 'rich-text-content-admin' : 'rich-text-content-frontend';

  // Map textSize to actual CSS classes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const actualFontSize = sizeClasses[textSize] || fontSize;

  // Smart text transformation functions
  const transformNumberedLines = (text) => {
    // Handle numbered lines within HTML paragraphs
    return text.replace(/<p[^>]*>(\d+)\s+([^<]+)<\/p>/g, 
      '<div class="line-item"><span class="line-number">$1</span><span>$2</span></div>');
  };

  const formatBoldText = (text) => {
    // Keep bold text as regular bold without special styling
    let result = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Keep <strong> HTML bold tags as is
    return result;
  };

  const renderFormattedText = (rawText) => {
    const numbered = transformNumberedLines(rawText);
    const styled = formatBoldText(numbered);
    return styled;
  };

  // Apply smart transformations and sanitize HTML content
  const formattedContent = renderFormattedText(content);
  
  // Configure DOMPurify to allow our custom classes
  const sanitizeConfig = {
    ALLOWED_TAGS: ['div', 'span', 'p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['class', 'href', 'target'],
    ALLOW_DATA_ATTR: false
  };
  
  const sanitizedContent = DOMPurify.sanitize(formattedContent, sanitizeConfig);

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const containerStyle = {
    marginTop,
    marginBottom
  };

  return (
    <div 
      className={`${alignmentClasses[textAlign]} ${actualFontSize} ${customClasses}`}
      style={containerStyle}
    >
      {title1 && (
        <h2 className={`text-3xl font-bold ${textColor} mb-3`}>{title1}</h2>
      )}
      {title2 && (
        <h3 className={`text-2xl font-semibold ${textColor} mb-4`}>{title2}</h3>
      )}
      {showTitle && title && (
        <h3 className={`text-2xl font-bold ${textColor} mb-4`}>{title}</h3>
      )}
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        className={`${richTextClass} ${textColor} ${alignmentClasses[textAlign]}`}
      />
    </div>
  );
};

export default TextBlock;