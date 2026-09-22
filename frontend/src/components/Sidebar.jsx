import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BarChart2, Users, Settings,
  LogOut, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/admin/complaints', icon: FileText,         label: 'Complaints'  },
  { to: '/admin/analytics',  icon: BarChart2,        label: 'Analytics'   },
];

const studentLinks = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/submit',         icon: FileText,         label: 'New Complaint' },
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

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      padding: '20px 12px',
    }}>
      {/* Logo */}
      <div style={{ padding: '8px 12px 24px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.2 }} className="gradient-text">
          APSIT
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Complaint Analyzer
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           10,
                padding:       '10px 14px',
                borderRadius:  'var(--radius-md)',
                fontSize:      '0.875rem',
                fontWeight:    500,
                color:         active ? '#fff' : 'var(--text-secondary)',
                background:    active ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                transition:    'var(--transition)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={17} />
              {label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
        <div style={{ padding: '10px 14px', marginBottom: 8 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userDoc?.name || user?.displayName || 'User'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
            {role}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', gap: 10, padding: '9px 14px' }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
