'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ChevronDown } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

interface Settings {
  notifications: {
    emailNotifications: boolean;
    weeklyProgressReport: boolean;
  };
  appearance: {
    darkMode: boolean;
    language: string;
  };
  privacy: {
    dataSharing: boolean;
    analyticsTracking: boolean;
  };
  security: {
    twoFactorAuth: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      emailNotifications: true,
      weeklyProgressReport: true,
    },
    appearance: {
      darkMode: false,
      language: 'English',
    },
    privacy: {
      dataSharing: true,
      analyticsTracking: true,
    },
    security: {
      twoFactorAuth: false,
    },
  });

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
    
    // Load saved settings
    const savedSettings = localStorage.getItem('arise_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    setIsLoading(false);
  }, [router]);

  const handleToggle = (category: keyof Settings, setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]],
      },
    }));
  };

  const handleLanguageChange = (language: string) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        language,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Save to localStorage
    localStorage.setItem('arise_settings', JSON.stringify(settings));
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      localStorage.removeItem('arise_user');
      localStorage.removeItem('arise_settings');
      router.push('/');
    }
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#0D5C5C]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D5C5C]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0D5C5C]">
      {/* Top Bar */}
      <div className="bg-[#0D5C5C] text-white px-6 py-3">
        <span className="text-sm font-medium tracking-wider">SETTINGS</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar user={user} activePage="settings" />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 bg-[#0D5C5C]/30 min-h-[calc(100vh-48px)]">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#0D5C5C]">Settings</h1>
                <p className="text-gray-600">Manage your account settings</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#0D5C5C] text-white rounded-lg font-medium hover:bg-[#0a4a4a] transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  <span className="text-[#0D5C5C] font-semibold text-sm">
                    {user.firstName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Notifications */}
              <section className="mb-8">
                <h2 className="text-[#0D5C5C] font-semibold mb-4">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Email notifications</h3>
                      <p className="text-sm text-gray-500">Receive updates about your assessments</p>
                    </div>
                    <Toggle
                      enabled={settings.notifications.emailNotifications}
                      onChange={() => handleToggle('notifications', 'emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Weekly progress report</h3>
                      <p className="text-sm text-gray-500">Get a summary of your development</p>
                    </div>
                    <Toggle
                      enabled={settings.notifications.weeklyProgressReport}
                      onChange={() => handleToggle('notifications', 'weeklyProgressReport')}
                    />
                  </div>
                </div>
              </section>

              {/* Appearance */}
              <section className="mb-8">
                <h2 className="text-[#0D5C5C] font-semibold mb-4">Appearance</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Dark Mode</h3>
                      <p className="text-sm text-gray-500">Enable dark theme across the platform</p>
                    </div>
                    <Toggle
                      enabled={settings.appearance.darkMode}
                      onChange={() => handleToggle('appearance', 'darkMode')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Language</h3>
                      <p className="text-sm text-gray-500">Choose your preferred language</p>
                    </div>
                    <div className="relative">
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                      >
                        <option value="English">English</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="German">German</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy */}
              <section className="mb-8">
                <h2 className="text-[#0D5C5C] font-semibold mb-4">Privacy</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Data Sharing</h3>
                      <p className="text-sm text-gray-500">Share anonymous data to improve platform features</p>
                    </div>
                    <Toggle
                      enabled={settings.privacy.dataSharing}
                      onChange={() => handleToggle('privacy', 'dataSharing')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Analytics Tracking</h3>
                      <p className="text-sm text-gray-500">Allow us to track usage for better experience</p>
                    </div>
                    <Toggle
                      enabled={settings.privacy.analyticsTracking}
                      onChange={() => handleToggle('privacy', 'analyticsTracking')}
                    />
                  </div>
                </div>
              </section>

              {/* Security */}
              <section className="mb-8">
                <h2 className="text-[#0D5C5C] font-semibold mb-4">Security</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Toggle
                      enabled={settings.security.twoFactorAuth}
                      onChange={() => handleToggle('security', 'twoFactorAuth')}
                    />
                  </div>
                </div>
              </section>

              {/* Delete Account */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-2 bg-[#0D5C5C] text-white rounded-lg font-medium hover:bg-[#0a4a4a] transition-colors"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
