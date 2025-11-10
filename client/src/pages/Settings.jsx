import { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useSettings } from '../context/SettingsContext';

const Settings = () => {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const result = await updateSettings(formData);
    if (result.success) {
      setMessage('Pengaturan berhasil disimpan');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.error || 'Gagal menyimpan pengaturan');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 relative z-10 md:ml-64">
        <div className="card glassy-card card-border">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Pengaturan</h2>
            
            {message && (
              <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'} mb-4`}>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text">Tema</span>
                </label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-white/5 border-white/10"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Ambang Lembut (menit)</span>
                </label>
                <input
                  type="number"
                  name="softThreshold"
                  value={formData.softThreshold}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white/5 border-white/10"
                  min="1"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Ambang Kuat (menit)</span>
                </label>
                <input
                  type="number"
                  name="hardThreshold"
                  value={formData.hardThreshold}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-white/5 border-white/10"
                  min="1"
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Aktifkan Alert</span>
                  <input
                    type="checkbox"
                    name="alertsEnabled"
                    checked={formData.alertsEnabled}
                    onChange={handleChange}
                    className="toggle toggle-primary"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Aktifkan Suara</span>
                  <input
                    type="checkbox"
                    name="soundEnabled"
                    checked={formData.soundEnabled}
                    onChange={handleChange}
                    className="toggle toggle-primary"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gradient-primary normal-case"
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Simpan Pengaturan'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

