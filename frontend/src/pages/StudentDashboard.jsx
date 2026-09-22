import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, Clock, CheckCircle } from 'lucide-react';
import { getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';

export function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userDoc } = useAuth();

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

  const pendingCount = complaints.filter(c => c.status === 'Pending' || c.status === 'Under Review' || c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: 30 }}>
        <div>
          <h1 className="page-title">Welcome, {userDoc?.name?.split(' ')[0] || 'Student'}</h1>
          <p className="page-subtitle">Manage and track your college complaints</p>
        </div>
        <Link to="/submit" className="btn btn-primary">
          <PlusCircle size={18} /> New Complaint
        </Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)' }}>
            <List size={20} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="stat-number">{complaints.length}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            <Clock size={20} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="stat-number">{pendingCount}</div>
            <div className="stat-label">Active / Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            <CheckCircle size={20} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="stat-number">{resolvedCount}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Recent Complaints</h2>
      
      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : complaints.length === 0 ? (
        <div className="glass-card empty-state">
          <List size={40} />
          <div>
            <h3>No complaints yet</h3>
            <p>You haven't submitted any complaints. Click "New Complaint" to start.</p>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {complaints.map(c => (
            <Link key={c.id} to={`/complaints/${c.id}`} className="glass-card" style={{ padding: '20px 24px', display: 'block', transition: 'var(--transition)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }} className="truncate">
                {c.description}
              </p>
              <div className="flex items-center gap-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>ID: {c.complaintId}</span>
                <span>•</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span style={{ color: 'var(--primary-light)' }}>{c.category}</span>
                <span>•</span>
                <PriorityBadge priority={c.priority} />
              </div>
            </Link>
          ))}
          {complaints.length >= 5 && (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Link to="/my-complaints" className="btn btn-ghost">View All Complaints</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
