import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import settingsService from '../services/settingsService';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'dark',
    softThreshold: 30,
    hardThreshold: 60,
    alertsEnabled: true,
    soundEnabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSettings();
    }
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      const response = await settingsService.updateSettings(newSettings);
      if (response.success) {
        setSettings(response.data);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to update settings' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    loadSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

