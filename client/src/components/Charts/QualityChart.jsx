import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const QualityChart = ({ qualityCounts = { good: 0, fix: 0, bad: 0 } }) => {
  const theme = useMemo(() => {
    const tickRGB = '231,238,252';
    const tickA = 0.65;
    return {
      good: '#10b981', // emerald-500
      warn: '#f59e0b', // amber-500
      bad: '#ef4444', // red-500
      tick: `rgba(${tickRGB}, ${tickA})`,
    };
  }, []);

  const chartData = useMemo(() => ({
    labels: ['Baik', 'Perlu Koreksi', 'Buruk'],
    datasets: [
      {
        data: [qualityCounts.good, qualityCounts.fix, qualityCounts.bad],
        backgroundColor: [theme.good, theme.warn, theme.bad],
        borderColor: 'transparent',
        hoverOffset: 4,
      },
    ],
  }), [qualityCounts, theme]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: theme.tick, 
          boxWidth: 10,
          padding: 15,
        },
      },
      tooltip: { 
        callbacks: { 
          label: (ctx) => `${ctx.label}: ${ctx.raw}` 
        } 
      },
    },
  }), [theme]);

  return (
    <div className="h-[140px]">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default QualityChart;

