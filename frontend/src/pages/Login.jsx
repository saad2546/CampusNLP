import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card glass-card animate-fade-in-up">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }} className="gradient-text">
              APSIT NLP
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Complaint Analyzer
            </div>
          </div>
        </div>

        <div className="auth-title">Welcome Back</div>
        <div className="auth-tagline">Sign in to submit grievances or access administrative triage.</div>
        
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="student@apsit.edu.in"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 10, padding: '12px' }}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="divider"></div>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" className="auth-link">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
