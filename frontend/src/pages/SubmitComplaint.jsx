import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../services/api';

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
      // Redirect to the newly created complaint details page
      navigate(`/complaints/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 className="page-title">Submit Complaint</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        Please describe your issue in detail. Our NLP system will automatically categorize and prioritize it.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '30px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        <div className="form-group">
          <label className="form-label">Complaint Title</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Computers not working in Lab 3"
            value={title} 
            onChange={e => setTitle(e.target.value)}
            required 
            minLength={5}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="form-textarea" 
            placeholder="Provide as much detail as possible (location, when the issue started, etc.)..."
            value={description} 
            onChange={e => setDescription(e.target.value)}
            required 
            minLength={20}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
            {description.length} characters (min 20)
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Target Department (Optional)</label>
          <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">Let the system automatically determine</option>
            <option value="Maintenance">Maintenance</option>
            <option value="IT Department">IT Department</option>
            <option value="Exam Cell">Exam Cell</option>
            <option value="Library">Library</option>
            <option value="Administration">Administration</option>
          </select>
        </div>

        <div className="divider" style={{ margin: '10px 0' }}></div>

        <div className="flex justify-between items-center">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Attachments can be added later.
          </span>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing & Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
