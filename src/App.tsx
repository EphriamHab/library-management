import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import RegisterPage from './components/pages/RegisterPage';
import LoginPage from './components/pages/LoginPage';
import Layout from './components/layout/Layout';
import MemberDashboard from './components/pages/MemberDashboard'; 
import BooksPage from './components/pages/BooksPage';
import MembersPage from './components/pages/MembersPage';
import LoansPage from './components/pages/LoansPage';
import ReportsPage from './components/pages/ReportsPage';
import Settings from './components/pages/Settings';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import ReservationsPage from './components/pages/ReservationsPage';
import MyReservationsPage from './components/pages/MyReservationsPage';
import MyLoansPage from './components/pages/MyLoansPage';
import MemberBooksPage from './components/pages/MemberBooksPage';
import Dashboard from './components/pages/Dashboard';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
    children, 
    allowedRoles 
  }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user?.roles) {
      const hasPermission = allowedRoles.some(role => user.roles.includes(role));
      if (!hasPermission) {
        return <Navigate to="/dashboard" replace />;
      }
    }

    return <>{children}</>;
  };

  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
  };

  const getDashboardComponent = () => {
    if (!user?.roles) return <Navigate to="/login" replace />;
    
    if (user.roles.includes('Library Member')) {
      return <MemberDashboard />;
    } else if (user.roles.includes('Library Admin') || user.roles.includes('Librarian')) {
      return <Dashboard />;
    }
    
    return <Navigate to="/login" replace />;
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
        <Route path="dashboard" element={getDashboardComponent()} />
        
        {/* Admin and Librarian Routes */}
        <Route 
          path="books" 
          element={
            <ProtectedRoute allowedRoles={['Library Admin', 'Librarian']}>
              <BooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="members" 
          element={
            <ProtectedRoute allowedRoles={['Library Admin', 'Librarian']}>
              <MembersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="loans" 
          element={
            <ProtectedRoute allowedRoles={['Library Admin', 'Librarian']}>
              <LoansPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="reservations" 
          element={
            <ProtectedRoute allowedRoles={['Library Admin', 'Librarian']}>
              <ReservationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute allowedRoles={['Library Admin', 'Librarian']}>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="browse-books" 
          element={
            <ProtectedRoute allowedRoles={['Library Member']}>
              <MemberBooksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-loans" 
          element={
            <ProtectedRoute allowedRoles={['Library Member']}>
              <MyLoansPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-reservations" 
          element={
            <ProtectedRoute allowedRoles={['Library Member']}>
              <MyReservationsPage />
            </ProtectedRoute>
          } 
        />

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