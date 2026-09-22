import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { 
  FileText, CheckCircle2, AlertTriangle, Clock, 
  ArrowRight, Shield, BarChart2 
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
        padding: '28px 30px',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8', fontSize: '0.74rem', fontWeight: 600, marginBottom: 8 }}>
            <Shield size={13} /> Administrative Console
          </div>
          <h1 className="page-title" style={{ fontSize: '1.85rem' }}>Campus Overview</h1>
          <p className="page-subtitle">
            Real-time status tracking, NLP automated triage, and complaint distribution metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/complaints" className="btn btn-primary" style={{ gap: 8 }}>
            <FileText size={15} /> Complaints
          </Link>
          <Link to="/admin/analytics" className="btn btn-ghost" style={{ gap: 8 }}>
            <BarChart2 size={15} /> Analytics
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <div className="stat-label">Total Received</div>
            <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#9ca3af' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 12 }}>{stats.total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>All campus tickets</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <div className="stat-label">Pending Review</div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 12, color: '#fbbf24' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Awaiting review</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <div className="stat-label">In Progress</div>
            <div className="stat-icon" style={{ background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 12, color: '#2dd4bf' }}>{stats.in_progress}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Assigned tickets</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <div className="stat-label">Resolved</div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 12, color: '#34d399' }}>{stats.resolved}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Completed tickets</div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="glass-card" style={{ padding: '24px 26px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>Recent Activity Feed</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest submissions processed by the pipeline</p>
          </div>
          <Link to="/admin/complaints" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <span>View All</span> <ArrowRight size={13} />
          </Link>
        </div>
        
        {recent.length === 0 ? (
          <div className="empty-state">
            <h3>No complaints logged</h3>
            <p>No student grievances have been registered in the system yet.</p>
          </div>
        ) : (
          <div className="flex-col gap-2">
            {recent.map(c => (
              <Link 
                key={c.id} 
                to={`/complaints/${c.id}`} 
                className="interactive-card flex items-center justify-between" 
                style={{ 
                  padding: '14px 18px', 
                  background: '#14161b', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  borderLeft: c.priority === 'Critical' ? '3px solid #ef4444' : c.priority === 'High' ? '3px solid #f59e0b' : '1px solid var(--border)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem', marginBottom: 3, color: '#f3f4f6' }} className="truncate">
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', color: '#9ca3af' }}>#{c.complaintId}</span>
                    <span>•</span>
                    <span style={{ color: '#d1d5db' }}>{c.category}</span>
                    <span>•</span>
                    <span>By: <strong style={{ color: '#f3f4f6' }}>{c.studentName || 'Student'}</strong></span>
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
