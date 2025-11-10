import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-12 bg-[#0b1220]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/assets/img/logo-sitsense.svg" alt="SitSense" className="h-8 w-auto" />
              <span className="text-xl font-bold">SitSense</span>
            </div>
            <p className="text-sm text-slate-400">
              Sistem pemantauan postur duduk cerdas untuk kesehatan yang lebih baik.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-cyan-300 transition-colors">Features</a></li>
              <li><a href="#solutions" className="hover:text-cyan-300 transition-colors">Solutions</a></li>
              <li><Link to="/dashboard" className="hover:text-cyan-300 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#learn" className="hover:text-cyan-300 transition-colors">Learn</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors">Help</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors">About</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#contact" className="hover:text-cyan-300 transition-colors">Contact Us</a></li>
              <li><a href="#for-teams" className="hover:text-cyan-300 transition-colors">For Teams</a></li>
              <li><a href="#for-developers" className="hover:text-cyan-300 transition-colors">For Developers</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm text-slate-400">
          <p>© <span className="text-slate-200 font-medium">SitSense</span> — Project IoT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
