import { useState, useCallback } from 'react';
import { Grid, Sliders, Compass, Camera, RefreshCw, Activity } from 'lucide-react';
import HeatmapCanvas from './HeatmapCanvas';
import { usePosture } from '../../context/PostureContext';

const PanelParameters = () => {
  const { postureData } = usePosture();
  const [resolution, setResolution] = useState(8);
  const [sensitivity, setSensitivity] = useState(60);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [silhouetteVisible, setSilhouetteVisible] = useState(true);
  const [baseMatrix, setBaseMatrix] = useState(null);

  // Get pressure matrix from posture data
  const pressureMatrix = postureData?.pressure?.matrix || null;
  const postureScore = postureData?.scores?.total || 0;
  const postureLabel = postureScore >= 75 ? 'Baik' : postureScore >= 50 ? 'Perlu Koreksi' : 'Buruk';

  // Calculate balance from matrix
  const calculateBalance = useCallback((matrix) => {
    if (!matrix) return { left: 0.5, right: 0.5, front: 0.5, back: 0.5 };
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    let left = 0;
    let right = 0;
    let front = 0;
    let back = 0;
    let total = 0;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const v = Math.max(0, matrix[i][j]);
        total += v;
        if (j < cols / 2) left += v;
        else right += v;
        if (i < rows / 2) front += v;
        else back += v;
      }
    }
    
    if (total <= 0) return { left: 0.5, right: 0.5, front: 0.5, back: 0.5 };
    
    return {
      left: left / total,
      right: right / total,
      front: front / total,
      back: back / total,
    };
  }, []);

  const balance = calculateBalance(pressureMatrix);
  const lrPct = Math.round((balance.right / (balance.left + balance.right || 1)) * 100);
  const fbPct = Math.round((balance.back / (balance.front + balance.back || 1)) * 100);

  const handleCalibrate = () => {
    if (pressureMatrix) {
      setBaseMatrix(JSON.parse(JSON.stringify(pressureMatrix)));
    }
  };

  const handleSnapshot = () => {
    const canvas = document.querySelector('#heatmapCanvas');
    if (canvas) {
      try {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `sitsense-heatmap-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Failed to save snapshot:', err);
      }
    }
  };

  const handleResetView = () => {
    setBaseMatrix(null);
    setSensitivity(60);
    setResolution(8);
  };

  return (
    <section className="card glassy-card card-border">
      <div className="card-body">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="card-title">Parameter Visual</h3>
            <div className="badge badge-info badge-outline">Real-time</div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <Grid className="h-4 w-4" />
              <span>Resolusi</span>
              <select
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value, 10))}
                className="select select-bordered select-xs ml-1 bg-white/5 border-white/10"
              >
                <option value="4">4×4</option>
                <option value="6">6×6</option>
                <option value="8">8×8</option>
                <option value="10">10×10</option>
              </select>
            </label>
            
            <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <Sliders className="h-4 w-4" />
              <span>Sensitivitas</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseInt(e.target.value, 10))}
                className="range range-xs w-28"
              />
            </label>
            
            <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <input
                type="checkbox"
                checked={heatmapVisible}
                onChange={(e) => setHeatmapVisible(e.target.checked)}
                className="toggle toggle-xs"
              />
              <span>Heatmap</span>
            </label>
            
            <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <input
                type="checkbox"
                checked={silhouetteVisible}
                onChange={(e) => setSilhouetteVisible(e.target.checked)}
                className="toggle toggle-xs"
              />
              <span>Silhouette</span>
            </label>
            
            <button
              onClick={handleCalibrate}
              className="btn btn-outline btn-xs"
              title="Kalibrasi"
            >
              <Compass className="h-4 w-4" />
              Kalibrasi
            </button>
          </div>
        </div>

        {/* Visual surface */}
        <div className="relative mt-4 w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900/60 border border-white/5">
          <HeatmapCanvas
            matrix={pressureMatrix}
            baseMatrix={baseMatrix}
            resolution={resolution}
            sensitivity={sensitivity / 100}
            visible={heatmapVisible}
          />
          
          {/* Silhouette Overlay */}
          {silhouetteVisible && (
            <img
              src="/assets/img/posture-silhouette.svg"
              alt="silhouette"
              className="absolute inset-0 w-full h-full object-contain opacity-80 pointer-events-none select-none"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Legend */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[11px] bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
              rendah
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400"></span>
              sedang
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span>
              tinggi
            </span>
          </div>
        </div>

        {/* Balance indicators & score */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Distribusi Tekanan (FSR)</span>
                <span id="balanceLRVal">{lrPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  id="balanceLRFill"
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${lrPct}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Keseimbangan Leher ↔ Punggung</span>
                <span id="balanceFBVal">{fbPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  id="balanceFBFill"
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${fbPct}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="card glassy-card card-border">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Skor Postur</h4>
                <Activity className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="mt-2 flex items-end gap-2">
                <div className="text-3xl font-bold" id="postureScore">
                  {postureScore || '—'}
                </div>
                <div className="text-sm text-slate-300/80" id="postureLabel">
                  {postureScore > 0 ? postureLabel : 'menunggu data…'}
                </div>
              </div>
              <div className="mt-3">
                <progress
                  className="progress w-full"
                  value={postureScore}
                  max="100"
                  id="postureScoreBar"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="badge badge-status" data-status="good">
              Baik
            </span>
            <span className="badge badge-status" data-status="warn">
              Perlu Koreksi
            </span>
            <span className="badge badge-status" data-status="bad">
              Buruk
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSnapshot} className="btn btn-outline btn-xs">
              <Camera className="h-4 w-4" />
              Snapshot
            </button>
            <button onClick={handleResetView} className="btn btn-outline btn-xs">
              <RefreshCw className="h-4 w-4" />
              Reset Tampilan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PanelParameters;

