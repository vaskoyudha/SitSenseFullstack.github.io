import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Volume2 } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { usePosture } from '../../context/PostureContext';
import aiService from '../../services/aiService';

const AIAdvicePanel = () => {
  const { postureData, sessionData } = usePosture();
  const { speak, speaking, stop } = useTTS();
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format advice text (bullet points)
  const formatAdvice = (text) => {
    if (!text) return '';
    const lines = text
      .split(/\r?\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    
    // Check if already bulleted
    const isBullet = lines.every((l) => /^[•\-*\d+\.\)]\s?/.test(l));
    if (isBullet) {
      return lines.map((l) => l.replace(/^[•\-*\d+\.\)]\s?/, ''));
    }
    return lines;
  };

  const getAdvice = async () => {
    if (!postureData) {
      setError('Tidak ada data postur untuk dianalisis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const score = postureData.scores?.total || 0;
      const imbalance = {
        lr: Math.abs((postureData.balance?.left || 0) - (postureData.balance?.right || 0)),
        fb: Math.abs((postureData.balance?.front || 0) - (postureData.balance?.back || 0)),
      };
      const durationSec = sessionData.startTime
        ? Math.floor((Date.now() - new Date(sessionData.startTime).getTime()) / 1000)
        : 0;

      const response = await aiService.getAdvice({
        score,
        imbalance,
        durationSec,
        lastAlerts: '-',
        pressureMatrix: postureData.pressure?.matrix,
      });

      if (response.success && response.data?.text) {
        setAdvice(response.data.text);
      } else {
        setError(response.error || 'Gagal mendapatkan rekomendasi');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat rekomendasi AI');
      console.error('Error getting AI advice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleListen = () => {
    if (advice) {
      if (speaking) {
        stop();
      } else {
        speak(advice);
      }
    }
  };

  const formattedAdvice = formatAdvice(advice);

  return (
    <div className="card glassy-card card-border">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Rekomendasi AI</h3>
          <div className="tooltip" data-tip="Didukung Gemini + Google Voice">
            <Sparkles className="h-5 w-5 text-yellow-300" />
          </div>
        </div>
        
        <div id="adviceText" className="mt-2 text-slate-300/90 text-sm leading-relaxed min-h-[60px]">
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              <span>Memuat rekomendasi...</span>
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : formattedAdvice.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {formattedAdvice.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400">
              Menunggu data… rekomendasi personal akan muncul di sini.
            </span>
          )}
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={getAdvice}
            disabled={loading || !postureData}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Minta Rekomendasi
          </button>
          <button
            onClick={handleListen}
            disabled={!advice || loading}
            className={`btn btn-primary btn-sm ${speaking ? 'btn-error' : ''}`}
          >
            <Volume2 className="h-4 w-4" />
            {speaking ? 'Berhenti' : 'Dengarkan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvicePanel;

