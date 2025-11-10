import { useRef, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const MAX_DEFAULT = 120; // 2 menit @1Hz

const PressureChart = ({ pressureData = [], maxPoints = MAX_DEFAULT }) => {
  const chartRef = useRef(null);

  // Get theme colors
  const theme = useMemo(() => {
    const accent = '#06b6d4'; // cyan-500
    const gridRGB = '255,255,255';
    const gridA = 0.08;
    const tickRGB = '231,238,252';
    const tickA = 0.65;
    
    return {
      accent,
      grid: `rgba(${gridRGB}, ${gridA})`,
      tick: `rgba(${tickRGB}, ${tickA})`,
    };
  }, []);

  // Prepare data - limit to maxPoints
  const chartData = useMemo(() => {
    const limitedData = pressureData.slice(-maxPoints);
    const labels = limitedData.map((_, index) => {
      const ts = new Date();
      return `${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}:${String(ts.getSeconds()).padStart(2, '0')}`;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Tekanan rata-rata',
          data: limitedData,
          borderColor: theme.accent,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0.00)');
            return gradient;
          },
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [pressureData, maxPoints, theme.accent]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 220 },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        grid: { color: theme.grid },
        ticks: { 
          color: theme.tick, 
          maxRotation: 0, 
          autoSkip: true, 
          maxTicksLimit: 6 
        },
      },
      y: {
        grid: { color: theme.grid },
        ticks: { color: theme.tick },
        beginAtZero: true,
      },
    },
  }), [theme]);

  return (
    <div className="h-[140px]">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default PressureChart;

