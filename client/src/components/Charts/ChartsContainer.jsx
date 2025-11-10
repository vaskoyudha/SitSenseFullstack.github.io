import { useState, useEffect, useMemo } from 'react';
import { LineChart, PieChart } from 'lucide-react';
import PressureChart from './PressureChart';
import QualityChart from './QualityChart';
import { usePosture } from '../../context/PostureContext';

const ChartsContainer = () => {
  const { postureData, sessionData } = usePosture();
  const [pressureHistory, setPressureHistory] = useState([]);
  const [qualityCounts, setQualityCounts] = useState({ good: 0, fix: 0, bad: 0 });

  // Update pressure history when posture data changes
  useEffect(() => {
    if (postureData?.pressure?.average) {
      setPressureHistory((prev) => {
        const newHistory = [...prev, postureData.pressure.average];
        // Limit to 120 points (2 minutes @ 1Hz)
        return newHistory.slice(-120);
      });
    }
  }, [postureData]);

  // Update quality counts based on posture score
  useEffect(() => {
    if (postureData?.scores?.total !== undefined) {
      const score = postureData.scores.total;
      setQualityCounts((prev) => {
        if (score >= 80) {
          return { ...prev, good: prev.good + 1 };
        } else if (score >= 60) {
          return { ...prev, fix: prev.fix + 1 };
        } else {
          return { ...prev, bad: prev.bad + 1 };
        }
      });
    }
  }, [postureData]);

  const resetCharts = () => {
    setPressureHistory([]);
    setQualityCounts({ good: 0, fix: 0, bad: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pressure Chart */}
      <div className="card glassy-card card-border">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Tekanan vs Waktu</h3>
            <LineChart className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="mt-4">
            <PressureChart pressureData={pressureHistory} maxPoints={120} />
          </div>
        </div>
      </div>

      {/* Quality Chart */}
      <div className="card glassy-card card-border">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Kualitas Postur (Baik vs Koreksi)</h3>
            <PieChart className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="mt-4">
            <QualityChart qualityCounts={qualityCounts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsContainer;

