import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ roles, children }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;

  return children;
}
