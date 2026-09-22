import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, compRes] = await Promise.all([
          getDashboard(),
          getComplaints({ limit: 10 })
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
  if (!stats) return <div>Error loading dashboard</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        Overview of all college complaints
      </p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
            <FileText size={20} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
            <Users size={20} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="stat-number">{stats.in_progress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            <CheckCircle size={20} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.1rem' }}>Recent Activity</h2>
          <Link to="/admin/complaints" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        
        <div className="flex-col gap-2">
          {recent.map(c => (
            <Link key={c.id} to={`/complaints/${c.id}`} className="flex items-center justify-between" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: 2 }} className="truncate">{c.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {c.complaintId} • {c.category} • {c.studentName || 'Student'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
