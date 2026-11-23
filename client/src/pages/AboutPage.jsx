import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sun,
  Moon,
  Laptop,
  Database,
  Printer,
  Sparkles,
  Download,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import DownloadModal from '../components/ui/DownloadModal';

const WHATSAPP_NUMBER = '8237742040';
const WHATSAPP_URL = `https://wa.me/91${WHATSAPP_NUMBER}?text=Hello%20Gopal%2C%20I%20am%20interested%20in%20CargoMS%20and%20custom%20software%20development.`;
const PERSONAL_WEBSITE_URL = 'https://www.gopalgawas.online/';

export default function AboutPage() {
  const { theme, toggleTheme } = useThemeStore();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [liveUtc, setLiveUtc] = useState('');

  useEffect(() => {
    const updateTime = () => setLiveUtc(new Date().toUTCString().replace('GMT', 'UTC'));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen relative font-sans antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-150 ${
        theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#060a12] text-slate-100'
      }`}
    >
      {/* Background Graphic Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/cargo_freighter.jpg"
          alt="Cargo Logistics Infrastructure"
          className="w-full h-full object-cover object-center scale-105 filter blur-[3px] opacity-40 transition-transform duration-1000"
        />
        <div
          className={`absolute inset-0 transition-colors ${
            theme === 'light'
              ? 'bg-slate-100/95'
              : 'bg-[#060a12]/95'
          }`}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top Status Bar */}
      <div
        className={`border-b text-[11px] font-mono py-2 px-6 flex items-center justify-between z-50 relative backdrop-blur-md transition-colors ${
          theme === 'light' ? 'bg-white/80 border-slate-200 text-slate-600' : 'bg-[#070b13]/85 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-500 tracking-wider">ABOUT CARGOMS & DEVELOPER</span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="hidden sm:inline font-mono">{liveUtc || 'UTC TIME'}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1 rounded border text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors backdrop-blur-md ${
              theme === 'light'
                ? 'bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-100'
                : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {theme === 'dark' ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-indigo-600" />}
            <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
          </button>
        </div>
      </div>

      {/* Main Nav Header */}
      <header
        className={`border-b sticky top-0 z-40 backdrop-blur-xl transition-colors ${
          theme === 'light' ? 'bg-white/85 border-slate-200 shadow-xs' : 'bg-[#090d16]/85 border-slate-800'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Package size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-wider uppercase leading-tight">
                Cargo<span className="text-indigo-600">Hub</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Logistics OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono">
            <Link to="/landing#overview" className="hover:text-indigo-500 transition-colors">OPERATIONS</Link>
            <Link to="/landing#templates" className="hover:text-indigo-500 transition-colors">TEMPLATES</Link>
            <Link to="/product-tour" className="hover:text-indigo-500 transition-colors">HOW IT WORKS</Link>
            <Link to="/about" className="text-indigo-500 font-bold border-b border-indigo-500 pb-0.5">ABOUT</Link>
            <Link to="/landing#calculator" className="hover:text-indigo-500 transition-colors">PRICING</Link>
          </nav>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className={`px-3 py-1.5 rounded border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-xs'
                  : 'bg-indigo-950/40 border-indigo-800/80 text-indigo-300 hover:bg-indigo-900/60 shadow-xs'
              }`}
            >
              <Download size={13} className="text-indigo-500" />
              <span>DOWNLOAD APP</span>
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <MessageCircle size={14} />
              <span>WHATSAPP</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16">
        {/* Hero Title & Mission */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-mono border border-indigo-500/40 bg-indigo-500/10 text-indigo-400">
            <ShieldCheck size={13} />
            <span>ENTERPRISE LOGISTICS SOFTWARE & BESPOKE DEVELOPMENT</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            About <span className="text-indigo-500">CargoMS</span> & The Creator
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed font-normal">
            CargoMS (CargoHub OS) is an enterprise-grade freight document management and billing platform engineered for high-throughput cargo operations, air forwarders, and logistics operators.
          </p>
        </div>

        {/* Developer Profile Card */}
        <div
          className={`p-7 md:p-9 rounded-sm border transition-all ${
            theme === 'light'
              ? 'bg-white border-slate-200 shadow-md'
              : 'bg-slate-900/80 border-slate-800 shadow-xl'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Avatar & Quick Badges */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
              {/* Executive Developer & Solutions Architect Emblem */}
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-sm flex flex-col items-center justify-center relative shadow-lg transition-all ${
                    theme === 'light'
                      ? 'bg-slate-900 text-slate-100 border border-slate-800'
                      : 'bg-[#080d19] text-slate-100 border border-slate-700/80 shadow-black/80'
                  }`}
                >
                  {/* Precision Corner Tech Brackets */}
                  <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-indigo-500" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-indigo-500" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-indigo-500" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-indigo-500" />

                  {/* Core Icon Mark */}
                  <div className="w-11 h-11 rounded-sm bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1">
                    <Code2 size={24} />
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-300 tracking-widest uppercase">
                    ARCHITECT
                  </span>
                </div>

                {/* Verified Status Badge */}
                <div className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-2 py-0.5 rounded-xs bg-[#0b101c] border border-emerald-500/40 flex items-center gap-1 text-[9px] font-mono text-emerald-400 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">VERIFIED</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <h2 className="text-xl font-bold tracking-tight">Gopal Gawas</h2>
                <p className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                  Software Developer & Solutions Architect
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
                  <MapPin size={13} className="text-rose-500 shrink-0" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={PERSONAL_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-sm bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Globe size={13} />
                  <span>Portfolio Website</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Right: Detailed Bio & Direct Contact Details */}
            <div className="md:col-span-8 space-y-6 md:border-l md:border-slate-800/80 md:pl-8">
              <div className="space-y-3">
                <h3 className="text-lg font-bold tracking-tight">Meet the Developer</h3>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  Hi, I am <strong className="text-slate-200 font-semibold">Gopal Gawas</strong>, a passionate software developer based in Mumbai, Maharashtra. I specialize in designing and engineering high-reliability desktop and cloud systems, scalable backend architectures, and streamlined business software for complex industries like freight logistics, supply chain, and commercial billing.
                </p>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  CargoMS was built from the ground up to solve the real daily friction freight operators face: handling complex IATA Dangerous Goods packaging, multi-slab GST tax invoicing, carrier ledgers, and zero-latency offline document issuing at airport terminals.
                </p>
              </div>

              {/* Direct Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={`tel:+91${WHATSAPP_NUMBER}`}
                  className={`p-3 rounded-sm border flex items-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-800'
                      : 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/40 text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Phone size={15} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Direct Phone</span>
                    <span className="text-xs font-mono font-bold truncate block">+91 {WHATSAPP_NUMBER}</span>
                  </div>
                </a>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-sm border flex items-center gap-3 transition-colors ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-800'
                      : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle size={15} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Direct WhatsApp</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 truncate block">+91 {WHATSAPP_NUMBER}</span>
                  </div>
                </a>

                <a
                  href={PERSONAL_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-sm border flex items-center gap-3 transition-colors sm:col-span-2 ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-800'
                      : 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/40 text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Globe size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Personal Portfolio & Projects</span>
                    <span className="text-xs font-mono font-bold text-indigo-400 truncate block">{PERSONAL_WEBSITE_URL}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-500 mr-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized & Custom Software Development Section */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Personalized & Custom Software Development
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Need tailored software for your company? I engineer custom applications built to exact business workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-6 rounded-sm border space-y-3 ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-9 h-9 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Laptop size={18} />
              </div>
              <h3 className="font-bold text-base">Custom ERP & Logistics Softwares</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tailor-made freight forwarding, ocean cargo, warehouse inventory, and dispatch systems designed specifically for your company's processes.
              </p>
            </div>

            <div
              className={`p-6 rounded-sm border space-y-3 ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-9 h-9 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-bold text-base">GST Billing & Accounting Systems</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated multi-slab tax invoicing, e-Way bill compliance, customer statement reconciliation, and vendor expense ledger engines.
              </p>
            </div>

            <div
              className={`p-6 rounded-sm border space-y-3 ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-9 h-9 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Cpu size={18} />
              </div>
              <h3 className="font-bold text-base">Offline-First Desktop Applications</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fast native Windows and macOS applications with local data storage, direct thermal barcode printer integrations, and cloud auto-sync.
              </p>
            </div>
          </div>

          {/* CTA Banner to Discuss Custom Projects */}
          <div
            className={`p-7 rounded-sm border text-center space-y-4 max-w-2xl mx-auto ${
              theme === 'light'
                ? 'bg-slate-50 border-indigo-300'
                : 'bg-slate-900/90 border-indigo-800/80'
            }`}
          >
            <h3 className="text-xl font-bold tracking-tight">Have a Software Requirement or Custom Feature in Mind?</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Connect with me directly on WhatsApp to discuss your software requirements, get an operator access key, or commission personalized custom features.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp (+91 {WHATSAPP_NUMBER})</span>
              </a>
              <a
                href={PERSONAL_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-auto px-5 py-2.5 rounded-sm border font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Globe size={14} />
                <span>Visit Portfolio</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer
        className={`relative z-10 py-10 px-6 max-w-6xl mx-auto font-mono text-xs border-t ${
          theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-400'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              <Package size={12} />
            </div>
            <span className="font-bold tracking-wider uppercase">CargoHub OS</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/landing" className="hover:text-indigo-400">HOME</Link>
            <Link to="/product-tour" className="hover:text-indigo-400">HOW IT WORKS</Link>
            <Link to="/about" className="text-indigo-400 font-bold">ABOUT</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold">
              WHATSAPP
            </a>
            <Link to="/login" className="hover:text-indigo-400">LOGIN</Link>
          </div>

          <p className="text-[11px] text-slate-400">
            Developed by Gopal Gawas · Mumbai, Maharashtra
          </p>
        </div>
      </footer>

      {/* Download Modal */}
      <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
    </div>
  );
}
