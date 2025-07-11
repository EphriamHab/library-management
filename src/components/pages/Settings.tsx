/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Library, 
  Mail, 
  Shield, 
  Clock, 
  Bell,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

interface LibrarySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: {
    open: string;
    close: string;
    workingDays: string[];
  };
}

interface LoanSettings {
  defaultLoanPeriod: number;
  maxRenewals: number;
  maxBooksPerMember: number;
  reservationExpiryDays: number;
  overdueGracePeriod: number;
}

interface NotificationSettings {
  emailEnabled: boolean;
  overdueReminderDays: number[];
  reservationNotification: boolean;
  returnReminderDays: number;
  smtpSettings: {
    host: string;
    port: number;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
}

interface SecuritySettings {
  sessionTimeout: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  maxLoginAttempts: number;
}

interface SystemSettings {
  library: LibrarySettings;
  loan: LoanSettings;
  notification: NotificationSettings;
  security: SecuritySettings;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    library: {
      name: '',
      address: '',
      phone: '',
      email: '',
      workingHours: {
        open: '09:00',
        close: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    },
    loan: {
      defaultLoanPeriod: 14,
      maxRenewals: 2,
      maxBooksPerMember: 5,
      reservationExpiryDays: 3,
      overdueGracePeriod: 1
    },
    notification: {
      emailEnabled: true,
      overdueReminderDays: [1, 3, 7],
      reservationNotification: true,
      returnReminderDays: 2,
      smtpSettings: {
        host: '',
        port: 587,
        username: '',
        password: '',
        fromEmail: '',
        fromName: 'Library System'
      }
    },
    security: {
      sessionTimeout: 60,
      passwordMinLength: 8,
      requirePasswordChange: false,
      maxLoginAttempts: 5
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'library', label: 'Library Info', icon: Library },
    { id: 'loans', label: 'Loan Settings', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const weekDays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Replace with your API call
      // const response = await fetch('/api/settings');
      // const data = await response.json();
      // setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Replace with your API call
      // await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadSettings();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedSettings = (section: keyof SystemSettings, nested: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nested]: {
          ...(prev[section] as any)[nested],
          [field]: value
        }
      }
    }));
  };

  const toggleWorkingDay = (day: string) => {
    const currentDays = settings.library.workingHours.workingDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    updateNestedSettings('library', 'workingHours', 'workingDays', newDays);
  };

  const renderLibrarySettings = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Library Name *
          </label>
          <input
            type="text"
            value={settings.library.name}
            onChange={(e) => updateSettings('library', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter library name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.library.email}
            onChange={(e) => updateSettings('library', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="library@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={settings.library.address}
          onChange={(e) => updateSettings('library', 'address', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
          placeholder="Enter library address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone
        </label>
        <input
          type="tel"
          value={settings.library.phone}
          onChange={(e) => updateSettings('library', 'phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          placeholder="Enter phone number"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opening Time
          </label>
          <input
            type="time"
            value={settings.library.workingHours.open}
            onChange={(e) => updateNestedSettings('library', 'workingHours', 'open', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Closing Time
          </label>
          <input
            type="time"
            value={settings.library.workingHours.close}
            onChange={(e) => updateNestedSettings('library', 'workingHours', 'close', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Working Days
        </label>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {weekDays.map(day => (
            <label key={day.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.library.workingHours.workingDays.includes(day.id)}
                onChange={() => toggleWorkingDay(day.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{day.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLoanSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Loan Period (days)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.loan.defaultLoanPeriod}
            onChange={(e) => updateSettings('loan', 'defaultLoanPeriod', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Renewals
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={settings.loan.maxRenewals}
            onChange={(e) => updateSettings('loan', 'maxRenewals', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Books per Member
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.loan.maxBooksPerMember}
            onChange={(e) => updateSettings('loan', 'maxBooksPerMember', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reservation Expiry (days)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.loan.reservationExpiryDays}
            onChange={(e) => updateSettings('loan', 'reservationExpiryDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            How long a reservation is held before expiring
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overdue Grace Period (days)
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={settings.loan.overdueGracePeriod}
            onChange={(e) => updateSettings('loan', 'overdueGracePeriod', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Days before overdue notifications are sent
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Email Notifications</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Enable email notifications for the system</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={settings.notification.emailEnabled}
            onChange={(e) => updateSettings('notification', 'emailEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Return Reminder (days before due)
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={settings.notification.returnReminderDays}
            onChange={(e) => updateSettings('notification', 'returnReminderDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!settings.notification.emailEnabled}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overdue Reminder Days
          </label>
          <input
            type="text"
            value={settings.notification.overdueReminderDays.join(', ')}
            onChange={(e) => {
              const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
              updateSettings('notification', 'overdueReminderDays', days);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="1, 3, 7"
            disabled={!settings.notification.emailEnabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Comma-separated days after due date to send reminders
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Reservation Notifications</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Notify members when reserved books become available</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={settings.notification.reservationNotification}
            onChange={(e) => updateSettings('notification', 'reservationNotification', e.target.checked)}
            className="sr-only peer"
            disabled={!settings.notification.emailEnabled}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
        </label>
      </div>

      {settings.notification.emailEnabled && (
        <div className="border-t pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.notification.smtpSettings.host}
                onChange={(e) => updateNestedSettings('notification', 'smtpSettings', 'host', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                type="number"
                value={settings.notification.smtpSettings.port}
                onChange={(e) => updateNestedSettings('notification', 'smtpSettings', 'port', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="587"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={settings.notification.smtpSettings.username}
                onChange={(e) => updateNestedSettings('notification', 'smtpSettings', 'username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="your-email@gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={settings.notification.smtpSettings.password}
                onChange={(e) => updateNestedSettings('notification', 'smtpSettings', 'password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="App password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={settings.notification.smtpSettings.fromEmail}
                onChange={(e) => updateNestedSettings('notification', 'smtpSettings', 'fromEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="library@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={settings.notification.smtpSettings.fromName}
                onChange={(e) => updateNestedSettings('notification', 'smtpSettings', 'fromName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Library System"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="1440"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            How long users stay logged in without activity
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Minimum Length
          </label>
          <input
            type="number"
            min="6"
            max="50"
            value={settings.security.passwordMinLength}
            onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Number of failed attempts before account lockout
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Require Password Change</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Force users to change password on first login</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={settings.security.requirePasswordChange}
            onChange={(e) => updateSettings('security', 'requirePasswordChange', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return renderLibrarySettings();
      case 'loans':
        return renderLoanSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderLibrarySettings();
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center space-x-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm sm:text-base text-green-800">Settings saved successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Mobile Tab Selector */}
        <div className="sm:hidden border-b border-gray-200 p-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              {currentTab && <currentTab.icon className="w-4 h-4" />}
              <span className="font-medium">{currentTab?.label}</span>
            </div>
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          
          {mobileMenuOpen && (
            <div className="mt-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:block border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;