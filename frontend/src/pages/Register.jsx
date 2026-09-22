import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError('Failed to register: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card animate-fade-in-up">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#072418',
          }}>
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#f3f4f6' }}>
              APSIT Portal
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Complaint Analyzer
            </div>
          </div>
        </div>

        <div className="auth-title">Create Account</div>
        <div className="auth-tagline">Register for student grievance filing or faculty admin role.</div>
        
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Rahul Sharma"
              value={name} 
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="student@apsit.edu.in"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Minimum 6 characters"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student Account</option>
              <option value="admin">Administrator / Faculty Account</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 8, padding: '11px' }}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="divider"></div>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already registered? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
