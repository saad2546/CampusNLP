import { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  getCategories, getSentiment, getPriority, 
  getTrends, getResolution, getDepartments 
} from '../services/api';
import { Sparkles, PieChart as PieIcon, BarChart3, TrendingUp, CheckCircle, Brain } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#a855f7'];
const SENTIMENT_COLORS = { 'Positive': '#10b981', 'Neutral': '#94a3b8', 'Negative': '#ef4444' };
const PRIORITY_COLORS = { 'Critical': '#ef4444', 'High': '#f59e0b', 'Medium': '#38bdf8', 'Low': '#94a3b8' };

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
        padding: '30px 34px',
        marginBottom: 32,
        background: 'linear-gradient(135deg, rgba(20, 24, 50, 0.75) 0%, rgba(15, 17, 30, 0.85) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', color: '#c7d2fe', fontSize: '0.78rem', fontWeight: 600, marginBottom: 10 }}>
          <Brain size={14} color="#818cf8" /> Machine Learning Intelligence
        </div>
        <h1 className="page-title" style={{ fontSize: '2rem' }}>Analytics & NLP Distribution</h1>
        <p className="page-subtitle" style={{ color: '#94a3b8' }}>
          Data patterns derived from TF-IDF classification, VADER sentiment scoring, and operational resolution tracking.
        </p>
      </div>

      {/* Top Resolution KPIs */}
      {data.resolution && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 30 }}>
          <div className="stat-card" style={{ '--glow-color': 'rgba(99, 102, 241, 0.2)' }}>
            <div className="stat-label">Total Volume</div>
            <div className="stat-number" style={{ marginTop: 12 }}>{data.resolution.total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>All registered tickets</div>
          </div>
          <div className="stat-card" style={{ '--glow-color': 'rgba(16, 185, 129, 0.2)' }}>
            <div className="stat-label">Resolved Tickets</div>
            <div className="stat-number" style={{ marginTop: 12, color: '#34d399' }}>{data.resolution.resolved}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Resolved campus grievances</div>
          </div>
          <div className="stat-card" style={{ '--glow-color': 'rgba(6, 182, 212, 0.2)' }}>
            <div className="stat-label">Resolution Efficiency</div>
            <div className="stat-number" style={{ marginTop: 12, color: '#38bdf8' }}>{data.resolution.resolution_rate}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Resolution rate ratio</div>
          </div>
        </div>
      )}

      {/* Primary Visualizations */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Category Pie */}
        <div className="glass-card" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <PieIcon size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Complaints by Category</h3>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#121420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="glass-card" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BarChart3 size={18} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Priority Distribution</h3>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priority} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="priority" stroke="var(--text-secondary)" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }} 
                  contentStyle={{ background: '#121420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.priority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
        {/* Sentiment Analysis Donut */}
        <div className="glass-card" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Sparkles size={18} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Sentiment Polarity (VADER)</h3>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentiment}
                  dataKey="count"
                  nameKey="sentiment"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  label
                >
                  {data.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#121420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Trends */}
        <div className="glass-card" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Submission Trends</h3>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#121420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
