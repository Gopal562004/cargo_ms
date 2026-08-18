import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, User, Mail, Lock, Building, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.message || 'Registration failed';
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Create Account</h2>
            <p className="text-xs text-slate-400">Get started with your freight document management</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-400 flex items-center gap-2 animate-fade-in-up">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <Input label="Full Name" value={form.name} onChange={handleChange('name')} required icon={<User size={16} />} />
          <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required icon={<Mail size={16} />} />
          <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} required icon={<Lock size={16} />} />
          <Input label="Company (optional)" value={form.company} onChange={handleChange('company')} icon={<Building size={16} />} />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="rounded">
            Create Account
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <p>Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
