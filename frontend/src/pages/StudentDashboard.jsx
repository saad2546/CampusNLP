import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, Clock, CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';
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
      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: '28px 30px',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.74rem', fontWeight: 600, marginBottom: 10 }}>
            Student Grievance Portal
          </div>
          <h1 className="page-title" style={{ fontSize: '1.85rem' }}>
            Welcome back, {studentFirstName}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.92rem' }}>
            Submit and track your campus issues with automated categorization and resolution tracking.
          </p>
        </div>

        <Link to="/submit" className="btn btn-primary" style={{ gap: 8, padding: '11px 20px' }}>
          <PlusCircle size={18} />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 30 }}>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <div className="stat-label">Total Submitted</div>
            <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#9ca3af' }}>
              <List size={20} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 12 }}>{complaints.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Registered tickets</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <div className="stat-label">In Progress</div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 12, color: '#fbbf24' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Under review or assigned</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <div className="stat-label">Resolved</div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-number" style={{ marginTop: 12, color: '#34d399' }}>{resolvedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Successfully addressed</div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>Recent Complaints</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest grievances processed through NLP</p>
        </div>
        {complaints.length > 0 && (
          <Link to="/my-complaints" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <span>View All</span> <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : complaints.length === 0 ? (
        <div className="glass-card empty-state">
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}>
            <MessageSquare size={24} color="#34d399" />
          </div>
          <h3>No complaints yet</h3>
          <p>You haven't submitted any complaints. Click "New Complaint" to log an issue.</p>
          <Link to="/submit" className="btn btn-primary" style={{ marginTop: 6 }}>
            <PlusCircle size={15} /> Submit Complaint
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
                padding: '18px 22px', 
                display: 'block',
                borderLeft: c.priority === 'Critical' ? '3px solid #ef4444' : c.priority === 'High' ? '3px solid #f59e0b' : '1px solid var(--border)'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 600, color: '#f9fafb' }}>{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 14, lineHeight: 1.5 }} className="truncate">
                {c.description}
              </p>
              <div className="flex items-center gap-3" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', color: '#9ca3af' }}>#{c.complaintId}</span>
                <span>•</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span style={{ color: '#d1d5db', fontWeight: 500 }}>{c.category}</span>
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
