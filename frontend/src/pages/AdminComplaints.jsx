import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badges';

export function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    async function fetchComplaints() {
      try {
        setLoading(true);
        const params = { limit: 100 };
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        if (categoryFilter) params.category = categoryFilter;

        const res = await getComplaints(params);
        setComplaints(res.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, [statusFilter, priorityFilter, categoryFilter]);

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">All Complaints</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        Manage and resolve student complaints
      </p>

      {/* Filters */}
      <div className="glass-card flex gap-4" style={{ padding: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ minWidth: 200 }}>
          <label className="form-label">Status</label>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 200 }}>
          <label className="form-label">Priority</label>
          <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 200 }}>
          <label className="form-label">Category</label>
          <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Academics">Academics</option>
            <option value="Examination">Examination</option>
            <option value="Faculty">Faculty</option>
            <option value="Hostel">Hostel</option>
            <option value="IT Services">IT Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : complaints.length === 0 ? (
        <div className="glass-card empty-state">
          <h3>No complaints found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {complaints.map(c => (
            <Link key={c.id} to={`/complaints/${c.id}`} className="glass-card" style={{ padding: '20px 24px', display: 'block', borderLeft: c.priority === 'Critical' ? '4px solid #ef4444' : c.priority === 'High' ? '4px solid #f59e0b' : 'none' }}>
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
                <span>By: {c.studentName}</span>
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
