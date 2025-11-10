import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData.email, formData.password, formData.name);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/img/logo-sitsense.svg" alt="SitSense" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Buat Akun</h1>
          <p className="text-slate-400">Daftar untuk mulai menggunakan SitSense</p>
        </div>

        <div className="glassy-card card-border p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="label">
                <span className="label-text">Nama</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-white/5 border-white/10"
                placeholder="Nama Anda"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-white/5 border-white/10"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-white/5 border-white/10"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Konfirmasi Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-white/5 border-white/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gradient-primary w-full normal-case"
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-cyan-300 hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

