import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { 
  Users, FileText, CheckCircle2, AlertTriangle, Clock, 
  ArrowRight, Shield, Sparkles, Filter 
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, compRes] = await Promise.all([
          getDashboard(),
          getComplaints({ limit: 8 })
        ]);
        setStats(dashRes.data);
        setRecent(compRes.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!stats) return <div className="alert alert-error">Error loading administrative dashboard.</div>;

  return (
    <div className="animate-fade-in">
      {/* Top Welcome Header */}
      <div className="glass-card" style={{
        padding: '30px 34px',
        marginBottom: 32,
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(20, 16, 38, 0.85) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(168, 85, 247, 0.35)', color: '#e9d5ff', fontSize: '0.78rem', fontWeight: 600, marginBottom: 10 }}>
            <Shield size={14} color="#c084fc" /> Admin Oversight Console
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Administration Overview</h1>
          <p className="page-subtitle" style={{ color: '#94a3b8' }}>
            Real-time status tracking, NLP automated triage, and complaint distribution metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/admin/complaints" className="btn btn-primary" style={{ gap: 8 }}>
            <FileText size={16} /> Manage Complaints
          </Link>
          <Link to="/admin/analytics" className="btn btn-ghost" style={{ gap: 8 }}>
            <Sparkles size={16} /> NLP Insights
          </Link>
        </div>
      </div>

      {/* Modern Metrics Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 34 }}>
        <div className="stat-card" style={{ '--glow-color': 'rgba(56, 189, 248, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div className="stat-label">Total Received</div>
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <FileText size={22} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 14 }}>{stats.total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>All campus tickets</div>
        </div>

        <div className="stat-card" style={{ '--glow-color': 'rgba(245, 158, 11, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div className="stat-label">Pending Triage</div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 14, color: '#fbbf24' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Awaiting review</div>
        </div>

        <div className="stat-card" style={{ '--glow-color': 'rgba(168, 85, 247, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div className="stat-label">In Progress</div>
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 14, color: '#c084fc' }}>{stats.in_progress}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Assigned to staff</div>
        </div>

        <div className="stat-card" style={{ '--glow-color': 'rgba(16, 185, 129, 0.2)' }}>
          <div className="flex justify-between items-center">
            <div className="stat-label">Resolved</div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 14, color: '#34d399' }}>{stats.resolved}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Completed tickets</div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="glass-card" style={{ padding: '28px 30px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Recent Activity Feed</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest submissions categorized by the pipeline</p>
          </div>
          <Link to="/admin/complaints" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <span>View All</span> <ArrowRight size={14} />
          </Link>
        </div>
        
        {recent.length === 0 ? (
          <div className="empty-state">
            <h3>No complaints logged</h3>
            <p>No student grievances have been registered in the system yet.</p>
          </div>
        ) : (
          <div className="flex-col gap-3">
            {recent.map(c => (
              <Link 
                key={c.id} 
                to={`/complaints/${c.id}`} 
                className="interactive-card flex items-center justify-between" 
                style={{ 
                  padding: '16px 20px', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-light)',
                  borderLeft: c.priority === 'Critical' ? '4px solid #ef4444' : c.priority === 'High' ? '4px solid #f59e0b' : '1px solid var(--border-light)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: 4, color: '#f8fafc' }} className="truncate">
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', color: '#c7d2fe' }}>#{c.complaintId}</span>
                    <span>•</span>
                    <span style={{ color: '#94a3b8' }}>{c.category}</span>
                    <span>•</span>
                    <span>By: <strong style={{ color: '#cbd5e1' }}>{c.studentName || 'Student'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
