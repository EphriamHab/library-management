// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Search,
  BookMarked,
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import type { RootState } from '../../store/store';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getMenuItems = () => {
    if (user?.roles?.includes('Library Member')) {
      return [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Search, label: 'Browse Books', path: '/browse-books' },
        { icon: BookMarked, label: 'My Loans', path: '/my-loans' },
        { icon: CalendarCheck, label: 'My Reservations', path: '/my-reservations' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    } else {
      // Librarian and Admin navigation
      return [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'Books', path: '/books' },
        { icon: Users, label: 'Members', path: '/members' },
        { icon: Calendar, label: 'Loans', path: '/loans' },
        { icon: CalendarCheck, label: 'Reservations', path: '/reservations' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    }
  };


  const menuItems = getMenuItems();

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-16'
        }`}
    >
      {/* Brand + Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {sidebarOpen && (
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LibraryPro</span>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white shadow-inner">
        <button
          onClick={handleLogout}
          className={`flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 ${sidebarOpen ? 'w-full py-2 px-4 space-x-2' : 'w-12 h-12'
            } font-medium rounded-lg transition-colors duration-200 cursor-pointer`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
