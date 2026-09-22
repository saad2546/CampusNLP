import { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import { 
  getCategories, getSentiment, getPriority, 
  getTrends, getResolution, getDepartments 
} from '../services/api';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];
const SENTIMENT_COLORS = { 'Positive': '#10b981', 'Neutral': '#94a3b8', 'Negative': '#ef4444' };
const PRIORITY_COLORS = { 'Critical': '#ef4444', 'High': '#f59e0b', 'Medium': '#3b82f6', 'Low': '#94a3b8' };

export function Analytics() {
  const [data, setData] = useState({
    categories: [],
    sentiment: [],
    priority: [],
    trends: [],
    departments: [],
    resolution: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [catRes, sentRes, prioRes, trendRes, resRes, deptRes] = await Promise.all([
          getCategories(),
          getSentiment(),
          getPriority(),
          getTrends(),
          getResolution(),
          getDepartments(),
        ]);
        
        setData({
          categories: catRes.data,
          sentiment: sentRes.data,
          priority: prioRes.data,
          trends: trendRes.data,
          resolution: resRes.data,
          departments: deptRes.data,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        Data-driven insights from the NLP pipeline
      </p>

      {/* Top Stats */}
      {data.resolution && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-number">{data.resolution.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{data.resolution.resolved}</div>
            <div className="stat-label">Resolved Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{data.resolution.resolution_rate}%</div>
            <div className="stat-label">Resolution Rate</div>
          </div>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Category Pie */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Complaints by Category</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Bar */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Priority Distribution</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priority} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="priority" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.priority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Sentiment Donut */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Sentiment Analysis</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentiment}
                  dataKey="count"
                  nameKey="sentiment"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {data.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>Complaint Trends</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, fill: 'var(--primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
