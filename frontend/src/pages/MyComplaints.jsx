import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badges';

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
    <div className="animate-fade-in">
      <h1 className="page-title">My Complaints</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        History of all complaints you've submitted.
      </p>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : complaints.length === 0 ? (
        <div className="glass-card empty-state">
          <h3>No complaints found</h3>
          <p>You haven't submitted any complaints yet.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {complaints.map(c => (
            <Link key={c.id} to={`/complaints/${c.id}`} className="glass-card" style={{ padding: '20px 24px', display: 'block' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }} className="truncate">
                {c.description}
              </p>
              <div className="flex items-center gap-4" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>ID: {c.complaintId}</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                <span style={{ color: 'var(--primary-light)' }}>{c.category} • {c.subcategory}</span>
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
