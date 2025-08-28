import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect based on user role
  if (user.role === 'admin') {
    return <Navigate to="/admin" />;
  } else if (user.role === 'staff') {
    return <Navigate to="/staff" />;
  }

  // Default redirect if role is not recognized
  return <Navigate to="/" />;
}
