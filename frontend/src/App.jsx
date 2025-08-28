import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Dashboard from './pages/Dashboard';
import Letters from './pages/Letters';
import CreateLetter from './pages/CreateLetter';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <PrivateRoute roles={['staff']}>
                  <StaffDashboard />
                </PrivateRoute>
              }
            />

            {/* Shared Routes */}
            <Route
              path="/letters"
              element={
                <PrivateRoute roles={['admin', 'staff']}>
                  <ErrorBoundary>
                    <Letters />
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />

            <Route
              path="/letters/new"
              element={
                <PrivateRoute roles={['admin', 'staff']}>
                  <CreateLetter />
                </PrivateRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
