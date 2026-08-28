import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, AlertCircle, Sun, Moon, ArrowLeft, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import BrandLogo from '../components/ui/BrandLogo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [loginMode, setLoginMode] = useState('CREDENTIALS'); // 'CREDENTIALS' | 'LICENSE_KEY'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
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
      let payloadIdentifier = email;
      let payloadPassword = password;

      if (loginMode === 'LICENSE_KEY') {
        payloadIdentifier = licenseKey.trim().toUpperCase();
        payloadPassword = ''; // License key validation
      }

      const data = await login(payloadIdentifier, payloadPassword);
      toast.success(`Welcome back, ${data?.user?.name || 'User'}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid login credentials or License Key';
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
        <div
          className={`absolute inset-0 transition-colors ${
            theme === 'light'
              ? 'bg-gradient-to-b from-slate-100/90 via-slate-100/85 to-slate-200/95'
              : 'bg-gradient-to-b from-[#060a12]/92 via-[#060a12]/88 to-[#090d16]/96'
          }`}
        />
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
          className={`p-7 sm:p-8 rounded border backdrop-blur-xl transition-all space-y-5 ${
            theme === 'light'
              ? 'bg-white/95 border-slate-300 shadow-2xl shadow-slate-400/20'
              : 'bg-[#0b101c]/95 border-slate-800/90 shadow-2xl shadow-black/80'
          }`}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
            <BrandLogo size="md" showText={true} subtitle="Logistics OS" />
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v2.5.0
            </span>
          </div>

          {/* Dual Login Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setLoginMode('CREDENTIALS');
                setError('');
              }}
              className={`py-1.5 rounded transition-all font-bold cursor-pointer ${
                loginMode === 'CREDENTIALS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Credentials
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('LICENSE_KEY');
                setError('');
              }}
              className={`py-1.5 rounded transition-all font-bold cursor-pointer ${
                loginMode === 'LICENSE_KEY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              License Key
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">
              {loginMode === 'CREDENTIALS' ? 'Operator Sign In' : 'Activate with License'}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {loginMode === 'CREDENTIALS'
                ? 'Authenticate with username or email'
                : 'Enter your 16-character License Key'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-400 flex items-center gap-2 animate-fade-in-up">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {loginMode === 'CREDENTIALS' ? (
              <>
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
              </>
            ) : (
              <div>
                <label className="text-xs font-mono font-medium text-slate-300 block mb-1">
                  Product License Key
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="CRGO-2026-XXXX-YYYY-ZZZZ"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 font-mono uppercase tracking-wider placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  License key provided by your CargoHub dispatch administrator.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="rounded font-mono text-xs font-bold mt-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {loginMode === 'CREDENTIALS' ? 'SIGN IN TO CONSOLE' : 'ACTIVATE SESSION'} <ArrowRight size={14} className="ml-1" />
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
