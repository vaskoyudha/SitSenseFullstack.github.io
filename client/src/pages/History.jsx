import { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import historyService from '../services/historyService';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await historyService.getHistory();
      if (response.success) {
        setHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 relative z-10 md:ml-64">
        <div className="card glassy-card card-border">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Riwayat Sesi</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : history.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Belum ada riwayat sesi.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Durasi</th>
                      <th>Skor Rata-rata</th>
                      <th>Postur Baik</th>
                      <th>Postur Buruk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((session) => (
                      <tr key={session._id}>
                        <td>{new Date(session.startTime).toLocaleDateString('id-ID')}</td>
                        <td>
                          {Math.floor(session.duration / 60)}m {session.duration % 60}s
                        </td>
                        <td>{session.stats.averageScore}</td>
                        <td className="text-emerald-400">{session.stats.goodPostureCount}</td>
                        <td className="text-red-400">{session.stats.badPostureCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default History;

