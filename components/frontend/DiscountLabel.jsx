/**
 * Discount Label Component
 * Shows discount percentage with styled background matching design
 */
export default function DiscountLabel({ discount, className = "" }) {
  if (!discount || discount <= 0) {
    return null;
  }

  return (
    <div 
      className={`
        inline-flex items-center justify-center
        px-3 py-1
        bg-[#c6e899] 
        text-[#153e8f] 
        text-sm font-semibold
        shadow-lg
        ${className}
      `}
      style={{
        borderRadius: '12px 0 12px 0',
        minWidth: '50px'
      }}
    >
      -{discount}%
    </div>
  );
}