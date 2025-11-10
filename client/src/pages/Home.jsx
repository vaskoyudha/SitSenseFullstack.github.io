import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Info, 
  Activity, 
  Sparkles, 
  BarChart2,
  Monitor,
  Zap,
  Smartphone,
  Database,
  Wifi,
  Cpu,
  Signal
} from 'lucide-react';
import WelcomeModal from '../components/Common/WelcomeModal';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b1220]">
      <WelcomeModal autoHideMs={2200} onlyOncePerSession={true} chime={false} />
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
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-emerald-500/20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        {/* Floating Decorative Elements */}
        {/* Top Left */}
        <div className="floating-element slow" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))' }}>
            <Activity className="h-10 w-10 md:h-12 md:w-12 text-cyan-300" />
          </div>
        </div>
        
        {/* Top Right */}
        <div className="floating-element reverse fast" style={{ top: '15%', right: '8%', animationDelay: '1s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.2))' }}>
            <Monitor className="h-8 w-8 md:h-10 md:w-10 text-purple-300" />
          </div>
        </div>
        
        {/* Middle Left */}
        <div className="floating-element" style={{ top: '50%', left: '3%', animationDelay: '2s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))' }}>
            <Zap className="h-8 w-8 md:h-10 md:w-10 text-emerald-300" />
          </div>
        </div>
        
        {/* Middle Right */}
        <div className="floating-element reverse slow" style={{ top: '45%', right: '5%', animationDelay: '1.5s' }}>
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(139, 92, 246, 0.25))' }}>
            <Smartphone className="h-10 w-10 md:h-14 md:w-14 text-cyan-400" />
          </div>
        </div>
        
        {/* Bottom Left */}
        <div className="floating-element fast" style={{ bottom: '15%', left: '8%', animationDelay: '0.5s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.2))' }}>
            <Database className="h-8 w-8 md:h-10 md:w-10 text-purple-300" />
          </div>
        </div>
        
        {/* Bottom Right */}
        <div className="floating-element reverse" style={{ bottom: '10%', right: '3%', animationDelay: '2.5s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))' }}>
            <Wifi className="h-8 w-8 md:h-10 md:w-10 text-emerald-300" />
          </div>
        </div>
        
        {/* Center Left (Small) */}
        <div className="floating-element slow" style={{ top: '30%', left: '12%', animationDelay: '3s' }}>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))' }}>
            <Cpu className="h-6 w-6 md:h-8 md:w-8 text-cyan-200" />
          </div>
        </div>
        
        {/* Center Right (Small) */}
        <div className="floating-element reverse fast" style={{ top: '35%', right: '12%', animationDelay: '1.8s' }}>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg glassy-card card-border flex items-center justify-center floating-glow" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(16, 185, 129, 0.15))' }}>
            <Signal className="h-6 w-6 md:h-8 md:w-8 text-purple-200" />
          </div>
        </div>
        
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

