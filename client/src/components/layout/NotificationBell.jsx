import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyNotifications, getUnreadCount, markAllRead, markAsRead } from '../../api/notification.api';

const formatTimeAgo = (dateString) => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'JUST NOW';
    if (diffInSeconds < 60) return 'JUST NOW';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}M AGO`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}H AGO`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}D AGO`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}MO AGO`;
  } catch (e) {
    return 'JUST NOW';
  }
};

const CATEGORY_MAP = {
  appointment_booked: 'NEW BOOKING',
  appointment_cancelled: 'APPOINTMENT CANCELLED',
  appointment_completed: 'APPOINTMENT COMPLETED',
  review_received: 'FEEDBACK SUBMITTED',
  verification_approved: 'VERIFICATION UPDATE',
  verification_rejected: 'VERIFICATION UPDATE',
  document_uploaded: 'FILE ATTACHED',
  REFUND_REQUEST: 'REFUND REQUEST',
  CANCELLATION_CONFIRMED: 'CANCELLATION CONFIRMED',
  REFUND_APPROVED: 'REFUND APPROVED',
  REFUND_REJECTED: 'REFUND REVIEWED',
  DOCTOR_CANCELLED: 'APPOINTMENT CANCELLED',
  // Phase 15 — Session Records
  session_record_available: 'SESSION NOTES READY',
  follow_up_recommended: 'FOLLOW-UP RECOMMENDED',
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Poll for unread count every 30 seconds
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('theralign_token');
      if (!token) return;
      
      const res = await getUnreadCount();
      if (res.data?.success) {
        setUnreadCount(res.data.data.count);
      } else if (res.success) {
        setUnreadCount(res.data?.count ?? 0);
      }
    } catch (err) {
      console.warn('Silent count fetch warning:', err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
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
        const list = res.data?.data || res.data || [];
        setNotifications(list);
      } catch (err) {
        console.error('Failed to load notifications:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleNotificationClick = async (item) => {
    setIsOpen(false);
    try {
      if (!item.isRead) {
        await markAsRead(item._id);
        fetchUnreadCount();
      }
      if (item.link) {
        navigate(item.link);
      }
    } catch (err) {
      console.error(err);
      if (item.link) navigate(item.link);
    }
  };

  return (
    <div className="relative inline-block select-none" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-neutral-900 hover:text-accent transition-all duration-fast focus:outline-none bg-transparent border-0 cursor-pointer"
        aria-label="View notifications dropdown"
      >
        <Bell className="h-5.5 w-5.5 text-neutral-900" strokeWidth={1.5} />
        
        {/* Unread Count Rectangular Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 border border-neutral-900 bg-white text-neutral-900 text-[9px] font-black px-1 py-0.5 leading-none select-none rounded-none">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container: 280px wide, border-2 black, white bg, snappy */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-280 bg-white border-2 border-neutral-900 z-50 overflow-hidden rounded-none shadow-none text-left">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b-2 border-neutral-900 select-none">
            <span className="font-black text-neutral-900 text-[10px] uppercase tracking-widest">
              NOTIFICATIONS
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-[9px] font-black text-accent uppercase tracking-widest bg-transparent border-0 hover:underline cursor-pointer select-none"
            >
              MARK ALL READ
            </button>
          </div>

          {/* List content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-200">
            {isLoading && (
              <div className="py-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" /> LOADING...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="py-4 px-4 text-center select-none flex flex-col items-center">
                <BellOff className="h-8 w-8 text-neutral-400 mb-2" strokeWidth={1.5} />
                <p className="text-xs font-black text-neutral-900 uppercase tracking-wider">ALL CAUGHT UP!</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">No notifications yet.</p>
              </div>
            )}

            {!isLoading && notifications.map((item) => {
              const category = CATEGORY_MAP[item.type] || 'SYSTEM NOTIFICATION';
              const isUnread = !item.isRead;

              return (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  style={{ height: '72px' }}
                  className={`flex flex-col justify-between p-3.5 hover:bg-neutral-50 cursor-pointer transition-all duration-fast select-none relative ${
                    isUnread 
                      ? 'border-l-4 border-neutral-900 bg-neutral-50/55' 
                      : 'border-l-4 border-transparent bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest truncate max-w-[170px] block leading-none">
                      {category}
                    </span>
                  </div>

                  <p className="text-[12px] font-bold text-neutral-900 uppercase tracking-wide truncate mt-1 leading-none select-none">
                    {item.title || item.message}
                  </p>

                  <div className="text-right mt-1.5 leading-none">
                    <span className="text-[9px] font-bold text-neutral-500 font-mono tracking-wider block">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
