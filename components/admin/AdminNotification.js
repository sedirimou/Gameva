import { useState, useEffect } from 'react';

let notificationCallbacks = [];

export default function AdminNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const callback = (notification) => {
      if (notification.remove) {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      } else {
        setNotifications(prev => [...prev, notification]);
      }
    };
    
    notificationCallbacks.push(callback);
    
    return () => {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[999999999] space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            relative flex items-start p-4 rounded-lg shadow-lg max-w-sm
            transform transition-all duration-300 ease-in-out
            ${notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
            }
          `}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mr-3">
            {notification.type === 'success' && (
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {notification.title}
            </div>
            {notification.message && (
              <div className="mt-1 text-sm opacity-90">
                {notification.message}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Auto-dismiss timer */}
          {notification.duration && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              style={{
                animation: `shrink ${notification.duration}ms linear forwards`
              }}
            />
          )}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Function to show notifications from anywhere in the app
export const showAdminNotification = (type, title, message, duration = 5000) => {
  const notification = {
    id: Date.now() + Math.random(),
    type, // 'success', 'error', 'info'
    title,
    message,
    duration
  };

  // Notify all mounted notification components
  notificationCallbacks.forEach(callback => callback(notification));

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      notificationCallbacks.forEach(callback => {
        callback({ ...notification, remove: true });
      });
    }, duration);
  }
};