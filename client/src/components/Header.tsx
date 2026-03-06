import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, BellIcon, CurrencyDollarIcon, PencilAltIcon, MegaphoneIcon, UserCircleIcon, CameraIcon, LogoutIcon } from '../constants';
import { LoggedInUser, Notification, Page } from '../types';

interface HeaderProps {
  title: string;
  user: LoggedInUser;
  onLogout: () => void;
  onMenuClick: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (page: Page) => void;
  onUpdateProfilePicture: (file: File) => void;
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    switch (type) {
        case 'fee': return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
        case 'exam': return <PencilAltIcon className="h-5 w-5 text-blue-500" />;
        case 'notice': return <MegaphoneIcon className="h-5 w-5 text-yellow-500" />;
        default: return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
};

const Header: React.FC<HeaderProps> = ({ title, user, onLogout, onMenuClick, notifications, onMarkAsRead, onMarkAllAsRead, onNavigate, onUpdateProfilePicture }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const panelRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          onUpdateProfilePicture(file);
          setProfileDropdownOpen(false);
      }
  };

  const handleNotificationClick = (notification: Notification) => {
    onMarkAsRead(notification.id);
    onNavigate(notification.linkTo);
    setIsPanelOpen(false);
  };
  
  const getRoleText = (role: LoggedInUser['role']) => {
    switch(role) {
        case 'admin': return 'অ্যাডমিনিস্ট্রেটর';
        case 'super_admin': return 'সুপার অ্যাডমিন';
        case 'teacher': return 'শিক্ষক';
        default: return 'ব্যবহারকারী';
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            >
              <span className="sr-only">সাইডবার খুলুন</span>
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary ml-4 lg:ml-0">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>
              {isPanelOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in-up">
                  <div className="p-3 flex justify-between items-center border-b">
                    <h4 className="font-semibold text-text-primary">বিজ্ঞপ্তিসমূহ</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAllAsRead();
                        }} 
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        সবগুলো পঠিত করুন
                      </button>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {notifications.map(n => (
                        <li
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 flex items-start space-x-3 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex-shrink-0 pt-1 relative">
                            {!n.isRead && <span className="absolute -left-1 top-1 h-2 w-2 bg-blue-500 rounded-full"></span>}
                            <NotificationIcon type={n.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-secondary break-words">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleDateString('bn-BD')}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-sm text-center text-gray-500">কোনো নতুন বিজ্ঞপ্তি নেই।</p>
                  )}
                </div>
              )}
            </div>
            <div className="relative" ref={profileDropdownRef}>
              <button onClick={() => setProfileDropdownOpen(prev => !prev)} className="flex items-center space-x-2 focus:outline-none">
                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-primary overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="প্রোফাইল" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircleIcon className="w-full h-full text-gray-400" />
                  )}
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-30 animate-fade-in-up">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-primary overflow-hidden">
                           {user.photoURL ? (
                                <img src={user.photoURL} alt="প্রোফাইল" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-gray-400" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary truncate">{user.name}</p>
                            <p className="text-sm text-text-secondary">{getRoleText(user.role)}</p>
                        </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <CameraIcon className="w-5 h-5 mr-3 text-gray-500" />
                      ছবি পরিবর্তন করুন
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogoutIcon className="w-5 h-5 mr-3" />
                      লগআউট
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;
