import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getComplaint, withdrawComplaint, updateStatus, respondComplaint, assignComplaint } from '../services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, Send, Save, ArrowLeft, Brain, Cpu, Tag, 
  Clock, AlertTriangle, Building, User, CheckCircle2 
} from 'lucide-react';

export function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchComplaint() {
      try {
        const res = await getComplaint(id);
        setComplaint(res.data);
        setStatus(res.data.status);
        setDepartment(res.data.assignedDepartment || '');
        setAdminResponse(res.data.adminResponse || '');
      } catch (err) {
        setError('Failed to load complaint');
      } finally {
        setLoading(false);
      }
    }
    fetchComplaint();
  }, [id]);

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this complaint?')) return;
    try {
      await withdrawComplaint(id);
      navigate(role === 'admin' ? '/admin/complaints' : '/my-complaints');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to withdraw');
    }
  };

  const handleAdminUpdate = async () => {
    try {
      setSaving(true);
      if (status !== complaint.status) await updateStatus(id, status);
      if (department !== complaint.assignedDepartment) await assignComplaint(id, department);
      if (adminResponse && adminResponse !== complaint.adminResponse) await respondComplaint(id, adminResponse);
      
      const res = await getComplaint(id);
      setComplaint(res.data);
      alert('Updated successfully');
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!complaint) return <div>Complaint not found</div>;

  const backLink = role === 'admin' ? '/admin/complaints' : '/my-complaints';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 50 }}>
      {/* Top back navigation */}
      <Link to={backLink} className="btn btn-ghost btn-sm" style={{ marginBottom: 18, display: 'inline-flex', gap: 6 }}>
        <ArrowLeft size={15} /> Back to list
      </Link>

      {/* Header Banner */}
      <div className="flex justify-between items-start" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ 
              fontFamily: 'monospace', 
              fontSize: '0.8rem', 
              background: '#232731', 
              color: '#cbd5e1', 
              padding: '2px 8px', 
              borderRadius: 4,
              border: '1px solid var(--border)'
            }}>
              #{complaint.complaintId}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Submitted on {new Date(complaint.createdAt).toLocaleString()}
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>{complaint.title}</h1>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      {/* Main Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column - Complaint Content & Updates */}
        <div className="flex-col gap-5">
          {/* Main Card */}
          <div className="glass-card" style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#232731',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)'
              }}>
                <User size={16} color="#9ca3af" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f3f4f6' }}>
                  {complaint.studentName || 'Student'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Registered Grievance
                </div>
              </div>
            </div>

            <div style={{ 
              whiteSpace: 'pre-wrap', 
              color: 'var(--text-primary)', 
              lineHeight: 1.6,
              fontSize: '0.92rem',
              background: '#14161b',
              padding: '16px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              {complaint.description}
            </div>

            {/* Department info */}
            <div style={{ marginTop: 18, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <Building size={15} color="#34d399" />
                <span>Department: <strong style={{ color: '#f3f4f6' }}>{complaint.assignedDepartment || complaint.category || 'General'}</strong></span>
              </div>
            </div>
          </div>

          {/* Admin Response Card */}
          <div className="glass-card" style={{ padding: '22px 24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#f3f4f6' }}>
              <CheckCircle2 size={17} color="#10b981" /> Official Response
            </h3>
            {complaint.adminResponse ? (
              <div style={{ 
                padding: '16px 18px', 
                background: '#14161b', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '3px solid #10b981',
                border: '1px solid var(--border)',
                color: '#e5e7eb',
                lineHeight: 1.6
              }}>
                {complaint.adminResponse}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0', fontSize: '0.88rem' }}>
                No official response provided yet. The concerned department has been notified.
              </div>
            )}
          </div>

          {/* Admin Controls (Only visible to admin) */}
          {role === 'admin' && (
            <div className="glass-card" style={{ padding: '24px 26px', border: '1px solid #374151' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f3f4f6', marginBottom: 16 }}>
                Admin Action Panel
              </h3>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Department</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. IT Department"
                    value={department} 
                    onChange={e => setDepartment(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Response to Student</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Type an update or resolution note for the student..."
                  style={{ minHeight: 80 }} 
                  value={adminResponse} 
                  onChange={e => setAdminResponse(e.target.value)} 
                />
              </div>

              <button className="btn btn-primary" onClick={handleAdminUpdate} disabled={saving} style={{ gap: 8 }}>
                <Save size={15} /> {saving ? 'Saving...' : 'Save & Publish Update'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - NLP Intelligence Report */}
        <div className="flex-col gap-4">
          <div className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Brain size={16} color="#34d399" />
              <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', fontWeight: 700 }}>
                NLP Analysis
              </h3>
            </div>
            
            <div className="flex-col gap-4">
              {/* Category */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 2 }}>
                  Category
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f3f4f6' }}>{complaint.category}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{complaint.subcategory}</div>
              </div>

              {/* Priority & Sentiment */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 6 }}>
                  Urgency & Sentiment
                </div>
                <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                  <PriorityBadge priority={complaint.priority} />
                  <SentimentBadge sentiment={complaint.sentiment} />
                </div>
              </div>

              {complaint.is_duplicate && (
                <div className="alert alert-warning" style={{ fontSize: '0.76rem', padding: '8px 10px', borderRadius: 6 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>Potential duplicate detected via TF-IDF cosine similarity.</span>
                </div>
              )}

              {/* Summary */}
              <div style={{ background: '#14161b', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Cpu size={12} /> Extractive Summary
                </div>
                <div style={{ fontSize: '0.82rem', color: '#d1d5db', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{complaint.summary || 'Summary unavailable'}"
                </div>
              </div>

              {/* Keywords */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 6 }}>
                  Extracted Keywords
                </div>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {complaint.keywords?.length > 0 ? (
                    complaint.keywords.map(kw => (
                      <span key={kw} className="keyword-tag">{kw}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None extracted</span>
                  )}
                </div>
              </div>

              {/* Entities */}
              {complaint.entities?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 6 }}>
                    Recognized Entities
                  </div>
                  <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                    {complaint.entities.map((e, i) => (
                      <span key={i} className="entity-tag">
                        <span>{e.text}</span>
                        <span className="entity-type">{e.type}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Student action to withdraw */}
          {role === 'student' && complaint.status === 'Pending' && (
            <button className="btn btn-danger w-full justify-center" onClick={handleWithdraw} style={{ gap: 8, padding: '10px' }}>
              <Trash2 size={15} /> Withdraw Complaint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
