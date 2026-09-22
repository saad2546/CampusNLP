import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

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

        <div className="auth-title">Create Account</div>
        <div className="auth-tagline">Join APSIT Grievance portal for student support or admin triage.</div>
        
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
              <option value="student">🎓 Student Account</option>
              <option value="admin">🛡️ Administrator / Faculty Account</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 10, padding: '12px' }}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight size={16} />
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
