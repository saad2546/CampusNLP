import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, role, loading } = useAuth();

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
