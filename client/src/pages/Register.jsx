import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, Mail, Building, Phone, AlertCircle, Sun, Moon, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Send, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useThemeStore } from '../store/themeStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveUtc, setLiveUtc] = useState('');
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => setLiveUtc(new Date().toUTCString().replace('GMT', 'UTC'));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Access request submitted! The administrator will issue your credentials.');
    }, 600);
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none transition-colors duration-150 ${
        theme === 'light' ? 'text-slate-900 bg-slate-100' : 'text-slate-100 bg-[#060a12]'
      }`}
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/cargo_freighter.jpg"
          alt="Cargo Freighter Runway"
          className="w-full h-full object-cover object-center scale-105 filter blur-[2px] opacity-40"
        />
        <div
          className={`absolute inset-0 transition-colors ${
            theme === 'light'
              ? 'bg-gradient-to-b from-slate-100/95 via-slate-100/90 to-slate-200/98'
              : 'bg-gradient-to-b from-[#060a12]/95 via-[#060a12]/90 to-[#090d16]/98'
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

      {/* Main Card (Z-10) */}
      <div className="relative z-10 max-w-md mx-auto w-full my-auto py-6">
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
              ACCESS DESK
            </span>
          </div>

          {!submitted ? (
            <>
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight">Request Operator Access</h1>
                <p className="text-xs text-slate-400 font-mono">
                  Accounts are provisioned by the administrator. Submit your details below to receive your operator login.
                </p>
              </div>

              <form className="space-y-3.5" onSubmit={handleSubmit}>
                <Input
                  label="Contact Name"
                  placeholder="e.g. Mayur Sharma"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                  icon={<User size={15} />}
                />

                <Input
                  label="Business Email"
                  type="email"
                  placeholder="e.g. mayur@dgrlogistics.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                  icon={<Mail size={15} />}
                />

                <Input
                  label="Phone / WhatsApp Number"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  required
                  icon={<Phone size={15} />}
                />

                <Input
                  label="Freight Agency / Company Name"
                  placeholder="e.g. Global Freight Logistics Ltd"
                  value={form.company}
                  onChange={handleChange('company')}
                  required
                  icon={<Building size={15} />}
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-mono font-medium text-slate-300">
                    Required Modules / Notes (Optional)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Need Air Freight MAWB + GST Invoicing for 3 operators"
                    value={form.notes}
                    onChange={handleChange('notes')}
                    className={`w-full p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 ${
                      theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : ''
                    }`}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={loading}
                  className="rounded font-mono text-xs font-bold mt-2 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  SUBMIT ACCESS REQUEST <Send size={13} className="ml-1.5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-4 font-mono animate-fade-in">
              <div className="w-12 h-12 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-100">Request Received!</h2>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-200">{form.name}</strong>. Your agency profile has been sent to the CargoHub dispatch administrator.
                </p>
                <p className="text-[11px] text-indigo-400 pt-1">
                  We will contact you at <strong className="text-slate-300">{form.email}</strong> with your login pass.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/40">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs block transition-colors"
                >
                  GO TO OPERATOR SIGN IN →
                </Link>
              </div>
            </div>
          )}

          <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/30">
            <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-400" /> Admin Provisioned</span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
              Already have credentials? Sign in →
            </Link>
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
