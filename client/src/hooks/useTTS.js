import { useState, useEffect, useCallback } from 'react';
import { speakText, stopSpeaking, isSpeaking, preloadTTS } from '../utils/tts';

/**
 * Hook untuk Text-to-Speech
 */
export const useTTS = (config = {}) => {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState(null);

  // Preload on mount
  useEffect(() => {
    preloadTTS();
  }, []);

  // Listen to TTS events
  useEffect(() => {
    const handleStart = () => setSpeaking(true);
    const handleEnd = () => setSpeaking(false);
    const handleError = (e) => {
      setError(e.detail?.error || 'TTS Error');
      setSpeaking(false);
    };

    document.addEventListener('sitsense:tts:start', handleStart);
    document.addEventListener('sitsense:tts:end', handleEnd);
    document.addEventListener('sitsense:tts:error', handleError);

    return () => {
      document.removeEventListener('sitsense:tts:start', handleStart);
      document.removeEventListener('sitsense:tts:end', handleEnd);
      document.removeEventListener('sitsense:tts:error', handleError);
    };
  }, []);

  const speak = useCallback(
    async (text, opts = {}) => {
      if (!text || !text.trim()) return;
      
      setError(null);
      setSpeaking(true);
      
      try {
        await speakText(text, { ...config, ...opts });
      } catch (err) {
        setError(err.message || 'Failed to speak text');
        setSpeaking(false);
      }
    },
    [config]
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    speaking,
    error,
    isSpeaking: speaking || isSpeaking(),
  };
};

