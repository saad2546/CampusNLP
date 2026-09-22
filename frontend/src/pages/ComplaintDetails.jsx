import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaint, withdrawComplaint, updateStatus, respondComplaint, assignComplaint } from '../services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';
import { Trash2, Send, Save } from 'lucide-react';

export function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
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
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to withdraw');
    }
  };

  const handleAdminUpdate = async () => {
    try {
      if (status !== complaint.status) await updateStatus(id, status);
      if (department !== complaint.assignedDepartment) await assignComplaint(id, department);
      if (adminResponse && adminResponse !== complaint.adminResponse) await respondComplaint(id, adminResponse);
      alert('Updated successfully');
      // reload
      const res = await getComplaint(id);
      setComplaint(res.data);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!complaint) return <div>Not found</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="flex justify-between items-start" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Complaint #{complaint.complaintId}</h1>
          <div className="flex items-center gap-3" style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Submitted on {new Date(complaint.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>By: {complaint.studentName || 'Student'}</span>
          </div>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Left Column - Main Content */}
        <div className="flex-col gap-6">
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>{complaint.title}</h2>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
              {complaint.description}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Administration Response</h3>
            {complaint.adminResponse ? (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                {complaint.adminResponse}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No response yet.
              </div>
            )}
          </div>

          {/* Admin Controls */}
          {role === 'admin' && (
            <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(99,102,241,0.3)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--primary-light)' }}>Admin Controls</h3>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
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
                  <input type="text" className="form-input" value={department} onChange={e => setDepartment(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Response to Student</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }} value={adminResponse} onChange={e => setAdminResponse(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={handleAdminUpdate}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Right Column - NLP Analysis */}
        <div className="flex-col gap-4">
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 16 }}>
              NLP Analysis
            </h3>
            
            <div className="flex-col gap-4">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Category</div>
                <div style={{ fontWeight: 600 }}>{complaint.category}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{complaint.subcategory}</div>
              </div>
              
              <div className="flex gap-2">
                <PriorityBadge priority={complaint.priority} />
                <SentimentBadge sentiment={complaint.sentiment} />
              </div>

              {complaint.is_duplicate && (
                <div className="alert alert-warning" style={{ fontSize: '0.75rem', padding: 8 }}>
                  ⚠️ Potential Duplicate Detected
                </div>
              )}

              <div className="divider" style={{ margin: '8px 0' }}></div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Extracted Keywords</div>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {complaint.keywords?.map(kw => (
                    <span key={kw} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>

              {complaint.entities?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, marginTop: 8 }}>Entities</div>
                  <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                    {complaint.entities.map((e, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                        {e.text} <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>({e.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="divider" style={{ margin: '8px 0' }}></div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>AI Summary</div>
                <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--primary-light)' }}>
                  "{complaint.summary}"
                </div>
              </div>

            </div>
          </div>

          {role === 'student' && complaint.status === 'Pending' && (
            <button className="btn btn-danger w-full justify-center" onClick={handleWithdraw}>
              <Trash2 size={16} /> Withdraw Complaint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
