import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import RegisterPage from './components/pages/RegisterPage';
import LoginPage from './components/pages/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import BooksPage from './components/pages/BooksPage';
import MembersPage from './components/pages/MembersPage';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';


function App() {

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="loans" element={<div>Loans Page (Coming Soon)</div>} />
        <Route path="reports" element={<div>Reports Page (Coming Soon)</div>} />
        <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>


  )
}

export default App
