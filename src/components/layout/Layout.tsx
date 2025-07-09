// src/components/layout/Layout.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import type { RootState } from '../../store/store';

const Layout: React.FC = () => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;