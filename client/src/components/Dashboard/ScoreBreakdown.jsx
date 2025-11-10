import { ClipboardList } from 'lucide-react';
import { usePosture } from '../../context/PostureContext';

const ScoreBreakdown = () => {
  const { postureData } = usePosture();

  const backScore = postureData?.scores?.back || 0;
  const neckScore = postureData?.scores?.neck || 0;
  const pressureScore = postureData?.scores?.pressure || 0;

  return (
    <div className="card glassy-card card-border">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">Rincian Skor Postur</h3>
          <ClipboardList className="h-5 w-5 text-violet-300" />
        </div>
        <div className="space-y-4">
          {/* Back Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-sm">Posisi Punggung</span>
              <span className="font-bold text-lg text-cyan-300">{backScore}</span>
            </div>
            <progress 
              className="progress progress-info w-full" 
              value={backScore} 
              max="100"
            />
          </div>
          
          {/* Neck Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-sm">Posisi Leher</span>
              <span className="font-bold text-lg text-emerald-300">{neckScore}</span>
            </div>
            <progress 
              className="progress progress-success w-full" 
              value={neckScore} 
              max="100"
            />
          </div>
          
          {/* Pressure Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-sm">Tekanan Duduk</span>
              <span className="font-bold text-lg text-amber-300">{pressureScore}</span>
            </div>
            <progress 
              className="progress progress-warning w-full" 
              value={pressureScore} 
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;

