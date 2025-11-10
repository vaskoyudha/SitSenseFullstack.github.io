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
  Signal,
  Bell,
  Volume2,
  Cloud,
  User,
  Users,
  Stethoscope,
  Check,
  Code,
  BookOpen,
  Mail,
  GraduationCap,
  Video,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Shield,
  Gauge,
  ExternalLink,
  MessageCircle,
  Send
} from 'lucide-react';
import WelcomeModal from '../components/Common/WelcomeModal';
import Footer from '../components/Layout/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b1220]">
      <WelcomeModal autoHideMs={2200} onlyOncePerSession={true} chime={false} />
      {/* Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-[9999] border-b border-white/10 bg-[#0b1220]/95 backdrop-blur-xl"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(11, 18, 32, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          visibility: 'visible',
          opacity: 1,
          display: 'block'
        }}
      >
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
      <section id="features" className="py-20 md:py-32 bg-[#0b1220]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Fitur Unggulan
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Temukan berbagai fitur canggih yang membantu Anda menjaga postur duduk yang sehat
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitoring Real-time</h3>
              <p className="text-slate-400 text-sm">Pantau postur duduk Anda secara real-time dengan sensor tekanan cerdas yang akurat dan responsif.</p>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p className="text-slate-400 text-sm">Dapatkan rekomendasi personal dari AI berbasis Gemini untuk memperbaiki postur Anda.</p>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-emerald-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Lengkap</h3>
              <p className="text-slate-400 text-sm">Akses statistik detail, riwayat sesi, dan laporan komprehensif tentang kebiasaan duduk Anda.</p>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Alerts</h3>
              <p className="text-slate-400 text-sm">Notifikasi cerdas saat postur buruk terdeteksi atau durasi duduk melebihi ambang batas.</p>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-rose-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Text-to-Speech</h3>
              <p className="text-slate-400 text-sm">Dengarkan rekomendasi AI dengan suara natural menggunakan Google Text-to-Speech.</p>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-4">
                <Cloud className="h-6 w-6 text-violet-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cloud Sync</h3>
              <p className="text-slate-400 text-sm">Sinkronisasi data dengan Firebase untuk akses multi-device dan backup otomatis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 md:py-32 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Solusi untuk Setiap Kebutuhan
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Dari individu hingga tim, temukan solusi yang tepat untuk Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glassy-card card-border p-8 hover:border-cyan-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Untuk Individu</h3>
                <User className="h-8 w-8 text-cyan-300" />
              </div>
              <p className="text-slate-400 mb-4">
                Solusi personal untuk menjaga postur duduk sehat di rumah atau kantor. Pantau kebiasaan duduk Anda dan dapatkan insight untuk hidup yang lebih sehat.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Monitoring real-time
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Rekomendasi AI personal
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Dashboard analytics
                </li>
              </ul>
            </div>
            
            <div className="glassy-card card-border p-8 hover:border-purple-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Untuk Tim</h3>
                <Users className="h-8 w-8 text-purple-300" />
              </div>
              <p className="text-slate-400 mb-4">
                Kelola kesehatan postur seluruh tim dengan dashboard terpusat. Pantau statistik tim dan tingkatkan produktivitas dengan postur yang lebih baik.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Multi-user management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Team analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Customizable alerts
                </li>
              </ul>
            </div>
            
            <div className="glassy-card card-border p-8 hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Untuk Klinik</h3>
                <Stethoscope className="h-8 w-8 text-emerald-300" />
              </div>
              <p className="text-slate-400 mb-4">
                Solusi profesional untuk klinik fisioterapi dan kesehatan. Pantau progress pasien dan berikan rekomendasi berbasis data.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Patient tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Progress reports
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Export data
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Learn Section */}
      <section id="learn" className="py-20 md:py-32 bg-[#0b1220]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Pelajari Lebih Lanjut
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Tingkatkan pengetahuan Anda tentang postur duduk yang sehat
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Panduan Pengguna</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Pelajari cara menggunakan SitSense dengan efektif. Dari setup awal hingga interpretasi data.
                  </p>
                  <a href="#" className="text-cyan-300 hover:text-cyan-200 text-sm font-medium inline-flex items-center gap-1">
                    Baca panduan <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tips Postur Sehat</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Pelajari teknik dan tips untuk menjaga postur duduk yang baik untuk kesehatan jangka panjang.
                  </p>
                  <a href="#" className="text-purple-300 hover:text-purple-200 text-sm font-medium inline-flex items-center gap-1">
                    Pelajari lebih lanjut <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Video className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Video Tutorial</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Tonton video tutorial step-by-step untuk memahami fitur-fitur SitSense dengan lebih mudah.
                  </p>
                  <a href="#" className="text-emerald-300 hover:text-emerald-200 text-sm font-medium inline-flex items-center gap-1">
                    Tonton video <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="glassy-card card-border p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">FAQ</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Temukan jawaban untuk pertanyaan yang sering diajukan tentang SitSense dan fitur-fiturnya.
                  </p>
                  <a href="#" className="text-yellow-300 hover:text-yellow-200 text-sm font-medium inline-flex items-center gap-1">
                    Lihat FAQ <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Teams Section */}
      <section id="for-teams" className="py-20 md:py-32 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Untuk Tim
              </h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Bawa ide terbaik tim Anda ke kehidupan dengan suite kreatif AI-first yang dirancang untuk kolaborasi dan dibangun untuk bisnis.
              </p>
            </div>
            
            <div className="glassy-card card-border p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4">Kolaborasi Tanpa Batas</h3>
                  <p className="text-slate-300 mb-6">
                    Kelola kesehatan postur seluruh tim dari satu dashboard terpusat. Pantau statistik tim, setel target bersama, dan tingkatkan produktivitas dengan postur yang lebih baik.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Dashboard tim dengan multi-user support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Laporan dan analytics untuk seluruh tim</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Customizable alerts dan notifikasi tim</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Role-based access control</span>
                    </li>
                  </ul>
                  <Link to="/register" className="btn btn-gradient-primary normal-case relative">
                    <span className="relative z-10">Mulai dengan Tim</span>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glassy-card card-border p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-2">100+</div>
                    <div className="text-xs text-slate-400">Tim Aktif</div>
                  </div>
                  <div className="glassy-card card-border p-4 text-center">
                    <div className="text-3xl font-bold text-purple-300 mb-2">50K+</div>
                    <div className="text-xs text-slate-400">Data Points</div>
                  </div>
                  <div className="glassy-card card-border p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-300 mb-2">98%</div>
                    <div className="text-xs text-slate-400">Kepuasan</div>
                  </div>
                  <div className="glassy-card card-border p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-300 mb-2">24/7</div>
                    <div className="text-xs text-slate-400">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Developers Section */}
      <section id="for-developers" className="py-20 md:py-32 bg-[#0b1220]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Untuk Developer
              </h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Alami keunggulan pembuatan konten dengan API SitSense. Dengan skalabilitas yang tak tertandingi, sesuaikan output dengan mudah sesuai pedoman merek Anda.
              </p>
            </div>
            
            <div className="glassy-card card-border p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-[#0b1220] rounded-lg p-4 mb-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <pre className="text-xs text-slate-300 overflow-x-auto"><code>{`// Example API Call
