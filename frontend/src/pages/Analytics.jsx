import { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import { 
  getCategories, getSentiment, getPriority, 
  getTrends, getResolution, getDepartments 
} from '../services/api';
import { PieChart as PieIcon, BarChart3, TrendingUp, Brain } from 'lucide-react';

const COLORS = ['#10b981', '#06b6d4', '#64748b', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#a1a1aa'];
const SENTIMENT_COLORS = { 'Positive': '#10b981', 'Neutral': '#64748b', 'Negative': '#ef4444' };
const PRIORITY_COLORS = { 'Critical': '#ef4444', 'High': '#f59e0b', 'Medium': '#38bdf8', 'Low': '#64748b' };

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
    <div className="animate-fade-in" style={{ paddingBottom: 50 }}>
      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: '28px 30px',
        marginBottom: 28,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.74rem', fontWeight: 600, marginBottom: 8 }}>
          <Brain size={13} /> Machine Learning Insights
        </div>
        <h1 className="page-title" style={{ fontSize: '1.85rem' }}>Grievance Analytics</h1>
        <p className="page-subtitle">
          Data trends derived from TF-IDF categorizations, sentiment polarity, and resolution timeframes.
        </p>
      </div>

      {/* Resolution KPIs */}
      {data.resolution && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 26 }}>
          <div className="stat-card">
            <div className="stat-label">Total Complaints</div>
            <div className="stat-number" style={{ marginTop: 10 }}>{data.resolution.total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>All registered tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Resolved Tickets</div>
            <div className="stat-number" style={{ marginTop: 10, color: '#34d399' }}>{data.resolution.resolved}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Completed campus grievances</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Resolution Efficiency</div>
            <div className="stat-number" style={{ marginTop: 10, color: '#38bdf8' }}>{data.resolution.resolution_rate}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Resolution rate ratio</div>
          </div>
        </div>
      )}

      {/* Visualizations */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Category Pie */}
        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <PieIcon size={17} color="#34d399" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f9fafb' }}>Complaints by Category</h3>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  paddingAngle={2}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#171920', border: '1px solid #282c37', borderRadius: 6, color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <BarChart3 size={17} color="#fbbf24" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f9fafb' }}>Priority Distribution</h3>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priority} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f232d" />
                <XAxis dataKey="priority" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                  contentStyle={{ background: '#171920', border: '1px solid #282c37', borderRadius: 6, color: '#fff' }} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.priority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Sentiment Analysis Donut */}
        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f9fafb' }}>Sentiment Distribution (VADER)</h3>
          </div>
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
                  outerRadius={90}
                  paddingAngle={3}
                  label
                >
                  {data.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#171920', border: '1px solid #282c37', borderRadius: 6, color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Trends */}
        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <TrendingUp size={17} color="#34d399" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f9fafb' }}>Complaint Trends</h3>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f232d" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#171920', border: '1px solid #282c37', borderRadius: 6, color: '#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
