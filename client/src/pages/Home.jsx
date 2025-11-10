import { Link } from 'react-router-dom';
import { Rocket, Info, Activity, Sparkles, BarChart2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b1220]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b1220]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/img/logo-sitsense.svg" alt="SitSense" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-tight">SitSense</span>
          </div>
          <Link to="/login" className="btn btn-gradient-primary normal-case px-6">
            <span>Masuk</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 flex items-center pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-emerald-500/20 pointer-events-none"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto w-full px-4 py-12">
          <div className="mb-6 flex justify-center">
            <img src="/assets/img/logo-sitsense.svg" alt="SitSense Logo" className="h-16 md:h-20 w-auto" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent leading-tight">
            Kesehatan Postur,<br/>Dilepaskan.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300/90 mb-4 leading-relaxed max-w-2xl mx-auto">
            Manfaatkan teknologi IoT cerdas dengan rangkaian alat monitoring unik untuk menjaga postur duduk Anda tetap optimal dan sehat sepanjang hari.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link to="/register" className="btn btn-gradient-primary normal-case px-8 py-3 text-base font-semibold">
              <Rocket className="h-5 w-5 mr-2" />
              Mulai Sekarang
            </Link>
            <Link to="/login" className="btn btn-outline normal-case px-8 py-3 text-base font-semibold">
              <Info className="h-5 w-5 mr-2" />
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-[#0b1220]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Fitur Unggulan
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glassy-card card-border p-6">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitoring Real-time</h3>
              <p className="text-slate-400 text-sm">Pantau postur duduk Anda secara real-time dengan sensor tekanan cerdas yang akurat dan responsif.</p>
            </div>
            
            <div className="glassy-card card-border p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p className="text-slate-400 text-sm">Dapatkan rekomendasi personal dari AI berbasis Gemini untuk memperbaiki postur Anda.</p>
            </div>
            
            <div className="glassy-card card-border p-6">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-emerald-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Lengkap</h3>
              <p className="text-slate-400 text-sm">Akses statistik detail, riwayat sesi, dan laporan komprehensif tentang kebiasaan duduk Anda.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

