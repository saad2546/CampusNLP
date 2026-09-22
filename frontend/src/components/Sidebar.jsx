import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BarChart2, PlusCircle,
  LogOut, ChevronRight, AlertCircle, Shield, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/admin/complaints', icon: FileText,         label: 'Complaints'  },
  { to: '/admin/analytics',  icon: BarChart2,        label: 'Analytics'   },
];

const studentLinks = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/submit',         icon: PlusCircle,       label: 'New Complaint' },
  { to: '/my-complaints',  icon: AlertCircle,      label: 'My Complaints' },
];

export function Sidebar() {
  const { role, user, userDoc, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = userDoc?.name || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #0d0e17 0%, #090a10 100%)',
      borderRight: '1px solid var(--border)',
      padding: '24px 16px',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
      zIndex: 10,
    }}>
      {/* Brand Header */}
      <div style={{ padding: '4px 12px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }} className="gradient-text">
              APSIT NLP
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Complaint Analyzer
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          padding: '0 12px 6px',
        }}>
          Navigation
        </div>

        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            12,
                padding:        '11px 16px',
                borderRadius:   'var(--radius-md)',
                fontSize:       '0.9rem',
                fontWeight:     active ? 600 : 500,
                color:          active ? '#ffffff' : 'var(--text-secondary)',
                background:     active 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(168, 85, 247, 0.9))' 
                  : 'transparent',
                boxShadow:      active ? '0 4px 20px rgba(99, 102, 241, 0.35)' : 'none',
                border:         active ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                transition:     'var(--transition)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { 
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => { 
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
              <span>{label}</span>
              {active && <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.8 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User profile + Logout card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        marginTop: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
            border: role === 'admin' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
            color: role === 'admin' ? '#c084fc' : '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}>
            {role === 'admin' ? <Shield size={16} /> : displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '0.88rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {displayName}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: role === 'admin' ? '#c084fc' : '#818cf8', 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em' 
            }}>
              {role === 'admin' ? '👑 Admin' : '🎓 Student'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-ghost w-full"
          style={{ 
            padding: '8px 12px', 
            fontSize: '0.8rem', 
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
