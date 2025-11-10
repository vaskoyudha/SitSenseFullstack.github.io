import { useEffect } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { usePosture } from '../context/PostureContext';
import { useDevice } from '../context/DeviceContext';
import { useSettings } from '../context/SettingsContext';
import { useSitTimer } from '../hooks/useSitTimer';
import { initAudioElements } from '../utils/alerts';
import ChartsContainer from '../components/Charts/ChartsContainer';
import ScoreBreakdown from '../components/Dashboard/ScoreBreakdown';
import PanelParameters from '../components/PostureVisual/PanelParameters';
import AIAdvicePanel from '../components/Dashboard/AIAdvicePanel';

const Dashboard = () => {
  const { postureData, sessionData } = usePosture();
  const { activeDevice } = useDevice();
  const { settings } = useSettings();
  
  // Initialize sit timer with thresholds from settings
  const sitTimer = useSitTimer(
    {
      soft: (settings.softThreshold || 30) * 60, // Convert minutes to seconds
      hard: (settings.hardThreshold || 60) * 60,
    },
    !settings.soundEnabled
  );

  // Initialize audio elements on mount
  useEffect(() => {
    initAudioElements();
  }, []);

  // Start/stop timer based on session
  useEffect(() => {
    if (sessionData.startTime && !sitTimer.running) {
      sitTimer.start();
    } else if (!sessionData.startTime && sitTimer.running) {
      sitTimer.stop();
    }
  }, [sessionData.startTime, sitTimer]);

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 relative z-10 md:ml-64">
        {/* Hero Section */}
        <section className="hero-section relative overflow-hidden rounded-2xl glassy-card card-border p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  Monitor Postur Duduk Anda
                </h1>
                <p className="text-lg text-slate-300/90 mb-6 leading-relaxed">
                  Sistem monitoring postur duduk cerdas yang membantu Anda menjaga kesehatan dan produktivitas.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="glassy-card card-border p-4 text-center">
                  <div className="text-3xl font-bold text-cyan-300 mb-1">
                    {sessionData.startTime
                      ? Math.floor((Date.now() - new Date(sessionData.startTime).getTime()) / 60000)
                      : '00'}
                    :00
                  </div>
                  <div className="text-xs text-slate-400">Total Durasi Hari Ini</div>
                </div>
                <div className="glassy-card card-border p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-300 mb-1">
                    {sessionData.scores.length > 0
                      ? Math.round(
                          sessionData.scores.reduce((a, b) => a + b, 0) / sessionData.scores.length
                        )
                      : '—'}
                  </div>
                  <div className="text-xs text-slate-400">Skor Rata-rata</div>
                </div>
                <div className="glassy-card card-border p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-1">{sessionData.goodCount}</div>
                  <div className="text-xs text-slate-400">Postur Baik</div>
                </div>
                <div className="glassy-card card-border p-4 text-center">
                  <div className="text-3xl font-bold text-rose-300 mb-1">{sessionData.badCount}</div>
                  <div className="text-xs text-slate-400">Perlu Perbaikan</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card glassy-card card-border">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="card-title text-base">Durasi Duduk</h3>
              </div>
              <div className="mt-2 text-3xl font-bold">
                {sitTimer.formattedDuration || '00:00:00'}
              </div>
              <p className="text-xs text-slate-300/80 mt-1">
                Ambang lembut: <span>{sitTimer.softThresholdLabel}</span> • ambang kuat: <span>{sitTimer.hardThresholdLabel}</span>
              </p>
            </div>
          </div>
          
          <div className="card glassy-card card-border">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="card-title text-base">Skor Postur</h3>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <div className="text-3xl font-bold">
                  {postureData?.scores?.total || '—'}
                </div>
                <div className="text-sm text-slate-300/80">
                  {postureData?.scores?.total >= 80
                    ? 'Baik'
                    : postureData?.scores?.total >= 60
                    ? 'Perlu Koreksi'
                    : postureData?.scores?.total > 0
                    ? 'Buruk'
                    : 'Menunggu data…'}
                </div>
              </div>
              <div className="mt-3">
                <progress
                  className="progress progress-info w-full"
                  value={postureData?.scores?.total || 0}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
          
          <div className="card glassy-card card-border">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="card-title text-base">Status Perangkat</h3>
              </div>
              <ul className="mt-2 text-sm space-y-1">
                <li>
                  ESP32: <span>{activeDevice?.metadata?.status || '—'}</span>
                </li>
                <li>
                  IP: <span>{activeDevice?.metadata?.ip || '—'}</span>
                </li>
                <li>
                  Firmware: <span>{activeDevice?.metadata?.fw || '—'}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Posture Visual Panel */}
        <PanelParameters />

        {/* AI Advice Panel */}
        <AIAdvicePanel />

        {/* Charts */}
        <ChartsContainer />

        {/* Score Breakdown */}
        <ScoreBreakdown />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;

