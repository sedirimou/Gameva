/**
 * LeeCMS Renderer - Frontend display component
 * Renders saved LeeCMS content for public viewing
 */
import RowLayout from './RowLayout';

const LeeCMSRenderer = ({ content = [], className = '' }) => {
  if (!Array.isArray(content) || content.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-[40vh] ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-semibold mb-2">No Content Available</h2>
          <p className="text-gray-400">This page doesn't have any content yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`leecms-content ${className}`}>
      <div className="max-w-[1200px] mx-auto px-4 pt-8">
        {content.map((row, index) => (
          <RowLayout
            key={row.id || `row-${index}`}
            row={row}
            rowIndex={index}
            isEditing={false}
          />
        ))}
      </div>
    </div>
  );
};

export default LeeCMSRenderer;