const response = await fetch(
  'https://api.sitsense.com/v1/posture',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sensor_data: {...},
      user_id: 'user123'
    })
  }
);`}</code></pre>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-3xl font-bold mb-4">API yang Powerful</h3>
                  <p className="text-slate-300 mb-6">
                    Integrasikan SitSense ke dalam aplikasi Anda dengan API RESTful yang mudah digunakan. Akses data real-time, analytics, dan fitur AI dengan beberapa baris kode.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <Code className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">RESTful API dengan dokumentasi lengkap</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Real-time WebSocket support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Secure authentication dengan OAuth 2.0</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Gauge className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">High scalability dan rate limiting</span>
                    </li>
                  </ul>
                  <a href="#" className="btn btn-gradient-outline normal-case relative inline-flex items-center gap-2">
                    <span className="relative z-10">Lihat Dokumentasi API</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Hubungi Kami
              </h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Punya pertanyaan? Kami siap membantu Anda
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glassy-card card-border p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-cyan-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-slate-400 text-sm mb-4">Kirim email untuk pertanyaan umum</p>
                <a href="mailto:support@sitsense.com" className="text-cyan-300 hover:text-cyan-200">
                  support@sitsense.com
                </a>
              </div>
              
              <div className="glassy-card card-border p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
                <p className="text-slate-400 text-sm mb-4">Chat langsung dengan tim support</p>
                <a href="#" className="text-purple-300 hover:text-purple-200">
                  Mulai Chat
                </a>
              </div>
            </div>
            
            <div className="glassy-card card-border p-8">
              <h3 className="text-2xl font-semibold mb-4 text-center">Kirim Pesan</h3>
              <form className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text text-slate-300">Nama</span>
                  </label>
                  <input type="text" placeholder="Nama Anda" className="input input-bordered w-full bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-slate-300">Email</span>
                  </label>
                  <input type="email" placeholder="email@example.com" className="input input-bordered w-full bg-white/5 border-white/10" />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-slate-300">Pesan</span>
                  </label>
                  <textarea className="textarea textarea-bordered w-full bg-white/5 border-white/10" placeholder="Tulis pesan Anda di sini..." rows="4"></textarea>
                </div>
                <button type="submit" className="btn btn-gradient-primary w-full normal-case relative inline-flex items-center justify-center gap-2">
                  <Send className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Kirim Pesan</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;

