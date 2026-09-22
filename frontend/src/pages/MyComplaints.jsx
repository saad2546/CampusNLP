import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badges';
import { PlusCircle, FileText, ArrowRight, MessageSquare, Clock } from 'lucide-react';

export function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await getComplaints({ limit: 100 });
        setComplaints(res.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="page-title">My Registered Complaints</h1>
          <p className="page-subtitle">
            Track status updates, administrative actions, and resolution progress.
          </p>
        </div>

        <Link to="/submit" className="btn btn-primary" style={{ gap: 8 }}>
          <PlusCircle size={18} /> New Complaint
        </Link>
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
          <h3>No complaints registered</h3>
          <p>You haven't submitted any complaints yet. Whenever you experience an issue, log it here.</p>
          <Link to="/submit" className="btn btn-primary" style={{ marginTop: 8 }}>
            <PlusCircle size={16} /> File a Complaint
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
                <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: '#f8fafc' }}>{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.5 }} className="truncate">
                {c.description}
              </p>
              <div className="flex items-center gap-4" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', color: '#c7d2fe' }}>#{c.complaintId}</span>
                <span>•</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span style={{ color: 'var(--primary-light)', fontWeight: 500 }}>{c.category} • {c.subcategory}</span>
                <span>•</span>
                <PriorityBadge priority={c.priority} />
                <SentimentBadge sentiment={c.sentiment} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
