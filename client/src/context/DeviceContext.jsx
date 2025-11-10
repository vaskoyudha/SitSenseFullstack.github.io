import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import deviceService from '../services/deviceService';
import socketService from '../services/socketService';

const DeviceContext = createContext();

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDevices();
      connectSocket();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  const connectSocket = () => {
    if (!user?.id) return;

    const socket = socketService.connect(user.id);

    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('Socket disconnected');
    });

    socket.on('device:connected', (data) => {
      console.log('Device connected:', data);
      updateDeviceStatus(data.deviceId, 'online');
    });

    socket.on('device:disconnected', (data) => {
      console.log('Device disconnected:', data);
      updateDeviceStatus(data.deviceId, 'offline');
    });

    socket.on('device:info:update', (data) => {
      updateDeviceInfo(data.deviceId, data.info);
    });
  };

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceService.getDevices();
      if (response.success) {
        setDevices(response.data || []);
        // Set first device as active if none selected
        if (response.data?.length > 0 && !activeDevice) {
          setActiveDevice(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeviceStatus = (deviceId, status) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId
          ? { ...device, metadata: { ...device.metadata, status } }
          : device
      )
    );
  };

  const updateDeviceInfo = (deviceId, info) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId
          ? { ...device, metadata: { ...device.metadata, ...info } }
          : device
      )
    );
  };

  const createDevice = async (deviceData) => {
    try {
      const response = await deviceService.createDevice(deviceData);
      if (response.success) {
        await loadDevices();
        return { success: true, data: response.data };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to create device' };
    }
  };

  const value = {
    devices,
    activeDevice,
    setActiveDevice,
    loading,
    connectionStatus,
    loadDevices,
    createDevice,
  };

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};

