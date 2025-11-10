import { useState, useEffect, useRef } from 'react';
import { Activity, X, Image, FileDown, Compass } from 'lucide-react';
import HeatmapCanvas from '../PostureVisual/HeatmapCanvas';

const SensorDetailModal = ({
  isOpen,
  onClose,
  sensorData = {
    id: 'seat-1',
    title: 'Tekanan Duduk',
    status: 'good',
    score: 0,
    scoreLabel: '—',
    balanceLR: 50,
    balanceFB: 50,
    avgPressure: '—',
    duration: '—',
    alerts: 0,
    resolution: '8×8',
    updated: '—',
    notes: '—',
    pressureMatrix: null,
  },
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const statusConfig = {
    good: {
      badgeClass: 'border-emerald-500/35 text-emerald-500 bg-emerald-500/10',
      dotClass: 'bg-emerald-500',
      text: 'Baik',
    },
    warn: {
      badgeClass: 'border-amber-500/35 text-amber-500 bg-amber-500/10',
      dotClass: 'bg-amber-500',
      text: 'Perlu Koreksi',
    },
    bad: {
      badgeClass: 'border-red-500/35 text-red-500 bg-red-500/10',
      dotClass: 'bg-red-500',
      text: 'Buruk',
    },
    offline: {
      badgeClass: 'border-slate-500/35 text-slate-500 bg-slate-500/10',
      dotClass: 'bg-slate-500',
      text: 'Offline',
    },
  };

  const config = statusConfig[sensorData.status] || statusConfig.good;

  const handleExportPNG = () => {
    const canvas = document.getElementById('heatmapPreview');
    if (canvas) {
      try {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `sitsense-heatmap-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Failed to export PNG:', err);
      }
    }
  };

  const handleExportJSON = () => {
    try {
      const data = {
        ...sensorData,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitsense-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export JSON:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} className="modal" data-status={sensorData.status}>
      <div className="modal-box w-11/12 max-w-5xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#0b1220]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
              <Activity className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="leading-tight">
              <div className="text-xs text-slate-400">Detail Sensor</div>
              <div className="text-lg font-semibold">{sensorData.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badgeClass}`}>
              <span className={`h-2 w-2 rounded-full ${config.dotClass}`}></span>
              <span>{config.text}</span>
            </span>
            <form method="dialog">
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: metrics */}
          <section className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold leading-none">{sensorData.score || '—'}</div>
                <div className="mb-1 text-sm text-slate-300/80">/100</div>
                <div className="ml-auto text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                  {sensorData.scoreLabel || '—'}
                </div>
              </div>
              <progress className="progress w-full mt-3" value={sensorData.score || 0} max="100" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="text-sm font-medium">Keseimbangan</div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Kiri ↔ Kanan</span>
                  <span>{sensorData.balanceLR}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400/70 to-emerald-400/70"
                    style={{ width: `${sensorData.balanceLR}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Depan ↔ Belakang</span>
                  <span>{sensorData.balanceFB}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400/70 to-rose-400/70"
                    style={{ width: `${sensorData.balanceFB}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="text-slate-400 text-xs">Rata Tekanan</div>
                <div className="font-semibold">{sensorData.avgPressure}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs">Durasi Sesi</div>
                <div className="font-semibold">{sensorData.duration}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs">Peringatan</div>
                <div className="font-semibold">{sensorData.alerts}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs">Resolusi</div>
                <div className="font-semibold">{sensorData.resolution}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-slate-400 text-xs mb-1">Catatan</div>
              <div className="text-sm leading-relaxed">{sensorData.notes}</div>
            </div>

            <div className="text-xs text-slate-400">
              ID: <span className="text-slate-200">{sensorData.id}</span> • Update:{' '}
              <span className="text-slate-200">{sensorData.updated}</span>
            </div>
          </section>

          {/* Right: heatmap preview */}
          <section className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-sm font-medium">Heatmap Snapshot</div>
              <div className="flex items-center gap-2 text-xs">
                <button onClick={handleExportPNG} className="btn btn-outline btn-xs">
                  <Image className="h-3.5 w-3.5" />
                  PNG
                </button>
                <button onClick={handleExportJSON} className="btn btn-outline btn-xs">
                  <FileDown className="h-3.5 w-3.5" />
                  JSON
                </button>
                <button className="btn btn-outline btn-xs">
                  <Compass className="h-3.5 w-3.5" />
                  Kalibrasi
                </button>
              </div>
            </div>
            <div className="mt-2 relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#0b1220]">
              <div className="absolute inset-0">
                <HeatmapCanvas
                  matrix={sensorData.pressureMatrix}
                  resolution={8}
                  sensitivity={0.6}
                  visible={true}
                />
              </div>
              <img
                id="silhouettePreview"
                alt="silhouette"
                src="/assets/img/silhouette-white.svg"
                className="absolute inset-0 w-full h-full opacity-40 pointer-events-none select-none"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between bg-[#0b1220]/60">
          <div className="text-xs text-slate-400">
            Gunakan tombol PNG/JSON untuk menyimpan snapshot; Kalibrasi akan menjadikan matriks
            saat ini sebagai baseline.
          </div>
          <form method="dialog">
            <button onClick={onClose} className="btn btn-primary">
              Tutup
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default SensorDetailModal;

