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
import LoansPage from './components/pages/LoansPage';
import ReportsPage from './components/pages/ReportsPage';
import Settings from './components/pages/Settings';


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
        <Route path="loans" element={<LoansPage/> } />
        <Route path="reports" element={ <ReportsPage/>} />
        <Route path="settings" element={<Settings/>} />
      </Route>
    </Routes>


  )
}

export default App
