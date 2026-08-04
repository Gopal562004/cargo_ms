import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Login.css'; // Reuses auth page styles

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
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
      </div>

      <div className="auth-card animate-scale-in">
        <div className="auth-card__header">
          <div className="auth-logo">
            <div className="auth-logo__icon">✈</div>
            <h1 className="auth-logo__text">AWB Editor</h1>
          </div>
          <p className="auth-card__subtitle">Freight Document Management Platform</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-form__title">Create Account</h2>
          <p className="auth-form__desc">Get started with your freight document management</p>

          {error && (
            <div className="auth-error animate-fade-in-up">
              <span>⚠</span> {error}
            </div>
          )}

          <Input label="Full Name" value={form.name} onChange={handleChange('name')} required icon="👤" />
          <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required icon="📧" />
          <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} required icon="🔒" />
          <Input label="Company (optional)" value={form.company} onChange={handleChange('company')} icon="🏢" />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="auth-card__footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
