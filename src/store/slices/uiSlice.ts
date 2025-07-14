/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/slices/uiSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
  read: boolean;
}

export interface Modal {
  id: string;
  type: 'book' | 'member' | 'loan' | 'confirmation' | 'custom';
  isOpen: boolean;
  data?: any;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface UiState {
  // Layout
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  
  // Modals
  modals: Modal[];
  
  // Search
  globalSearchOpen: boolean;
  globalSearchQuery: string;
  
  // Filters and sorting
  activeFilters: Record<string, any>;
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
  
  // View preferences
  viewMode: 'grid' | 'list' | 'table';
  itemsPerPage: number;
  
  // Mobile
  isMobile: boolean;
  mobileMenuOpen: boolean;
  
  // Breadcrumbs
  breadcrumbs: Array<{
    label: string;
    path?: string;
  }>;
  
  // Page settings
  pageTitle: string;
  pageSubtitle?: string;
}

const initialState: UiState = {
  // Layout
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // Theme
  theme: 'light',
  
  // Loading states
  globalLoading: false,
  pageLoading: false,
  
  // Notifications
  notifications: [],
  unreadNotificationsCount: 0,
  
  // Modals
  modals: [],
  
  // Search
  globalSearchOpen: false,
  globalSearchQuery: '',
  
  // Filters and sorting
  activeFilters: {},
  sortConfig: null,
  
  // View preferences
  viewMode: 'grid',
  itemsPerPage: 20,
  
  // Mobile
  isMobile: false,
  mobileMenuOpen: false,
  
  // Breadcrumbs
  breadcrumbs: [],
  
  // Page settings
  pageTitle: 'Dashboard',
  pageSubtitle: undefined,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Layout actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Loading actions
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        read: false,
        duration: action.payload.duration || 5000,
      };
      
      state.notifications.unshift(notification);
      state.unreadNotificationsCount += 1;
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadNotificationsCount = 0;
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadNotificationsCount = 0;
    },
    
    // Modal actions
    openModal: (state, action: PayloadAction<Omit<Modal, 'id' | 'isOpen'>>) => {
      const modal: Modal = {
        ...action.payload,
        id: `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isOpen: true,
        size: action.payload.size || 'md',
      };
      state.modals.push(modal);
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },
    
    closeAllModals: (state) => {
      state.modals = [];
    },
    
    updateModal: (state, action: PayloadAction<{ id: string; data: Partial<Modal> }>) => {
      const modal = state.modals.find(m => m.id === action.payload.id);
      if (modal) {
        Object.assign(modal, action.payload.data);
      }
    },
    
    // Search actions
    setGlobalSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.globalSearchOpen = action.payload;
      if (!action.payload) {
        state.globalSearchQuery = '';
      }
    },
    
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.globalSearchQuery = action.payload;
    },
    
    // Filter and sort actions
    setActiveFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.activeFilters = action.payload;
    },
    
    updateFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      if (action.payload.value === null || action.payload.value === undefined || action.payload.value === '') {
        delete state.activeFilters[action.payload.key];
      } else {
        state.activeFilters[action.payload.key] = action.payload.value;
      }
    },
    
    clearFilters: (state) => {
      state.activeFilters = {};
    },
    
    setSortConfig: (state, action: PayloadAction<{ key: string; direction: 'asc' | 'desc' } | null>) => {
      state.sortConfig = action.payload;
    },
    
    // View preference actions
    setViewMode: (state, action: PayloadAction<'grid' | 'list' | 'table'>) => {
      state.viewMode = action.payload;
    },
    
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
    },
    
    // Mobile actions
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      if (!action.payload) {
        state.mobileMenuOpen = false;
      }
    },
    
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Breadcrumb actions
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path?: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    
    addBreadcrumb: (state, action: PayloadAction<{ label: string; path?: string }>) => {
      state.breadcrumbs.push(action.payload);
    },
    
    // Page settings actions
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    
    setPageSubtitle: (state, action: PayloadAction<string | undefined>) => {
      state.pageSubtitle = action.payload;
    },
    
    setPageSettings: (state, action: PayloadAction<{ title: string; subtitle?: string }>) => {
      state.pageTitle = action.payload.title;
      state.pageSubtitle = action.payload.subtitle;
    },
    
    // Reset actions
    resetUiState: () => initialState,
  },
});

export const {
  // Layout
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Loading
  setGlobalLoading,
  setPageLoading,
  
  // Notifications
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  updateModal,
  
  // Search
  setGlobalSearchOpen,
  setGlobalSearchQuery,
  
  // Filters and sorting
  setActiveFilters,
  updateFilter,
  clearFilters,
  setSortConfig,
  
  // View preferences
  setViewMode,
  setItemsPerPage,
  
  // Mobile
  setIsMobile,
  toggleMobileMenu,
  setMobileMenuOpen,
  
  // Breadcrumbs
  setBreadcrumbs,
  addBreadcrumb,
  
  // Page settings
  setPageTitle,
  setPageSubtitle,
  setPageSettings,
  
  // Reset
  resetUiState,
} = uiSlice.actions;

export default uiSlice.reducer;