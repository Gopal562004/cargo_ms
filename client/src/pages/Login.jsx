import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, AlertCircle, Sun, Moon, ArrowLeft, ArrowRight, ShieldCheck, Plane, Radio, Terminal } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveUtc, setLiveUtc] = useState('');
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => setLiveUtc(new Date().toUTCString().replace('GMT', 'UTC'));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data?.user?.name || 'User'}!`);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Invalid username/email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none transition-colors duration-150 ${
        theme === 'light' ? 'text-slate-900 bg-slate-100' : 'text-slate-100 bg-[#060a12]'
      }`}
    >
      {/* Rich Atmospheric Cargo Background Image with Adaptive Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/cargo_freighter.jpg"
          alt="Cargo Freighter Runway"
          className="w-full h-full object-cover object-center scale-105 filter blur-[2px] transition-transform duration-1000"
        />
        {/* Dark & Light Theme Contrast Overlays */}
        <div
          className={`absolute inset-0 transition-colors ${
            theme === 'light'
              ? 'bg-gradient-to-b from-slate-100/90 via-slate-100/85 to-slate-200/95'
              : 'bg-gradient-to-b from-[#060a12]/92 via-[#060a12]/88 to-[#090d16]/96'
          }`}
        />
        {/* Subtle Technical Grid Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Bar (Z-10) */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          to="/landing"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded border text-xs font-mono backdrop-blur-md transition-all shadow-xs ${
            theme === 'light'
              ? 'bg-white/90 border-slate-300 text-slate-800 hover:bg-white'
              : 'bg-slate-900/85 border-slate-700/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ArrowLeft size={13} /> LANDING PAGE
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded border text-[11px] font-mono backdrop-blur-md bg-slate-900/60 border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DISPATCH GATEWAY: ONLINE</span>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded border text-xs font-mono flex items-center justify-center cursor-pointer backdrop-blur-md transition-all shadow-xs ${
              theme === 'light'
                ? 'bg-white/90 border-slate-300 text-slate-800 hover:bg-white'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-200 hover:bg-slate-800'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Main Login Console Card (Z-10) */}
      <div className="relative z-10 max-w-sm mx-auto w-full my-auto py-6">
        <div
          className={`p-7 sm:p-8 rounded border backdrop-blur-xl transition-all space-y-6 ${
            theme === 'light'
              ? 'bg-white/95 border-slate-300 shadow-2xl shadow-slate-400/20'
              : 'bg-[#0b101c]/95 border-slate-800/90 shadow-2xl shadow-black/80'
          }`}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                <Package size={18} />
              </div>
              <div>
                <span className="font-semibold text-sm tracking-wider uppercase leading-none block">
                  Cargo<span className="text-indigo-500">Hub</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Logistics OS
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v2.5.0
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">Operator Sign In</h1>
            <p className="text-xs text-slate-400 font-mono">Authenticate to access dispatch board</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-400 flex items-center gap-2 animate-fade-in-up">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Operator Username / Email"
              type="text"
              placeholder="e.g. operator or admin@dgrlogistics.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail size={15} />}
            />

            <Input
              label="Security Access Key"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock size={15} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="rounded font-mono text-xs font-bold mt-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              SIGN IN TO CONSOLE <ArrowRight size={14} className="ml-1" />
            </Button>
          </form>

          <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/30">
            <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-400" /> Secure Access</span>
            <span>256-BIT TLS</span>
          </div>
        </div>
      </div>

      {/* Footer Info (Z-10) */}
      <div className="relative z-10 text-center font-mono text-[11px] text-slate-400 flex items-center justify-center gap-3">
        <span>CARGOHUB OS</span>
        <span>·</span>
        <span>UTC: {liveUtc || 'SYNCING...'}</span>
      </div>
    </div>
  );
}
