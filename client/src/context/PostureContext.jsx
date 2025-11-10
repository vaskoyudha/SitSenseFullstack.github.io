import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useDevice } from './DeviceContext';
import socketService from '../services/socketService';

const PostureContext = createContext();

export const usePosture = () => {
  const context = useContext(PostureContext);
  if (!context) {
    throw new Error('usePosture must be used within a PostureProvider');
  }
  return context;
};

export const PostureProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { activeDevice } = useDevice();
  const [postureData, setPostureData] = useState(null);
  const [sessionData, setSessionData] = useState({
    scores: [],
    startTime: null,
    goodCount: 0,
    badCount: 0,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = socketService.getSocket();
      
      if (socket) {
        socket.on('posture:update', handlePostureUpdate);
      }

      return () => {
        if (socket) {
          socket.off('posture:update', handlePostureUpdate);
        }
      };
    }
  }, [isAuthenticated, user, activeDevice]);

  const handlePostureUpdate = (data) => {
    // Only process data from active device
    if (activeDevice && data.deviceId === activeDevice.deviceId) {
      setPostureData(data);

      // Update session data
      setSessionData((prev) => {
        const newScores = [...prev.scores, data.scores.total];
        return {
          scores: newScores,
          startTime: prev.startTime || new Date(),
          goodCount: data.scores.total >= 80 ? prev.goodCount + 1 : prev.goodCount,
          badCount: data.scores.total < 60 ? prev.badCount + 1 : prev.badCount,
        };
      });
    }
  };

  const resetSession = () => {
    setSessionData({
      scores: [],
      startTime: null,
      goodCount: 0,
      badCount: 0,
    });
    setPostureData(null);
  };

  const value = {
    postureData,
    sessionData,
    resetSession,
  };

  return <PostureContext.Provider value={value}>{children}</PostureContext.Provider>;
};

