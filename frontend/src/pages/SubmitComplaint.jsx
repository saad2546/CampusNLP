import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { submitComplaint } from '../services/api';
import { ArrowLeft, Send, CheckCircle2, Cpu } from 'lucide-react';

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
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 18, display: 'inline-flex', gap: 6 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.74rem', fontWeight: 600, marginBottom: 8 }}>
          NLP Routing Active
        </div>
        <h1 className="page-title">Submit a Grievance</h1>
        <p className="page-subtitle">
          Describe the problem clearly. The system will categorize department, prioritize urgency, and route it automatically.
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        <div className="form-group">
          <label className="form-label">Grievance Title</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. WiFi connection drops repeatedly in Lab 304"
            value={title} 
            onChange={e => setTitle(e.target.value)}
            required 
            minLength={5}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <div className="flex justify-between items-center">
            <label className="form-label">Detailed Description</label>
            <span style={{ 
              fontSize: '0.75rem', 
              color: description.length >= 20 ? '#34d399' : 'var(--text-muted)',
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
            placeholder="Include specific room/lab numbers, times, error messages, and how it impacts your activities..."
            value={description} 
            onChange={e => setDescription(e.target.value)}
            required 
            minLength={20}
            style={{ minHeight: 130 }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Department (Optional)</label>
          <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">Auto-detect via NLP Classifier (Recommended)</option>
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
          background: '#14161b',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          <Cpu size={20} color="#34d399" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.5 }}>
            <strong style={{ color: '#e5e7eb' }}>Automated Analysis:</strong> Text will be parsed using TF-IDF classification and VADER sentiment to determine urgency and prevent duplicate tickets.
          </div>
        </div>

        <div className="divider" style={{ margin: '4px 0' }} />

        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Ticket will be reviewed by department administrators.
          </span>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 170 }}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
