import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints } from '../services/api';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../components/Badges';
import { Filter, Search, RotateCcw, FileText } from 'lucide-react';

export function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleResetFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setSearchQuery('');
  };

  const filteredComplaints = complaints.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.complaintId?.toLowerCase().includes(q) ||
      c.studentName?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 className="page-title">Complaint Management</h1>
          <p className="page-subtitle">
            Filter, search, inspect, and update grievance tickets submitted across all departments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            gap: 8,
            width: 260
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search keyword or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                width: '100%'
              }}
            />
          </div>

          {(statusFilter || priorityFilter || categoryFilter || searchQuery) && (
            <button onClick={handleResetFilters} className="btn btn-ghost btn-sm" title="Reset Filters" style={{ gap: 6 }}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '18px 24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Filter size={15} color="#818cf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c7d2fe' }}>
            Filter by Pipeline Tags
          </span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="form-group">
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

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="Critical">⚡ Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-group">
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
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : filteredComplaints.length === 0 ? (
        <div className="glass-card empty-state">
          <FileText size={38} color="#64748b" />
          <h3>No matching complaints</h3>
          <p>Try clearing your search query or selecting different filters.</p>
        </div>
      ) : (
        <div className="flex-col gap-3">
          {filteredComplaints.map(c => (
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
                <span>By: <strong style={{ color: '#cbd5e1' }}>{c.studentName || 'Student'}</strong></span>
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
