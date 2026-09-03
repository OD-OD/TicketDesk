import { Navigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function ProtectedRoute({ children }) {
  const [token] = useLocalStorage('token', null);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}