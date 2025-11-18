import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Gamepad2, CreditCard, HelpCircle, LogOut } from 'lucide-react';

export default function UserDropdown({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    if (logout) {
      logout();
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      route: '/user/profile'
    },
    {
      icon: Gamepad2,
      label: 'My Library',
      route: '/user/library'
    },
    {
      icon: CreditCard,
      label: 'My Orders',
      route: '/user/orders'
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      route: '/user/help'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white/10 border border-white/20 cursor-pointer hover:opacity-80 transition-all flex items-center justify-center"
        aria-label="User menu"
      >
        {user?.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt="User avatar" 
            className="h-7 w-7 rounded-full object-cover border-0"
            style={{ objectFit: 'cover', width: '28px', height: '28px' }}
          />
        ) : (
          <User className="h-7 w-7 text-white" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute mt-2 rounded-lg shadow-xl border border-gray-200 z-[99999999] overflow-hidden user-dropdown-container"
          style={{ 
            top: '100%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            backgroundColor: '#153e8f'
          }}
        >
          {/* User Info Header */}
          <div className="w-full px-4 py-3 border-b border-white/20">
            <div className="w-full flex items-center space-x-3">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt="User avatar" 
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0 border-0"
                  style={{ objectFit: 'cover', width: '32px', height: '32px' }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0 max-w-full">
                <p className="text-sm font-medium truncate w-full text-white">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'User'
                  }
                </p>
                <p className="text-xs truncate w-full text-white">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="w-full py-2">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link key={index} href={item.route}>
                  <div 
                    className="w-full flex items-center px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <IconComponent className="h-4 w-4 mr-3 flex-shrink-0 text-white" />
                    <span className="text-sm font-medium flex-1 min-w-0 text-white">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <hr className="border-white/20" />

          {/* Logout */}
          <div className="w-full py-2">
            <button
              onClick={handleLogout}
              className="w-full max-w-full flex items-center px-4 py-2 hover:bg-white/10 transition-colors text-left"
              style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
            >
              <LogOut className="h-4 w-4 mr-3 flex-shrink-0" style={{ color: '#FFFFFF' }} />
              <span className="text-sm font-medium flex-1 min-w-0" style={{ color: '#ffffff' }}>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}