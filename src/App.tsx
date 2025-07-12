// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import RegisterPage from './components/pages/RegisterPage';
import LoginPage from './components/pages/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import BooksPage from './components/pages/BooksPage';
import MembersPage from './components/pages/MembersPage';
import LoansPage from './components/pages/LoansPage';
import ReportsPage from './components/pages/ReportsPage';
import Settings from './components/pages/Settings';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
        }
      />
    </Routes>
  );
}

export default App;