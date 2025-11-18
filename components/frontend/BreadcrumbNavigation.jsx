import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouseChimneyWindow } from '@fortawesome/free-solid-svg-icons';

export default function BreadcrumbNavigation({ productName }) {
  return (
    <nav className="breadcrumb-navigation pt-0 pb-0 hidden md:block mt-[40px]">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center space-x-2 text-sm text-white/70">
          {/* Home Icon Link (no text) */}
          <Link href="/" className="hover:text-white transition-colors">
            <FontAwesomeIcon 
              icon={faHouseChimneyWindow} 
              style={{ color: '#ffffff' }}
              className="w-4 h-4"
            />
          </Link>
          
          {/* Separator */}
          <span className="text-white/50">/</span>
          
          {/* Product Label - Clickable */}
          <Link href="/category/all-products" className="text-white/70 hover:text-white transition-colors">
            Product
          </Link>
          
          {/* Separator */}
          <span className="text-white/50">/</span>
          
          {/* Product Name */}
          <span className="text-white font-medium truncate max-w-md">
            {productName}
          </span>
        </div>
      </div>
    </nav>
  );
}