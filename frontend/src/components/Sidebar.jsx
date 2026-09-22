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
      width: '250px',
      minWidth: '250px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      padding: '22px 14px',
      zIndex: 10,
    }}>
      {/* Brand Header */}
      <div style={{ padding: '4px 10px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#092116',
          }}>
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#f3f4f6' }}>
              APSIT Portal
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Complaint Analyzer
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ 
          fontSize: '0.68rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          padding: '0 10px 6px',
        }}>
          Menu
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
                padding:        '9px 14px',
                borderRadius:   'var(--radius-md)',
                fontSize:       '0.88rem',
                fontWeight:     active ? 600 : 500,
                color:          active ? '#ffffff' : 'var(--text-secondary)',
                background:     active ? '#242934' : 'transparent',
                border:         active ? '1px solid #374151' : '1px solid transparent',
                transition:     'var(--transition)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { 
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
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
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} color={active ? '#34d399' : 'currentColor'} />
              <span>{label}</span>
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User profile + Logout card */}
      <div style={{
        background: '#14161b',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        marginTop: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: role === 'admin' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: role === 'admin' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: role === 'admin' ? '#38bdf8' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}>
            {role === 'admin' ? <Shield size={15} /> : displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '0.84rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {displayName}
            </div>
            <div style={{ 
              fontSize: '0.68rem', 
              color: role === 'admin' ? '#38bdf8' : '#34d399', 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em' 
            }}>
              {role === 'admin' ? 'Admin' : 'Student'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-ghost w-full"
          style={{ 
            padding: '7px 10px', 
            fontSize: '0.78rem', 
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
