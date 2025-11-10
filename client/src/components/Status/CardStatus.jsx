import { Activity, Bell, Target, Clock, RefreshCw, Compass, ZoomIn } from 'lucide-react';

const CardStatus = ({
  sensorId = 'seat-1',
  status = 'good', // 'good' | 'warn' | 'bad' | 'offline'
  label = 'Tekanan Duduk',
  value = '—',
  unit = '/100',
  trend = '',
  progress = 0,
  alerts = 0,
  resolution = '8×8',
  updated = '—',
  onRefresh,
  onCalibrate,
  onDetails,
}) => {
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

  const config = statusConfig[status] || statusConfig.good;

  return (
    <article className="card glassy-card card-border sensor-card" data-sensor-id={sensorId} data-status={status}>
      <div className="card-body p-4">
        {/* Header: icon + label + status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
              <Activity className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-slate-300/80">Status</div>
              <div className="font-semibold">{label}</div>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badgeClass}`}>
            <span className={`h-2 w-2 rounded-full ${config.dotClass}`}></span>
            <span className="status-text">{config.text}</span>
          </span>
        </div>

        {/* Metric utama */}
        <div className="mt-3 flex items-end gap-2">
          <div className="text-3xl font-bold leading-none">{value}</div>
          <div className="text-sm text-slate-300/80 mb-1">{unit}</div>
          {trend && (
            <div className="ml-auto text-xs text-slate-400" aria-label="tren">
              {trend}
            </div>
          )}
        </div>

        {/* Progress & meta */}
        <div className="mt-3">
          <progress className="progress w-full" value={progress} max="100" />
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
            <div className="inline-flex items-center gap-1">
              <Bell className="h-3.5 w-3.5" />
              Peringatan: <span className="text-slate-200 ml-1">{alerts}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              Resolusi: <span className="text-slate-200 ml-1">{resolution}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Update: <span className="text-slate-200 ml-1">{updated}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            ID: <span className="text-slate-200">{sensorId}</span>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button onClick={onRefresh} className="btn btn-outline btn-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            )}
            {onCalibrate && (
              <button onClick={onCalibrate} className="btn btn-outline btn-xs">
                <Compass className="h-3.5 w-3.5" />
                Kalibrasi
              </button>
            )}
            {onDetails && (
              <button onClick={onDetails} className="btn btn-primary btn-xs">
                <ZoomIn className="h-3.5 w-3.5" />
                Detail
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default CardStatus;

