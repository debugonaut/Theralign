import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getMyNotifications, getUnreadCount, markAllRead } from '../../api/notification.api';

// Self-contained, zero-dependency helper to format dates like date-fns
const formatDistanceToNow = (dateString) => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) return 'Just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  } catch (e) {
    return 'Just now';
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Poll for unread count every 60 seconds
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('theralign_token');
        if (!token) return; // Only fetch if authenticated
        
        const res = await getUnreadCount();
        if (res.data?.success) {
          setUnreadCount(res.data.data.count);
        }
      } catch (err) {
        // Fail-safe degradation: logging error instead of interrupting UI
        console.warn('Silent count fetch warning:', err.message);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      setIsLoading(true);
      try {
        const res = await getMyNotifications();
        if (res.data?.success) {
          setNotifications(res.data.data);
          
          // If we had unread notifications, mark all as read atomically
          if (unreadCount > 0) {
            await markAllRead();
            setUnreadCount(0);
          }
        }
      } catch (err) {
        console.error('Failed to load notifications:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNotificationClick = (link) => {
    setIsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_booked':
        return '📅';
      case 'appointment_cancelled':
        return '❌';
      case 'appointment_completed':
        return '✓';
      case 'review_received':
        return '⭐';
      case 'verification_approved':
        return '🛡️';
      case 'verification_rejected':
        return '⚠️';
      case 'document_uploaded':
        return '📄';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-full transition-all duration-150 focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="h-5.5 w-5.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <span className="font-semibold text-slate-800 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-primary font-medium">{unreadCount} new</span>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
            {isLoading && (
              <div className="py-8 text-center text-sm text-slate-400">
                <span className="inline-block animate-spin mr-2">⏳</span> Loading...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="py-10 px-4 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm font-medium text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
              </div>
            )}

            {!isLoading && notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => handleNotificationClick(item.link)}
                className={`flex gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-all ${
                  !item.isRead ? 'bg-sky-50/30 font-medium' : ''
                }`}
              >
                <div className="text-xl flex-shrink-0 mt-0.5 select-none">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-sm text-slate-800 truncate font-semibold">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
