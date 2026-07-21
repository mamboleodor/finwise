import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              monthly_income: monthlyIncome,
            }
          }
        });
        if (error) throw error;
        onLogin(data.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #194342 0%, #1a5451 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ color: 'white' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Welcome back</h1>
          <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Access your FinWise dashboard</p>
        </div>
      </div>

      <div style={{ background: '#dae8b3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 8px', color: '#194342', letterSpacing: '-0.5px' }}>
            {isLogin ? 'Welcome back' : 'Start tracking'}
          </h1>
          <p style={{ fontSize: '14px', color: '#194342', opacity: 0.8, margin: '0 0 24px' }}>
            {isLogin ? 'Sign in to your account' : 'Create your FinWise account'}
          </p>

          {error && (
            <div style={{ background: 'rgba(226, 75, 74, 0.1)', border: '1px solid #E24B4A', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#E24B4A', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }}
              required
            />

            {!isLogin && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }}
                required
              />
            )}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }}
              required
            />

            {!isLogin && (
              <>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="Monthly income (KES)"
                  style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }}
                  required
                />
                <p style={{ fontSize: '11px', color: 'rgba(25, 67, 66, 0.6)', margin: '0' }}>We'll use this to personalize your dashboard</p>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px 20px', background: '#194342', color: '#dae8b3', border: 'none', borderRadius: '8px', fontWeight: '500', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#194342' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#194342', fontSize: '13px' }}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;