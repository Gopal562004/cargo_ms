import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

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
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-md shadow-xl p-8 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
              <Plane size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">CargoHub OS</h1>
          </div>
          <p className="text-xs text-slate-400">Freight & Document Management Platform</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-400 flex items-center gap-2 animate-fade-in-up">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <Input
            label="Username or Email Address"
            type="text"
            placeholder="e.g. mayur52004 or user@dgrlogistics.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail size={16} />}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock size={16} />}
          />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="rounded">
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <p>Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
