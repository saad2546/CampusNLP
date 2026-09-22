import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { submitComplaint } from '../services/api';
import { Sparkles, ArrowLeft, Send, CheckCircle2, Cpu } from 'lucide-react';

export function SubmitComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.length < 20) {
      setError('Description must be at least 20 characters long to allow proper NLP analysis.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await submitComplaint({ title, description, department: department || null });
      navigate(`/complaints/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 740, margin: '0 auto' }}>
      <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 20, display: 'inline-flex', gap: 6 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 9999, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 600, marginBottom: 10 }}>
          <Sparkles size={13} /> Natural Language Pipeline Enabled
        </div>
        <h1 className="page-title">Submit a Grievance</h1>
        <p className="page-subtitle">
          Describe your issue in detail. Our automated NLP models will classify category, detect priority, extract key entities, and summarize your ticket instantly.
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <div className="form-group">
          <label className="form-label">Grievance Title</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. WiFi connection keeps dropping in Lab 304"
            value={title} 
            onChange={e => setTitle(e.target.value)}
            required 
            minLength={5}
            maxLength={100}
            style={{ fontSize: '1rem' }}
          />
        </div>

        <div className="form-group">
          <div className="flex justify-between items-center">
            <label className="form-label">Detailed Description</label>
            <span style={{ 
              fontSize: '0.75rem', 
              color: description.length >= 20 ? '#10b981' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              {description.length >= 20 && <CheckCircle2 size={12} />}
              {description.length} / 20 chars minimum
            </span>
          </div>
          <textarea 
            className="form-textarea" 
            placeholder="Include specific details like room/lab numbers, time or dates, error messages, and how it impacts your studies..."
            value={description} 
            onChange={e => setDescription(e.target.value)}
            required 
            minLength={20}
            style={{ minHeight: 140 }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Department (Optional)</label>
          <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">✨ Auto-detect via NLP Classifier (Recommended)</option>
            <option value="IT Services">IT Services (Computers, Wi-Fi, Software)</option>
            <option value="Infrastructure">Infrastructure (Classrooms, AC, Lights, Water)</option>
            <option value="Academics">Academics (Timetable, Syllabus, Lectures)</option>
            <option value="Exam Cell">Exam Cell (Hall Tickets, Results, Reval)</option>
            <option value="Library">Library (Books, Digital Access, Quiet zones)</option>
            <option value="Administration">Administration (Fees, Certificates, ID Cards)</option>
          </select>
        </div>

        {/* NLP Info Card */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          <Cpu size={22} color="#818cf8" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: '#c7d2fe', lineHeight: 1.5 }}>
            <strong>AI Auto-Processing:</strong> Upon submission, TF-IDF + SGD classifiers and VADER Sentiment analysis will assign routing priority and prevent duplicate complaints automatically.
          </div>
        </div>

        <div className="divider" style={{ margin: '8px 0' }} />

        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 14 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Your complaint will be forwarded to the relevant department immediately.
          </span>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ minWidth: 200 }}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span>Running NLP Pipeline...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
