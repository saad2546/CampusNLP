import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, Clock, CheckCircle2, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';

export function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userDoc, user } = useAuth();

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await getComplaints({ limit: 5 });
        setComplaints(res.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  const pendingCount = complaints.filter(c => ['Pending', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const studentFirstName = (userDoc?.name || user?.displayName || user?.email || 'Student').split(' ')[0];

  return (
    <div className="animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="glass-card" style={{
        padding: '32px 36px',
        marginBottom: 32,
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(22, 24, 45, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ maxWidth: 580 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.35)', color: '#c7d2fe', fontSize: '0.78rem', fontWeight: 600, marginBottom: 12 }}>
            <Sparkles size={14} color="#818cf8" /> AI-Powered Campus Grievance System
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>
            Welcome back, <span className="gradient-text">{studentFirstName}</span>
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.96rem', marginTop: 8, color: '#94a3b8' }}>
            Submit issues, monitor live resolution status, and get automated NLP categorization.
          </p>
        </div>

        <Link to="/submit" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
          <PlusCircle size={20} />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20, marginBottom: 36 }}>
        <div className="stat-card" style={{ '--glow-color': 'rgba(99, 102, 241, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div className="stat-label">Total Submitted</div>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <List size={22} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 14 }}>{complaints.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Registered tickets</div>
        </div>

        <div className="stat-card" style={{ '--glow-color': 'rgba(245, 158, 11, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div className="stat-label">Active / In Progress</div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 14, color: '#fbbf24' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Under review or assigned</div>
        </div>

        <div className="stat-card" style={{ '--glow-color': 'rgba(16, 185, 129, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div className="stat-label">Resolved</div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 14, color: '#34d399' }}>{resolvedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Successfully addressed</div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Recent Complaints</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest grievances processed through NLP</p>
        </div>
        {complaints.length > 0 && (
          <Link to="/my-complaints" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <span>View All</span> <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : complaints.length === 0 ? (
        <div className="glass-card empty-state">
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <MessageSquare size={28} color="#818cf8" />
          </div>
          <h3>No complaints yet</h3>
          <p>You haven't submitted any complaints. Click "New Complaint" above to submit your first issue.</p>
          <Link to="/submit" className="btn btn-primary" style={{ marginTop: 8 }}>
            <PlusCircle size={16} /> Submit Complaint
          </Link>
        </div>
      ) : (
        <div className="flex-col gap-3">
          {complaints.map(c => (
            <Link 
              key={c.id} 
              to={`/complaints/${c.id}`} 
              className="glass-card interactive-card" 
              style={{ 
                padding: '20px 24px', 
                display: 'block',
                borderLeft: c.priority === 'Critical' ? '4px solid #ef4444' : c.priority === 'High' ? '4px solid #f59e0b' : '1px solid var(--border)'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.5 }} className="truncate">
                {c.description}
              </p>
              <div className="flex items-center gap-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', color: '#c7d2fe' }}>#{c.complaintId}</span>
                <span>•</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span style={{ color: '#a5b4fc', fontWeight: 500 }}>{c.category}</span>
                <span>•</span>
                <PriorityBadge priority={c.priority} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
