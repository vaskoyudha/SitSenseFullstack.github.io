import { Github, BookOpen, Globe } from 'lucide-react';
import { useDevice } from '../../context/DeviceContext';

const Footer = () => {
  const { activeDevice } = useDevice();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand / About */}
        <div className="flex items-start gap-3">
          <img src="/assets/img/logo-sitsense.svg" alt="SitSense" className="h-8 w-auto mt-0.5" />
          <div>
            <div className="text-lg font-semibold tracking-tight">SitSense</div>
            <p className="mt-1 text-sm text-slate-400">
              Monitoring postur & kenyamanan duduk berbasis IoT. Visual real‑time, peringatan
              cerdas, dan rekomendasi AI.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <nav className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-medium mb-2 text-slate-200">Navigasi</div>
            <ul className="space-y-1">
              <li>
                <a href="/dashboard" className="hover:underline">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/history" className="hover:underline">
                  Riwayat
                </a>
              </li>
              <li>
                <a href="/settings" className="hover:underline">
                  Pengaturan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2 text-slate-200">Proyek</div>
            <ul className="space-y-1">
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:underline">
                  <Github className="h-4 w-4" />
                  Sumber kode
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:underline">
                  <BookOpen className="h-4 w-4" />
                  Dokumentasi
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:underline">
                  <Globe className="h-4 w-4" />
                  Situs
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Meta / Status */}
        <div className="text-sm">
          <div className="font-medium mb-2 text-slate-200">Informasi</div>
          <ul className="space-y-1 text-slate-400">
            <li>
              Versi Aplikasi: <span>v1.0.0</span>
            </li>
            <li>
              Firmware: <span>{activeDevice?.metadata?.fw || '—'}</span>
            </li>
            <li>
              IP Perangkat: <span>{activeDevice?.metadata?.ip || '—'}</span>
            </li>
          </ul>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span>{activeDevice?.metadata?.status || '—'}</span>
            </span>
            <span className="opacity-50">•</span>
            <span>Diperbarui otomatis</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-6 text-xs text-slate-400 flex items-center justify-between">
        <p>
          © <span>{currentYear}</span> <span className="text-slate-200 font-medium">SitSense</span> — Project IoT
        </p>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:underline">
            Privasi
          </a>
          <a href="#" className="hover:underline">
            Lisensi
          </a>
          <a href="#" className="hover:underline">
            Kontak
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

